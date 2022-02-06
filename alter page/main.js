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

function executeAfterDoneLoading(callback) { //executes callback after page is done loading
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
                    new HomePage({containerSelectors: [
                        'div.upcoming-events-wrapper>div.upcoming-list', //upcoming assignments
                        'div.overdue-submissions-wrapper>div.upcoming-list', //overdue assignments
                    ]});
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
