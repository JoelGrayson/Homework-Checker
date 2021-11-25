//This script is injected into every page.
//Functions are in sequential order

window.addEventListener('load', checkIfSchoologyCalendarPage, false); //wait for DOM elements to load

function checkIfSchoologyCalendarPage() { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict();
    console.log('1. Extension running');
    const hasSchoologyScripts=document.querySelectorAll('script[src*="schoology.com"]'); //schoology page
    const hasCalendar=document.querySelector('#fcalendar'); //calendar page
    const urlHasCalendar=window.location.href.includes('calendar');
    if (hasSchoologyScripts && hasCalendar && urlHasCalendar) {
        console.log('2. Page is schoology');
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
            addCheckmarks();
        } else {
            console.log('Still waiting for calendar events to load');
        }
    }, 200);
}


function addCheckmarks() { //manipulates calendar's events
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
            let pHighlight=assignment.querySelector('.highlight-green');
            if (pHighlight==null) { //no higlight green already
                let highlightGreen=document.createElement('div');
                highlightGreen.className='highlight-green';
                assignment.insertBefore(highlightGreen, assignment.firstChild);
            } else {
                assignment.removeChild(pHighlight);
            }
        })
        jQuery(checkEl).on('click', e=>{ //prevent assignment dialog from opening when clicking checkmark
            e.stopPropagation();
        });
        assignment.appendChild(checkEl);
    }

    //Selecting an assignment by name
    let [assignmentEl, eventEl]=getAssignmentByName('An Environmental History View of the Industrial Revolution'); //assignment name (stored in database)
    eventEl.style.backgroundColor='red';
    function getAssignmentByName(assignmentName) { //assignment names stored in database
        let assignmentEl=jQuery(`span.fc-event-title>span:contains('${assignmentName}')`)[0]; //has info (course & event), identifier
        let eventEl=assignmentEl.parentNode.parentNode.parentNode; //block (has styles)
        
        return [assignmentEl, eventEl]
    }
}