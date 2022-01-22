//This script is injected into every page.
//Functions are in sequential order

let homeworkCheckerSchoologyConfig={
    verbose: true //whether or not to show console messages
}

window.addEventListener('load', determineSchoologyPageType, false); //wait for DOM elements to load

// <Modify console.log() and console.error()
// let ogConsoleLog=console.log;
// console.log=(...args)=>{
//     if (homeworkCheckerSchoologyConfig.verbose)
//         ogConsoleLog(`ⓢ`, ...args);
// };
// let ogConsoleError=console.error;
// console.error=(...args)=>{
//     if (homeworkCheckerSchoologyConfig.verbose)
//     ogConsoleError(`ⓢ`, ...args);
// };
// />

function executeAfterDoneLoading(callback) {
    let intervalID=setInterval(()=>{
        let isLoading=document.querySelector('.upcoming-list>.refresh-wrapper img[alt="Loading"]')!=null;
        if (isLoading) {
            // Continue waiting
            console.log('Loading...')
        } else {
            clearInterval(intervalID); //stop interval
            
            setTimeout(()=>{ //wait another .01 seconds for assignmentEls to render on DOM
                callback();
            }, 10)
        }
    }, 100);
}

function determineSchoologyPageType() { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict(); //schoology also has its own jQuery, so use `jQuery` instead of `$` to avoid conflict
    // console.log('1. Extension running');
    //Calendar
    const hasSchoologyScripts=document.querySelectorAll(`script[src*='schoology.com']`); //schoology page
    
    if (hasSchoologyScripts) { //schoology page (determine which one)
        const hasCalendar=document.querySelector('#fcalendar'); //calendar page
        const urlHasCalendar=window.location.pathname.includes('calendar');
        if (hasCalendar && urlHasCalendar) { //type 1: schoology calendar
            waitForEventsLoaded();
        }

        //Not calendar
        else {
            let hasCourse=window.location.pathname.match(/\/course\/(\d+)\//);
            if (hasCourse) { //type 2: course materials page
                let courseID=hasCourse[1];
                executeAfterDoneLoading(()=>{
                    new CoursePage(courseID);
                })
            } else if (window.location.pathname.includes('home')) { //type 3: schoology home page
                let assignmentsAreLoading=true;
                executeAfterDoneLoading(()=>{
                    new HomePage();
                });
            } else { //Non-schoology-related page
                //pass
            }
        }
    }
}

function removeSpaces(input) { //for some reason, calendar page and home page have different course names spacing. 
    // Different spacing below:
    // "Algebra II (H): ALGEBRA II H - G"
    // "Algebra II (H) : ALGEBRA II H - G "

    let str='';
    for (let character of input) {
        if (character!==' ') {
            str+=character;
        }
    }
    return str;
}

//<h1> CALENDAR
//Resize event listener
function waitForEventsLoaded() { //waits for calendar's events to load before calling next
    let checkIfEventsLoaded=setInterval(()=>{
        let calendarEventsLoaded=jQuery('#fcalendar>div.fc-content>div.fc-view>div')[0].children.length>=3; //more than three assignments on calendar indicating assignments loaded
        if (calendarEventsLoaded) {
            clearInterval(checkIfEventsLoaded);
            console.log('3. Add checkmarks');
            // SchoologyCalendarPage();
            new CalendarPage();
        } else {
            console.log('Still waiting for calendar events to load');
        }
    }, 200);
}

class SchoologyPage { //abstract class; template for each page
    constructor({pageType, getAssignmentByNamePathEl, infoToBlockEl, checkPrev, ignoreOldAssignments}) {
        chrome.storage.sync.get('settings', ({settings})=>{
            if (settings.showCheckmarks==='onHover') {
                console.log('Only show checkmark on hover');
                
                //Load style if onlyShowCheckmarkOnHover
                let styleEl=document.createElement('style');
                styleEl.innerHTML=`
                    .j_check_cal {
                        visibility: hidden; /* all input checks hidden */
                    }
                    .fc-event:hover .j_check_cal { /* input check shown onhover of assignment */
                        visibility: visible;
                    }
                `;
                document.head.appendChild(styleEl);
            }
        });

        this.pageType=pageType; //indicates css class for checkbox
        this.getAssignmentByNamePathEl=getAssignmentByNamePathEl; //from where to search :contains() of an assignment by name
        this.infoToBlockEl=infoToBlockEl;
        this.checkPrev=checkPrev;
        this.ignoreOldAssignments=ignoreOldAssignments ?? true; //true by default. overridden by user input

        /*{
            courses, //'$all' | String of course name
            time //'any' | 'future'
        }*/

        //listens for `run $cmd` message from popup.js
        chrome.runtime.onMessage.addListener((msg, sender, response)=>{ 
            if (msg.hasOwnProperty('run')) {
                switch (msg.run) {
                    case 'reload':
                        location.reload();
                        break;
                    case 'check all assignments':
                        this.checkAllAssignments();
                        break;
                    case 'check all assignments before today':
                        this.checkAllAssignmentsBeforeToday();
                        break;
                    default:
                        console.error('Unknown run message:', msg.run)
                }
            }
        });
        //Sets this.checkedTasksGlobal to chrome storage
        this.checkedTasksGlobal;
        chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
            this.checkedTasksGlobal=checkedTasks;
            console.log('checkedTasks', checkedTasks);
            //checks previous assignments
            console.log(this.checkPrev)
            let courses=this.checkPrev.courses;
            let time=this.checkPrev.time;
            if (courses==='$all' && time==='any') { //calendar or home page
                for (let course in this.checkedTasksGlobal) {
                    let assignments=this.checkedTasksGlobal[course];
                    for (let assignmentEl of assignments) {
                        let [infoEl, blockEl]=this.getAssignmentByName(assignmentEl);
                        if (infoEl!=='No matches')
                            this.j_check(blockEl, false);
                    }
                }
            } else if (courses==='$all' && time==='future') { //not being used, potential if not prev assignments

            } else if (courses!=='$all' && time==='any') { //course page (all assignments of course)
                console.log(`Only checking the course: ${courses}`)
                if (this.checkPrev.courses in this.checkedTasksGlobal) { //if checked assignments of that course
                    let assignments=this.checkedTasksGlobal[courses];
                    console.log('Assignments', assignments);
                    for (let assignmentEl of assignments) {
                        let [infoEl, blockEl]=this.getAssignmentByName(assignmentEl);
                        if (infoEl!=='No matches')
                            this.j_check(blockEl, false);
                    }
                }
            }
        });
    }
    addCheckmarks({ //called in subclass' constructor, adds checkmarks to each assignment for clicking; checks those checkmarks based on chrome storage
        assignmentsContainer, //where the assignments are located
        customMiddleScript, //anonymous func executed in the middle
        locateElToAppendCheckmarkTo //determines how to add children els ie el=>el.parentNode
    }) {
        let children=assignmentsContainer.children;
        for (let assignmentEl of children) {
            let checkEl=document.createElement('input');
            checkEl.className=`j_check_${this.pageType}`;
            checkEl.type='checkbox';
            checkEl.addEventListener('change', ()=>{
                this.j_check(assignmentEl);
            });
            let toRun=customMiddleScript(checkEl, assignmentEl); //returns string to evaluate (rarely used)
            if (toRun==='continue')
                continue;
            
            locateElToAppendCheckmarkTo(assignmentEl).appendChild(checkEl);
        }
    }

    getAssignmentByName(assignmentName) { //returns DOMElement based on given string
        let query=`${this.getAssignmentByNamePathEl}:contains('${   assignmentName.replace(`'`, `\\'`) /* escape quote marks */  }')`;
        let queryRes=jQuery(query); //has info (course & event), identifier
        //jQuery's :contains() will match elements where assignmentName is a substring of the assignment. else if below handles overlaps
        
        let infoEl;
        if (queryRes.length===1) //only one matching elements 👍
            infoEl=queryRes[0];
        else if (queryRes.length>=2) { //2+ conflicting matches 🤏 so so  (needs processing to find right element)
            for (let i=0; i<queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue===assignmentName) { //if element's assignment title matches assignmentName, that is the right element
                    infoEl=queryRes[i];
                    break;
                }
            }
        } else { //returns if no matches 👎
            if (!this.ignoreOldAssignments) {
                console.error(`No elements matched ${assignmentName}`, {
                    errorInfo: {
                        getAssignmentByNamePathEl: this.getAssignmentByNamePathEl,
                        query,
                        queryRes,
                        infoEl
                    }
                }, 'This error may be caused by old assignments');
            }
            return ['No matches', 'No matches'];
        }
        
        let blockEl=this.infoToBlockEl(infoEl); //block (has styles)
        return [infoEl, blockEl];
    }

    j_check() {} //polymorphism allows this function to be specialized among each SchoologyPage subclass

    updateCheckedTasks(checkedTasksGlobal) { //updates chrome's storage with checked tasks parameter
        console.log('Updating to ', checkedTasksGlobal);
        chrome.storage.sync.set({checkedTasks: checkedTasksGlobal});
    }
    static checkedTasksGlobal; //holds the checkedTasks variable globally in the class
}

