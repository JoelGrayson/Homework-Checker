//This script is injected into every page.
//Functions are in sequential order


window.addEventListener('load', checkIfSchoologyCalendarPage, false); //wait for DOM elements to load

function checkIfSchoologyCalendarPage() { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict();
    console.log('Extension running');
    const hasSchoologyScripts=document.querySelectorAll('script[src*="schoology.com"]'); //schoology page
    const hasCalendar=document.querySelector('#fcalendar'); //calendar page
    const urlHasCalendar=window.location.href.includes('calendar');
    if (hasSchoologyScripts && hasCalendar && urlHasCalendar) {
        console.log('Page is schoology');
        waitForEventsLoaded();
    }
}
//Resize event listener
function waitForEventsLoaded() { //waits for calendar's events to load before  callingnext
    let checkIfEventsLoaded=setInterval(()=>{
        let calendarEventsLoaded=jQuery('#fcalendar>div.fc-content>div.fc-view>div')[0].children.length>=3; //more than three assignments on calendar indicating assignments loaded
        if (calendarEventsLoaded) {
            clearInterval(checkIfEventsLoaded);
            console.log('Good, time to add checkmarks');
            addCheckmarks();
        } else {
            console.log('Still waiting for calendar events to load');
        }
    }, 200);
}


function addCheckmarks() { //manipulates calendar's events
    
    // var size = [window.width,window.height];  //public variable
    // $(window).resize(function(){
        //     window.resizeTo(size[0],size[1]);
        // });
        
        
        // document.getElementById('main').style.width='947px'; //make calendar not change
        // const assignmentsContainer=document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode;
        // for (let i=0; i<assignmentsContainer.length; i++) { //each assignment
        //     assignmentsContainer[i].style.minWidth='126px'; //width of assignment not change
        //     assignmentsContainer[i].style.width='126px'; //width of assignment not change
        // }
        
        
        let [assignmentEl, eventEl]=getAssignmentByName('An Environmental History View of the Industrial Revolution'); //assignment name (stored in database)
        eventEl.style.backgroundColor='red';
        console.log(assignmentEl, eventEl);
        function getAssignmentByName(assignmentName) { //assignment names stored in database
            let assignmentEl=jQuery(`div.fc-event-inner>span.fc-event-title>span:contains('${assignmentName}')`)[0]; //has info (course & event), identifier
            let eventEl=assignmentEl.parentNode.parentNode.parentNode; //block (has styles)
            
            return [assignmentEl, eventEl]
        }


        //Resizing causes elements to be rerendered, removing prev checkmarks & other annotations
        //Remove rerendering
        // function disableResizeWindowEventListeners() { //prevents schoology from rerendering assignments
        //     //otherwise, rerendering assignments would remove checkmarks & other annotations
            // window.getEventListeners(window).resize.forEach(event=>{
            //     window.removeEventListener('resize', event.listener)
            // });
        // }
        setTimeout(()=>{
            // $(window).off('resize');
            jQuery(window).off();
            console.log('turned off')
        }, 1000);
}