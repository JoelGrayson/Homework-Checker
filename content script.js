//This script is injected into every page.
//Functions are in sequential order

window.addEventListener('load', checkIfSchoologyCalendarOrCoursePage, false); //wait for DOM elements to load

function log(msg) { //logs with schoology icon
    console.log(`ⓢ`, msg);
}

function checkIfSchoologyCalendarOrCoursePage() { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict(); //schoology also has its own jQuery, so use `jQuery` instead of `$` to avoid conflict
    log('1. Extension running');
    //Calendar
    const hasSchoologyScripts=document.querySelectorAll('script[src*="schoology.com"]'); //schoology page
    if (hasSchoologyScripts) {
        
        const hasCalendar=document.querySelector('#fcalendar'); //calendar page
        const urlHasCalendar=window.location.href.includes('calendar');
        if (hasCalendar && urlHasCalendar) {
            log('2. Page is schoology calendar');
            chrome.runtime.onMessage.addListener((msg, sender, response)=>{ //listens for `run reload` message from popup.js
                if (msg.run==='reload')
                location.reload();
            });
            waitForEventsLoaded();
        }
        //Course page
        else {
            let hasCourse=window.location.href.match(/\/course\/(\d+)\//);
            if (hasCourse) {
                log('2. Page is schoology material page');
                let courseId=hasCourse[0];

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
            checkmarks();
        } else {
            log('Still waiting for calendar events to load');
        }
    }, 200);
}

function checkmarks() { //adds checkmarks to every calendar event
    function addCheckmarks() {
        jQuery(window).off('resize'); //prevent from resizing (does not work for some reason)
        
        const assignmentsContainer=document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode;
        let children=assignmentsContainer.children;
        for (let i=0; i<children.length; i++) {
            let assignment=children[i];
            let checkEl=document.createElement('input');
            checkEl.className='j_check';
            checkEl.type='checkbox';
            // checkEl.checked
            checkEl.addEventListener('change', ()=>{
                j_check(assignment)
            });
            jQuery(checkEl).on('click', e=>{ //prevent assignment dialog from opening when clicking checkmark
                e.stopPropagation();
            });
            assignment.appendChild(checkEl);
        }
    }
    addCheckmarks();

    //CHECK Assignments Already Completed
    let checkedTasksGlobal;
    chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
        checkedTasksGlobal=checkedTasks;
        log('checkedTasks'); console.log(checkedTasks);
        for (let course in checkedTasksGlobal) {
            let assignments=checkedTasksGlobal[course];
            for (let i=0; i<assignments.length; i++) {
                let [infoEl, blockEl]=getAssignmentByName(assignments[i]);
                j_check(blockEl, false);
            }
        }
    });

    function j_check(assignmentEl, storeInChrome=true) { //checks/unchecks passed in element
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior assignments from storage. is true all other times
        let pHighlight=assignmentEl.querySelector('.highlight-green');
        const checkmarkEl=assignmentEl.querySelector('input.j_check');
        let assignmentText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of assignment (firstChild), not including inside grandchildren like innerText()
        let courseText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title span.realm-title-course').innerText

        if (pHighlight==null) { //no highlight green already
            log(`Checking ${assignmentText}`)
            //Check
            checkmarkEl.checked=true;
            let highlightGreen=document.createElement('div');
            highlightGreen.className='highlight-green';
            assignmentEl.insertBefore(highlightGreen, assignmentEl.firstChild);
           
            if (storeInChrome) {
                if (courseText in checkedTasksGlobal) { //already exists, so append
                    checkedTasksGlobal[courseText].push(assignmentText);
                } else { //not exist, so create course log
                    checkedTasksGlobal[courseText]=[];
                    checkedTasksGlobal[courseText].push(assignmentText); //push to newly created class
                }
                updateCheckedTasks();
            }
        } else {
            log(`Unchecking ${assignmentText}`)
            //Uncheck
            checkmarkEl.checked=false;
            assignmentEl.removeChild(pHighlight);
            
            checkedTasksGlobal.pop(checkedTasksGlobal.indexOf(assignmentText));
            updateCheckedTasks();
        }
    }

    function updateCheckedTasks() { //updates checked tasks in chrome's storage
        log(checkedTasksGlobal);
        chrome.storage.sync.set({checkedTasks: checkedTasksGlobal});
    }

    function getAssignmentByName(assignmentName) { //assignment names stored in database
        let infoEl;
        let queryRes=jQuery(`span.fc-event-title>span:contains('${assignmentName}')`); //has info (course & event), identifier
        //jQuery's :contains() will match elements where assignmentName is a substring of the assignment. else if below handles overlaps

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
            console.error(`No elements matched ${assignmentName}`);
            return 'No matches';
        }
        let blockEl=infoEl.parentNode.parentNode.parentNode; //block (has styles)
        return [infoEl, blockEl]
    }
}

//<h1> MATERIAL PAGE