class CalendarPage extends SchoologyPage {
    constructor() {
        super({
            pageType: 'cal',
            getAssignmentByNamePathEl: 'span.fc-event-title>span',
            infoToBlockEl: el=>el.parentNode.parentNode.parentNode,
            checkPrev: {
                courses: '$all',
                time: 'any'
            }
        });
        
        //Disable window resizing because calendar re-renders when resizing, removing checkmarks
        function injectScript(path) {
            const script=document.createElement('script');
            script.src=path;
            document.body.appendChild(script);
        }
        injectScript(chrome.runtime.getURL('alter page/injected/remove window resize listener.js'));

        this.addCheckmarks({
            assignmentsContainer: document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode,
            customMiddleScript: (checkEl, assignmentEl)=>{
                jQuery(checkEl).on('click', e=>{ //prevent assignment dialog from opening when clicking checkmark
                    e.stopPropagation();
                });
            },
            locateElToAppendCheckmarkTo: el=>el
        });
    }

    checkAllAssignments() {
        let elementsByDate=jQuery(`span[class*='day-']`);
        for (let el of elementsByDate) {
            let assignmentEl=el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            if (assignmentEl!=null)
                this.j_check(assignmentEl, true, true); //forcedState is true
        }
    }

    checkAllAssignmentsBeforeToday() {
        let elementsByDate=jQuery(`span[class*='day-']`);
        let today=new Date().getDate();
        for (let el of elementsByDate) {
            let dayOfEl=parseInt(el.className.slice(-2))
            let beforeToday=dayOfEl<today;
            if (beforeToday) { //before today
                let assignmentEl=el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                if (assignmentEl!=null)
                    this.j_check(assignmentEl, true, true); //forcedState is true
            }
        }
    }

