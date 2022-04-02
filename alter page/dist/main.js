import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
//This script is injected into every page.
//Functions are in sequential order
window.addEventListener('load', determineSchoologyPageType, false); //wait for DOM elements to load
function executeAfterDoneLoading(callback, //executed after
isLoading = () => document.querySelector('.upcoming-list>.refresh-wrapper img[alt="Loading"]') != null //default is if there is no loading symbol on the page
) {
    let intervalID = setInterval(() => {
        if (isLoading()) {
            // Continue waiting
            console.log('Loading...');
        }
        else {
            clearInterval(intervalID); //stop interval
            setTimeout(() => {
                callback();
            }, 10);
        }
    }, 100);
}
function determineSchoologyPageType() {
    jQuery.noConflict(); //schoology also has its own jQuery, so use `jQuery` instead of `$` to avoid conflict
    // console.log('1. Extension running');
    //Calendar
    const hasSchoologyScripts = document.querySelectorAll(`script[src*='schoology.com']`); //schoology page
    if (hasSchoologyScripts) { //schoology page (determine which one)
        const hasCalendar = document.querySelector('#fcalendar'); //calendar page
        const urlHasCalendar = window.location.pathname.includes('calendar');
        if (hasCalendar && urlHasCalendar) { //type 1: schoology calendar
            waitForEventsLoaded();
        }
        //Not calendar
        else {
            let hasCourse = window.location.pathname.match(/\/course\/(\d+)\//);
            if (hasCourse) { //type 2: course materials page
                let courseId = hasCourse[1];
                executeAfterDoneLoading(() => {
                    new CoursePage(courseId);
                });
            }
            else if (window.location.pathname.includes('home')) { //type 3: schoology home page
                executeAfterDoneLoading(() => {
                    new HomePage({ containerSelectors: [
                            'div.upcoming-events-wrapper>div.upcoming-list',
                            'div.overdue-submissions-wrapper>div.upcoming-list', //overdue asgmts
                        ] });
                }, () => !document.querySelector('div.overdue-submissions-wrapper>div.upcoming-list')); //check if upcoming list exists, not if loading icon does not exist
            }
            else { //Non-schoology-related page
                //pass
            }
        }
    }
}
//<h1> CALENDAR
//Resize event listener
function waitForEventsLoaded() {
    let checkIfEventsLoaded = setInterval(() => {
        let calendarEventsLoaded = jQuery('#fcalendar>div.fc-content>div.fc-view>div')[0].children.length >= 3; //more than three asgmts on calendar indicating asgmts loaded
        if (calendarEventsLoaded) {
            clearInterval(checkIfEventsLoaded);
            console.log('3. Add checkmarks');
            // SchoologyCalendarPage();
            new CalendarPage();
        }
        else {
            console.log('Still waiting for calendar events to load');
        }
    }, 200);
}
// * CONFIG
// const homeworkCheckerSchoologyConfig={
//     verbose: true //whether or not to show console messages
// }
// 
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
