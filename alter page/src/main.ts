import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';

// This script is injected into every page.
// Functions are in sequential order

window.addEventListener('load', determineSchoologyPageType, false); //wait for DOM elements to load


function executeAfterDoneLoading(
    callback: Function, //executed after
    isLoading=()=>document.querySelector('.upcoming-list>.refresh-wrapper img[alt="Loading"]')!=null //default is if there is no loading symbol on the page
): void { //executes callback after page is done loading
    let intervalID=setInterval(()=>{
        if (isLoading()) {
            // Continue waiting
            console.log('<hw>', 'Loading...')
        } else {
            clearInterval(intervalID); //stop interval
            
            setTimeout(()=>{ //wait another .01 seconds for asgmtEls to render on DOM
                callback();
            }, 10)
        }
    }, 100);
}

function determineSchoologyPageType(): void { //checks if page is a schoology calendar page before calling next
    jQuery.noConflict(); //schoology also has its own jQuery, so use `jQuery` instead of `$` to avoid conflict
    // console.log('<hw>', '1. Extension running');
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
            const hasCourse=window.location.pathname.match(/\/course\/(\d+)\//);
            if (hasCourse) { //type 2: course materials page
                let courseId=hasCourse[1];
                executeAfterDoneLoading(()=>{
                    new CoursePage(courseId);
                })
            } else if (window.location.pathname.includes('home') || document.getElementById('right-column-inner')) { //type 3: schoology home page
                executeAfterDoneLoading(()=>new HomePage, ()=>!document.querySelector('upcoming-event'/* this caused problems in bug report: 'div.overdue-submissions-wrapper>div.upcoming-list'*/)); //check if upcoming list exists, not if loading icon does not exist
            } else { //Non-schoology-related page
                //pass
            }
        }
    }
}


//<h1> CALENDAR
//Resize event listener
function waitForEventsLoaded(): void { //waits for calendar's events to load before calling next
    const checkIfEventsLoaded=setInterval(()=>{
        const calendarEventsLoaded=jQuery('#fcalendar>div.fc-content>div.fc-view>div')[0].children.length>=1; //asgmts on calendar indicating asgmts loaded
        if (calendarEventsLoaded) {
            clearInterval(checkIfEventsLoaded);
            console.log('<hw>', '3. Add checkmarks');
            new CalendarPage;
        } else {
            console.log('<hw>', 'Still waiting for calendar events to load');
        }
    }, 200);
}