    j_check(assignmentEl, storeInChrome=true, forcedState) { //checks/unchecks passed in element
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior assignments from storage. is true all other times
        let pHighlight=assignmentEl.querySelector('.highlight-green'); //based on item inside assignment
        const checkmarkEl=assignmentEl.querySelector(`input.j_check_${this.pageType}`);
        let assignmentText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of assignment (firstChild), not including inside grandchildren like innerText()
        let courseText=assignmentEl.querySelector(`.fc-event-inner>.fc-event-title span[class*='realm-title']`).innerText; /* most child span can have class of realm-title-user or realm-title-course based on whether or not it is a personal event */
        courseText=removeSpaces(courseText);
        let newState=forcedState ?? pHighlight==null; //if user forced state, override newHighlight

        if (newState) { //no highlight green already
            console.log(`Checking ${assignmentText}`);
            //Check
            checkmarkEl.checked=true;
            let highlightGreen=document.createElement('div');
            highlightGreen.classList.add('highlight-green');
            highlightGreen.classList.add(`highlight-green-${this.pageType}`);
            
            assignmentEl.insertBefore(highlightGreen, assignmentEl.firstChild);
            
            if (storeInChrome) {
                if (courseText in this.checkedTasksGlobal) { //already exists, so append
                    this.checkedTasksGlobal[courseText].push(assignmentText);
                } else { //not exist, so create course log
                    this.checkedTasksGlobal[courseText]=[];
                    this.checkedTasksGlobal[courseText].push(assignmentText); //push to newly created class
                }
                this.updateCheckedTasks(this.checkedTasksGlobal);
            }
        } else {
            console.log(`Unchecking ${assignmentText}`);
            //Uncheck
            checkmarkEl.checked=false;
            assignmentEl.removeChild(pHighlight);
            
            // checkedTasksGlobal.pop(checkedTasksGlobal.indexOf(assignmentText));
            this.checkedTasksGlobal[courseText].pop(this.checkedTasksGlobal[courseText].indexOf(assignmentText));
            this.updateCheckedTasks(this.checkedTasksGlobal);
        }
    }
}

