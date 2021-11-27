//This script is injected into every page.
//Functions are in sequential order

window.addEventListener('load', checkIfSchoologyCalendarPage, false); //wait for DOM elements to load

function checkIfSchoologyCalendarPage() { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict(); //schoology also has its own jQuery, so use `jQuery` instead of `$` to avoid conflict
    console.log('1. Extension running');
    const hasSchoologyScripts=document.querySelectorAll('script[src*="schoology.com"]'); //schoology page
    const hasCalendar=document.querySelector('#fcalendar'); //calendar page
    const urlHasCalendar=window.location.href.includes('calendar');
    if (hasSchoologyScripts && hasCalendar && urlHasCalendar) {
        console.log('2. Page is schoology');

        chrome.runtime.onMessage.addListener((msg, sender, response)=>{ //listens for `run reload` message from popup.js
            if (msg.run==='reload')
                location.reload();
        });

        waitForEventsLoaded();
    }
}

//Resize event listener
function waitForEventsLoaded() { //waits for calendar's events to load before calling next
    let checkIfEventsLoaded=setInterval(()=>{
        let calendarEventsLoaded=jQuery('#fcalendar>div.fc-content>div.fc-view>div')[0].children.length>=3; //more than three assignments on calendar indicating assignments loaded
        if (calendarEventsLoaded) {
            clearInterval(checkIfEventsLoaded);
            console.log('3. Add checkmarks');
            checkmarks();
        } else {
            console.log('Still waiting for calendar events to load');
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
        console.log('checkedTasks', checkedTasks);
        for (let i=0; i<checkedTasks.length; i++) {
            let [infoEl, blockEl]=getAssignmentByName(checkedTasks[i]);
            j_check(blockEl, false);
        }
    });

    function j_check(assignmentEl, storeInChrome=true) { //checks/unchecks passed in element
        let pHighlight=assignmentEl.querySelector('.highlight-green');
        const checkmarkEl=assignmentEl.querySelector('input.j_check');
        let assignmentText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of assignment (firstChild), not including inside grandchildren like innerText()
        console.log('nodeValue', assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue);
        console.log('el', assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span'));


        if (pHighlight==null) { //no highlight green already
            console.log(`Checking ${assignmentText}`)
            //Check
            checkmarkEl.checked=true;
            let highlightGreen=document.createElement('div');
            highlightGreen.className='highlight-green';
            assignmentEl.insertBefore(highlightGreen, assignmentEl.firstChild);
           
            if (storeInChrome) {
                checkedTasksGlobal.push(assignmentText);
                updateCheckedTasks();
            }
        } else {
            console.log(`Unchecking ${assignmentText}`)
            //Uncheck
            checkmarkEl.checked=false;
            assignmentEl.removeChild(pHighlight);
            
            checkedTasksGlobal.pop(checkedTasksGlobal.indexOf(assignmentText));
            updateCheckedTasks();
        }
    }

    function updateCheckedTasks() { //updates checked tasks in chrome's storage
        console.log(checkedTasksGlobal);
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