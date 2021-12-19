//This script is injected into every page.
//Functions are in sequential order

let homeworkCheckerSchoologyConfig={
    verbose: true //whether or not to show console.log's
}

window.addEventListener('load', determineSchoologyPageType, false); //wait for DOM elements to load

function log(...msg) { //logs with schoology icon
    if (homeworkCheckerSchoologyConfig.verbose)
        console.log(`ⓢ`, ...msg);
}
function error(...msg) { //logs with schoology icon
    if (homeworkCheckerSchoologyConfig.verbose)
        console.error(`ⓢ`, ...msg);
}


function determineSchoologyPageType() { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict(); //schoology also has its own jQuery, so use `jQuery` instead of `$` to avoid conflict
    log('1. Extension running');
    //Calendar
    const hasSchoologyScripts=document.querySelectorAll('script[src*="schoology.com"]'); //schoology page
    if (hasSchoologyScripts) { //schoology page (determine which one)
        const hasCalendar=document.querySelector('#fcalendar'); //calendar page
        const urlHasCalendar=window.location.href.includes('calendar');
        if (hasCalendar && urlHasCalendar) { //type 1: schoology calendar
            // log('2. Page is schoology calendar');
            waitForEventsLoaded();
        }
        //Not calendar
        else {
            let hasCourse=window.location.href.match(/\/course\/(\d+)\//);
            if (hasCourse) { //type 2: course materials page
                // log('2. Page is schoology materials page');
                let courseId=hasCourse[1];
                materialsPage(courseId);
            } else if (window.location.href.includes('home')) { //type 3: schoology home page
                // log('2. home page');
                homePage();
            } else { //Non-schoology-related page
                //pass
            }
        }
    }

}
//<h1> CALENDAR
//Resize event listener
function waitForEventsLoaded() { //waits for calendar's events to load before calling next
    let checkIfEventsLoaded=setInterval(()=>{
        let calendarEventsLoaded=jQuery('#fcalendar>div.fc-content>div.fc-view>div')[0].children.length>=3; //more than three assignments on calendar indicating assignments loaded
        if (calendarEventsLoaded) {
            clearInterval(checkIfEventsLoaded);
            log('3. Add checkmarks');
            // SchoologyCalendarPage();
            new CalendarPage();
        } else {
            log('Still waiting for calendar events to load');
        }
    }, 200);
}

class SchoologyPage { //abstract class; template for each page
    constructor(obj) {
        this.pageType=obj.pageType; //indicates class
        this.getAssignmentByNamePathEl=obj.getAssignmentByNamePathEl;
        chrome.runtime.onMessage.addListener((msg, sender, response)=>{ //listens for `run reload` message from popup.js
            if (msg.run==='reload')
                location.reload();
        });
        //Sets this.checkedTasksGlobal to chrome storage
        this.checkedTasksGlobal;
        chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
            this.checkedTasksGlobal=checkedTasks;
            log('checkedTasks'); log(checkedTasks);
            for (let course in this.checkedTasksGlobal) {
                let assignments=this.checkedTasksGlobal[course];
                for (let i=0; i<assignments.length; i++) {
                    let [infoEl, blockEl]=this.getAssignmentByName(assignments[i]);
                    this.j_check(blockEl, false);
                }
            }
        });
        this.updateCheckedTasks();
    }
    addCheckmarks( //called in constructor, adds checkmarks to each assignment for clicking; checks those checkmarks based on chrome storage
        assignmentsContainer, //where the assignments are located
        customMiddleScript, //anonymous func executed in the middle
        locateElToAppendCheckkmarkTo //determines how to add children els ie el=>el.parentNode
    ) {
        let children=assignmentsContainer.children;
        for (let i=0; i<children.length; i++) {
            let assignmentEl=children[i];
            let checkEl=document.createElement('input');
            checkEl.className=`j_check_${this.pageType}`;
            checkEl.type='checkbox';
            checkEl.addEventListener('change', ()=>{
                this.j_check(assignmentEl);
            });
            customMiddleScript(checkEl);
            locateElToAppendCheckkmarkTo(assignmentEl).appendChild(checkEl);
        }
    }

    getAssignmentByName(assignmentName) {
        let query=`${this.getAssignmentByNamePathEl}:contains('${   assignmentName.replace(`'`, `\\'`) /* escape quote marks */  }')`;
        let queryRes=jQuery(query); //has info (course & event), identifier
        //jQuery's :contains() will match elements where assignmentName is a substring of the assignment. else if below handles overlaps
        
        let infoEl;
        if (queryRes.length===1) //only one matching elements 👍
            infoEl=queryRes[0];
        else if (queryRes.length>=2) { //2+ conflicting matches 🤏 (needs processing to find right element)
            for (let i=0; i<queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue===assignmentName) { //if element's assignment title matches assignmentName, that is the right element
                    infoEl=queryRes[i];
                    break;
                }
            }
        } else { //returns if no matches 👎
            error(`No elements matched ${assignmentName}`, {
                errorInfo: {
                    getAssignmentByNamePathEl: this.getAssignmentByNamePathEl,
                    query,
                    queryRes,
                    infoEl
                }
            });
            return 'No matches';
        }
        let blockEl=infoEl.parentNode.parentNode.parentNode; //block (has styles)
        return [infoEl, blockEl];
    } //returns DOMElement based on given string

    j_check() {} //polymorphism allows this function to be specialized among each SchoologyPage subclass

    updateCheckedTasks(checkedTasksGlobal) { //updates chrome's storage with checked tasks parameter
        chrome.storage.sync.set({checkedTasks: checkedTasksGlobal});
    }
    static checkedTasksGlobal; //holds the checkedTasks variable globally in the class
}

class CalendarPage extends SchoologyPage {
    constructor() {
        super({
            pageType: 'cal',
            getAssignmentByNamePathEl: 'span.fc-event-title>span'
        });
        
        jQuery(window).off('resize'); //prevent from resizing (does not work for some reason)
        
        this.addCheckmarks(
            document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode,
            (checkEl)=>{
                jQuery(checkEl).on('click', e=>{ //prevent assignment dialog from opening when clicking checkmark
                    e.stopPropagation();
                });
            },
            el=>el
        );
    }
    j_check(assignmentEl, storeInChrome=true) { //checks/unchecks passed in element
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior assignments from storage. is true all other times
        let pHighlight=assignmentEl.querySelector('.highlight-green'); //based on item inside assignment
        const checkmarkEl=assignmentEl.querySelector('input.j_check_cal');
        let assignmentText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of assignment (firstChild), not including inside grandchildren like innerText()
        let courseText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title span.realm-title-course').innerText;

        if (pHighlight==null) { //no highlight green already
            log(`Checking ${assignmentText}`);
            //Check
            checkmarkEl.checked=true;
            let highlightGreen=document.createElement('div');
            highlightGreen.classList.add('highlight-green');
            highlightGreen.classList.add('highlight-green-cal');
            
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
            log(`Unchecking ${assignmentText}`);
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
    constructor(courseId) {
        super();
        this.courseId=courseId;
        this.courseName=document.querySelector("#center-top>.page-title").innerText;

        this.addCheckmarks(
            document.querySelector("#center-top")
        )
    }
}

class HomePage extends SchoologyPage {
    constructor() {
        super();
    }
}