class CoursePage extends SchoologyPage { //materials page (one course)
    constructor(courseID) {
        let containerPath=`#course-events .upcoming-list .upcoming-events .upcoming-list`;
        let courseName=document.querySelector('#center-top>.page-title').innerText; //grabs course title
        courseName=removeSpaces(courseName);

        super({
            pageType: 'course',
            getAssignmentByNamePathEl: `${containerPath}>div[data-start]`, //searches inside assignment
            infoToBlockEl: el=>el,
            checkPrev: {
                courses: courseName,
                time: 'any'
            }
        });
        this.courseID=courseID;
        this.courseName=courseName;

        this.addCheckmarks({
            assignmentsContainer: document.querySelector(containerPath), //all assignments' container
            customMiddleScript: (checkEl, assignmentEl)=>{
                if (assignmentEl.classList.contains('date-header')) //does not add check to .date-header by continue;ing out of loop
                    return 'continue';
            },
            locateElToAppendCheckmarkTo: el=>el.firstChild
        });
    }
    j_check(assignmentEl, storeInChrome=true, forcedState) { //forceState forces the check to be true/false
        let pHighlight=assignmentEl.classList.contains('highlight-green'); //based on classList of assignmentEl
        let newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=assignmentEl.querySelector(`input.j_check_${this.pageType}`);
        let assignmentText=assignmentEl.querySelector('a').innerText;
        
        console.log({newHighlight: newState, pHighlight, checkmarkEl});

        if (newState) { //no highlight green already, so check
            console.log(`Checking ${assignmentText}`);
            //Check
            checkmarkEl.checked=true;
            assignmentEl.classList.add('highlight-green');
           
            if (storeInChrome) {
                if (this.courseName in this.checkedTasksGlobal) { //already exists, so append
                    this.checkedTasksGlobal[this.courseName].push(assignmentText);
                } else { //not exist, so create course log
                    this.checkedTasksGlobal[this.courseName]=[];
                    this.checkedTasksGlobal[this.courseName].push(assignmentText); //push to newly created class
                }
                this.updateCheckedTasks(this.checkedTasksGlobal);
            }
        } else { //uncheck
            console.log(`Unchecking ${assignmentText}`);
            checkmarkEl.checked=false;
            assignmentEl.classList.remove('highlight-green');
            
            try {
                this.checkedTasksGlobal[this.courseName].pop( //remove checkedTaskGlobal from list
                    this.checkedTasksGlobal[this.courseName].indexOf(assignmentText)
                );
                this.updateCheckedTasks(this.checkedTasksGlobal); //update
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.checkedTasksGlobal[this.courseName].pop(this.checkedTasksGlobal[this.courseName].indexOf(assignmentText));
                    this.updateCheckedTasks(this.checkedTasksGlobal);
                }, 1000);
            }
        }
    }
}

class HomePage extends SchoologyPage {
    constructor() {
        super({
            pageType: 'home',
            getAssignmentByNamePathEl: 'div.upcoming-events-wrapper>div.upcoming-list>div', //upcoming (also overdue assignments)
            infoToBlockEl: el=>el,
            checkPrev: {
                courses: '$all',
                time: 'any'
            }
        });
        let selector=`h4>span`;
        let containerClass='j_check_container';
        this.addCheckmarks({
            assignmentsContainer: document.querySelector('div.upcoming-events-wrapper>div.upcoming-list'),
            customMiddleScript: (checkEl, assignmentEl)=>{
                if (assignmentEl.classList.contains('date-header'))
                    return 'continue';
                else { //valid assignmment
                    let jCheckContainer=document.createElement('span');
                    jCheckContainer.classList.add(containerClass);
                    let parentNode=assignmentEl.querySelector(selector);
                    parentNode.insertBefore(jCheckContainer, parentNode.querySelector('span.upcoming-time'));
                }
            },
            locateElToAppendCheckmarkTo: el=>el.querySelector(`${selector} span.${containerClass}`),
        });
    }
    j_check(assignmentEl, storeInChrome=true, forcedState) {
        let pHighlight=assignmentEl.classList.contains('highlight-green'); //based on classList of assignmentEl
        let newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=assignmentEl.querySelector(`input.j_check_${this.pageType}`);
        let assignmentText=assignmentEl.querySelector('a').innerText;
        let courseText=assignmentEl.querySelector('h4>span').ariaLabel; //name of course based on aria-label of assignmentEl's <h4>'s <span>'s <div>
        courseText=removeSpaces(courseText);
        console.log({courseText, assignmentEl});

        if (newState) { //check
            console.log(`Checking ${assignmentText}`);

            checkmarkEl.checked=true;
            assignmentEl.classList.add('highlight-green');
           
            if (storeInChrome) {
                if (courseText in this.checkedTasksGlobal) { //already exists, so append
                    this.checkedTasksGlobal[courseText].push(assignmentText);
                } else { //not exist, so create course log
                    this.checkedTasksGlobal[courseText]=[];
                    this.checkedTasksGlobal[courseText].push(assignmentText); //push to newly created class
                }
                this.updateCheckedTasks(this.checkedTasksGlobal);
            }
        } else { //uncheck
            console.log(`Unchecking ${assignmentText}`);
            checkmarkEl.checked=false;
            assignmentEl.classList.remove('highlight-green');
            
            try {
                this.checkedTasksGlobal[courseText].pop( //remove checkedTaskGlobal from list
                    this.checkedTasksGlobal[courseText].indexOf(assignmentText)
                );
                this.updateCheckedTasks(this.checkedTasksGlobal); //update
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.checkedTasksGlobal[courseText].pop(this.checkedTasksGlobal[courseText].indexOf(assignmentText));
                    this.updateCheckedTasks(this.checkedTasksGlobal);
                }, 1000);
            }
        }
    }
}