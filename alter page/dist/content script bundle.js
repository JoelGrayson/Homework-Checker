/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/functions.ts":
/*!**************************!*\
  !*** ./src/functions.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.removeSpaces = void 0;
function removeSpaces(input) {
    // Different spacing below:
    // "Algebra II (H): ALGEBRA II H - G"
    // "Algebra II (H) : ALGEBRA II H - G "
    let str = '';
    for (let character of input)
        if (character !== ' ')
            str += character;
    return str;
}
exports.removeSpaces = removeSpaces;


/***/ }),

/***/ "./src/pages/CalendarPage.ts":
/*!***********************************!*\
  !*** ./src/pages/CalendarPage.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const SchoologyPage_1 = __webpack_require__(/*! ./SchoologyPage */ "./src/pages/SchoologyPage.ts");
const functions_1 = __webpack_require__(/*! ../functions */ "./src/functions.ts");
class CalendarPage extends SchoologyPage_1.default {
    constructor() {
        super({
            pageType: 'cal',
            getAsgmtByNamePathEl: 'span.fc-event-title>span',
            infoToBlockEl: el => el.parentNode.parentNode.parentNode,
            limits: {
                courses: '$all',
                time: 'any'
            }
        });
        this.addCheckmarks({
            asgmtElContainer: document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode,
            customMiddleScript: (checkEl, asgmtEl) => {
                jQuery(checkEl).on('click', e => {
                    e.stopPropagation();
                });
            },
            locateElToAppendCheckmarkTo: el => el
        });
        //When changing months, reload page
        document.querySelector('span.fc-button-prev').addEventListener('click', reloadToCorrectMonthURL); //previous month button
        document.querySelector('span.fc-button-next').addEventListener('click', reloadToCorrectMonthURL); //next month button
        function reloadToCorrectMonthURL() {
            const tempEl = document.querySelector('.fc-header-title'); // as HTMLElement;
            let elText = tempEl['innerText'];
            let [monthName, year] = elText.split(' ');
            let month;
            switch (monthName) {
                case 'January':
                    month = '01';
                    break;
                case 'February':
                    month = '02';
                    break;
                case 'March':
                    month = '03';
                    break;
                case 'April':
                    month = '04';
                    break;
                case 'May':
                    month = '05';
                    break;
                case 'June':
                    month = '06';
                    break;
                case 'July':
                    month = '07';
                    break;
                case 'August':
                    month = '08';
                    break;
                case 'September':
                    month = '09';
                    break;
                case 'October':
                    month = '10';
                    break;
                case 'November':
                    month = '11';
                    break;
                case 'December':
                    month = '12';
                    break;
                default: console.error('Unknown month?', monthName);
            }
            let dateURL = `${year}-${month}`;
            console.log({ dateURL });
            let oldPathname = window.location.pathname.match(/(.*\/)\d{4}-\d{2}/)[1]; //removes last ####-## part of URL
            let newPathname = `${oldPathname}${dateURL}`;
            window.location.pathname = newPathname;
        }
        //Revives when checkmarks disappear due to asgmts re-render (such as when window resized or added a personal asgmt)
        setInterval(() => {
            if (!document.querySelector('.j_check_cal')) //checkmarks don't exist anymore
                new CalendarPage(); //revive checkmarks
            //alternative: window.location.reload()
        }, 300);
    }
    checkAllAsgmtEl() {
        let elementsByDate = jQuery(`span[class*='day-']`);
        for (let el of elementsByDate) {
            let asgmtEl = el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            if (asgmtEl != null)
                this.j_check({
                    asgmtEl,
                    forcedState: true,
                    options: {
                        storeInChrome: true
                    }
                }); //forcedState is true
        }
    }
    checkAllAsgmtElBeforeToday() {
        let elementsByDate = jQuery(`span[class*='day-']`);
        let today = new Date().getDate();
        for (let el of elementsByDate) {
            let dayOfEl = parseInt(el.className.slice(-2));
            let beforeToday = dayOfEl < today;
            if (beforeToday) { //before today
                let asgmtEl = el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                if (asgmtEl != null)
                    this.j_check({
                        asgmtEl,
                        forcedState: true,
                        options: {
                            storeInChrome: true
                        }
                    });
            }
        }
    }
    j_check({ asgmtEl, forcedState = null, options: { storeInChrome = true, animate = false //shows animation when checking
     } }) {
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior asgmts from storage. is true all other times
        let pHighlight = asgmtEl.querySelector('.highlight-green'); //based on item inside asgmt
        const checkmarkEl = asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        let asgmtText = asgmtEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of asgmt (firstChild), not including inside grandchildren like innerText()
        const courseText = (0, functions_1.removeSpaces)(asgmtEl.querySelector(`.fc-event-inner>.fc-event-title span[class*='realm-title']`).innerText); /* most child span can have class of realm-title-user or realm-title-course based on whether or not it is a personal event */
        let newState = forcedState !== null && forcedState !== void 0 ? forcedState : pHighlight == null; //if user forced state, override newHighlight
        if (newState) { //no highlight green already
            console.log(`Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked = true;
            const highlightGreenEl = this.createGreenHighlightEl({ pageType: this.pageType, animate });
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstElement)
            if (storeInChrome) {
                if (courseText in this.coursesGlobal) { //already exists, so append
                    this.coursesGlobal[courseText].checked.push(asgmtText);
                }
                else { //not exist, so create course log
                    this.coursesGlobal[courseText].checked = [];
                    this.coursesGlobal[courseText].checked.push(asgmtText); //push to newly created class
                }
                this.updateCheckedTasks(this.coursesGlobal);
            }
        }
        else {
            console.log(`Unchecking ${asgmtText}`);
            //Uncheck
            checkmarkEl.checked = false;
            asgmtEl.removeChild(pHighlight);
            // coursesGlobal.pop(coursesGlobal.indexOf(asgmtText));
            this.coursesGlobal[courseText].checked.pop(this.coursesGlobal[courseText].checked.indexOf(asgmtText));
            this.updateCheckedTasks(this.coursesGlobal);
        }
    }
}
exports["default"] = CalendarPage;


/***/ }),

/***/ "./src/pages/CoursePage.ts":
/*!*********************************!*\
  !*** ./src/pages/CoursePage.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const SchoologyPage_1 = __webpack_require__(/*! ./SchoologyPage */ "./src/pages/SchoologyPage.ts");
const functions_1 = __webpack_require__(/*! ../functions */ "./src/functions.ts");
class CoursePage extends SchoologyPage_1.default {
    constructor(courseId) {
        let containerPath = `#course-events .upcoming-list .upcoming-events .upcoming-list`;
        let courseName = document.querySelector('#center-top>.page-title').innerText; //grabs course title
        courseName = (0, functions_1.removeSpaces)(courseName);
        super({
            pageType: 'course',
            getAsgmtByNamePathEl: `${containerPath}>div[data-start]`,
            infoToBlockEl: el => el,
            limits: {
                courses: courseName,
                time: 'any'
            }
        });
        this.courseId = courseId;
        this.courseName = courseName;
        this.addCheckmarks({
            asgmtElContainer: document.querySelector(containerPath),
            customMiddleScript: (checkEl, asgmtEl) => {
                if (asgmtEl.classList.contains('date-header')) //does not add check to .date-header by continue;ing out of loop
                    return 'continue';
            },
            locateElToAppendCheckmarkTo: el => el.firstChild
        });
    }
    j_check({ asgmtEl, forcedState = null, options: { storeInChrome = true, animate = false //shows animation when checking
     } }) {
        const pHighlight = !!asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
        const newState = forcedState !== null && forcedState !== void 0 ? forcedState : !pHighlight; //opposite when checking
        const checkmarkEl = asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const asgmtText = asgmtEl.querySelector('a').innerText;
        console.log({ newHighlight: newState, pHighlight, checkmarkEl });
        if (newState) { //no highlight green already, so check
            console.log(`Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked = true;
            const highlightGreenEl = this.createGreenHighlightEl({ pageType: this.pageType, animate });
            asgmtEl.style.position = 'relative'; //for green rect to be bound to asgmtEl
            asgmtEl.querySelector('h4').style.position = 'relative'; //so that text above checkmark
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstChild)
            if (storeInChrome) {
                if (this.courseName in this.coursesGlobal) { //already exists, so append
                    this.coursesGlobal[this.courseName].push(asgmtText);
                }
                else { //not exist, so create course log
                    this.coursesGlobal[this.courseName] = [];
                    this.coursesGlobal[this.courseName].push(asgmtText); //push to newly created class
                }
                this.updateCheckedTasks(this.coursesGlobal);
            }
        }
        else { //uncheck
            console.log(`Unchecking ${asgmtText}`);
            checkmarkEl.checked = false;
            const toRemove = asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            try {
                this.coursesGlobal[this.courseName].pop(//remove checkedTaskGlobal from list
                this.coursesGlobal[this.courseName].indexOf(asgmtText));
                this.updateCheckedTasks(this.coursesGlobal); //update
            }
            catch (err) {
                console.error(err);
                setTimeout(() => {
                    this.coursesGlobal[this.courseName].pop(this.coursesGlobal[this.courseName].indexOf(asgmtText));
                    this.updateCheckedTasks(this.coursesGlobal);
                }, 1000);
            }
        }
    }
}
exports["default"] = CoursePage;


/***/ }),

/***/ "./src/pages/HomePage.ts":
/*!*******************************!*\
  !*** ./src/pages/HomePage.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const SchoologyPage_1 = __webpack_require__(/*! ./SchoologyPage */ "./src/pages/SchoologyPage.ts");
const collapseOverdue_1 = __webpack_require__(/*! ./collapseOverdue */ "./src/pages/collapseOverdue.ts");
const functions_1 = __webpack_require__(/*! ../functions */ "./src/functions.ts");
class HomePage extends SchoologyPage_1.default {
    constructor({ containerSelectors }) {
        super({
            pageType: 'home',
            getAsgmtByNamePathEl: containerSelectors.map(s => `${s}>div`),
            infoToBlockEl: el => el,
            limits: {
                courses: '$all',
                time: 'any'
            },
            multipleAsgmtContainers: true
        });
        (0, collapseOverdue_1.default)();
        for (let containerSelector of containerSelectors) {
            let selector = `h4>span`;
            let containerClass = 'j_check_container';
            this.addCheckmarks({
                asgmtElContainer: document.querySelector(containerSelector),
                customMiddleScript: (checkEl, asgmtEl) => {
                    if (asgmtEl.classList.contains('date-header'))
                        return 'continue';
                    else { //valid assignmment
                        let jCheckContainer = document.createElement('span');
                        jCheckContainer.classList.add(containerClass);
                        let parentNode = asgmtEl.querySelector(selector);
                        parentNode.insertBefore(jCheckContainer, parentNode.querySelector('span.upcoming-time'));
                    }
                },
                locateElToAppendCheckmarkTo: el => el.querySelector(`${selector} span.${containerClass}`),
            });
        }
    }
    j_check({ asgmtEl, forcedState = null, options: { storeInChrome = true, animate = false //shows animation when checking
     } }) {
        console.log({ asgmtEl });
        const pHighlight = !!asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
        const newState = forcedState !== null && forcedState !== void 0 ? forcedState : !pHighlight; //opposite when checking
        const checkmarkEl = asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const tempAnchor = asgmtEl.querySelector('a');
        const asgmtText = tempAnchor.innerText;
        const courseText = (0, functions_1.removeSpaces)(asgmtEl.querySelector('h4>span').ariaLabel); //name of course based on aria-label of asgmtEl's <h4>'s <span>'s <div>
        // console.log({courseText, asgmtEl});
        if (newState) { //check
            console.log(`Checking '${asgmtText}'`);
            checkmarkEl.checked = true;
            const highlightGreenEl = this.createGreenHighlightEl({ pageType: this.pageType, animate });
            const parent = asgmtEl.querySelector('h4');
            asgmtEl.querySelector('h4>span').style.position = 'relative'; //so that text above checkmark
            parent.insertBefore(highlightGreenEl, parent.firstChild); //insert as first element (before firstElement)
            if (storeInChrome) {
                if (courseText in this.coursesGlobal) { //already exists, so append
                    this.coursesGlobal[courseText].checked.push(asgmtText);
                }
                else { //not exist, so create course log
                    this.coursesGlobal[courseText].checked = [];
                    this.coursesGlobal[courseText].checked.push(asgmtText); //push to newly created class
                }
                this.updateCheckedTasks(this.coursesGlobal);
            }
        }
        else { //uncheck
            console.log(`Unchecking '${asgmtText}'`);
            checkmarkEl.checked = false;
            const toRemove = asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            try {
                this.coursesGlobal[courseText].checked.pop(//remove checkedTaskGlobal from list
                this.coursesGlobal[courseText].checked.indexOf(asgmtText));
                this.updateCheckedTasks(this.coursesGlobal); //update
            }
            catch (err) {
                console.error(err);
                setTimeout(() => {
                    this.coursesGlobal[courseText].checked.pop(this.coursesGlobal[courseText].checked.indexOf(asgmtText));
                    this.updateCheckedTasks(this.coursesGlobal);
                }, 1000);
            }
        }
    }
}
exports["default"] = HomePage;


/***/ }),

/***/ "./src/pages/SchoologyPage.ts":
/*!************************************!*\
  !*** ./src/pages/SchoologyPage.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


/// <reference types="jquery"/>
/// <reference types="chrome"/>
Object.defineProperty(exports, "__esModule", ({ value: true }));
class SchoologyPage {
    constructor({ pageType, getAsgmtByNamePathEl, infoToBlockEl, limits, ignoreOldAsgmts = true, multipleAsgmtContainers = false }) {
        console.log({ pageType, getAsgmtByNamePathEl, infoToBlockEl, limits, ignoreOldAsgmts, multipleAsgmtContainers });
        chrome.storage.sync.get('settings', ({ settings }) => {
            if (settings.showCheckmarks === 'onHover') {
                console.log('Only show checkmark on hover');
                //Load style if onlyShowCheckmarkOnHover
                let styleEl = document.createElement('style');
                styleEl.innerHTML = `
                    .j_check_cal {
                        visibility: hidden; /* all input checks hidden */
                    }
                    .fc-event:hover .j_check_cal { /* input check shown onhover of asgmt */
                        visibility: visible;
                    }
                `;
                document.head.appendChild(styleEl);
            }
        });
        this.pageType = pageType; //indicates css class for checkbox
        this.multipleAsgmtContainers = multipleAsgmtContainers;
        this.getAsgmtByNamePathEl = getAsgmtByNamePathEl; //from where to search :contains() of an asgmt by name
        this.infoToBlockEl = infoToBlockEl;
        this.ignoreOldAsgmts = ignoreOldAsgmts;
        /*{
            courses, //'$all' | String of course name
            time //'any' | 'future'
        }*/
        //listens for `run $cmd` message from popup.js
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.hasOwnProperty('run')) {
                switch (msg.run) {
                    case 'reload':
                        location.reload();
                        break;
                    case 'check all asgmts':
                        this.checkAllAsgmtEl();
                        break;
                    case 'check all asgmts before today':
                        this.checkAllAsgmtElBeforeToday();
                        break;
                    default:
                        console.error('Unknown run message:', msg.run);
                }
            }
        });
        //Sets this.coursesGlobal to chrome storage
        chrome.storage.sync.get('courses', ({ courses }) => {
            this.coursesGlobal = courses;
            console.log('courses', courses);
            console.log(limits); //time & course limits when getting asgmts
            if (limits.courses === '$all' && limits.time === 'any') { //calendar or home page
                for (let course of courses) { //TODO: change schema
                    let checked = course.checked; //asgmts
                    for (let asgmtEl of checked) {
                        let [infoEl, blockEl] = this.getAsgmtByName(asgmtEl);
                        if (infoEl !== 'No matches')
                            this.j_check({
                                asgmtEl: blockEl,
                                options: {
                                    storeInChrome: false,
                                }
                            });
                    }
                }
            }
            else if (limits.courses === '$all' && this.time === 'future') { //not being used, potential if not prev asgmts
            }
            else if (limits.courses !== '$all' && this.time === 'any') { //course page (all asgmts of course)
                console.log(`Only checking the course: ${this.courses}`);
                if (courses in this.coursesGlobal) { //if checked asgmts of that course
                    let asgmts = this.coursesGlobal[this.courses];
                    console.log('Asgmts', asgmts);
                    for (let asgmtEl of asgmts) {
                        let [infoEl, blockEl] = this.getAsgmtByName(asgmtEl);
                        if (infoEl !== 'No matches')
                            this.j_check({
                                asgmtEl: blockEl,
                                options: {
                                    storeInChrome: false,
                                }
                            });
                    }
                }
            }
        });
    }
    checkAllAsgmtEl() {
        throw new Error("Method not implemented.");
    }
    checkAllAsgmtElBeforeToday() {
        throw new Error("Method not implemented.");
    }
    addCheckmarks({ //called in subclass' constructor, adds checkmarks to each asgmt for clicking; checks those checkmarks based on chrome storage
    asgmtElContainer, //where the asgmts are located
    customMiddleScript, //anonymous func executed in the middle
    locateElToAppendCheckmarkTo //determines how to add children els ie el=>el.parentNode
     }) {
        let children = asgmtElContainer.children;
        for (let asgmtEl of children) {
            let checkEl = document.createElement('input');
            checkEl.className = `j_check_${this.pageType}`;
            checkEl.type = 'checkbox';
            checkEl.addEventListener('change', () => {
                //animate because user clicking
                this.j_check({
                    asgmtEl,
                    options: {
                        storeInChrome: true,
                        animate: true //shows animation when checking
                    }
                });
            });
            let toRun = customMiddleScript(checkEl, asgmtEl); //returns string to evaluate (rarely used)
            if (toRun === 'continue')
                continue;
            locateElToAppendCheckmarkTo(asgmtEl).appendChild(checkEl);
        }
    }
    getAsgmtByName(asgmtName) {
        let query, queryRes;
        console.log(asgmtName, this.multipleAsgmtContainers);
        if (this.multipleAsgmtContainers) { //multiple asgmt containers to check
            for (let getAsgmtByNamePathEl of this.getAsgmtByNamePathEl) {
                query = `${getAsgmtByNamePathEl}:contains('${asgmtName.replaceAll(`'`, `\\'`) /* escape quote marks */}')`;
                queryRes = jQuery(query);
                if (queryRes.length > 0) //keeps going thru asgmtContainers until queryRes is an asgmt
                    break;
                else
                    continue;
            }
        }
        else {
            query = `${this.getAsgmtByNamePathEl}:contains('${asgmtName.replaceAll(`'`, `\\'`) /* escape quote marks */}')`;
            queryRes = jQuery(query); //has info (course & event), identifier
            //jQuery's :contains() will match elements where asgmtName is a substring of the asgmt. else if below handles overlaps
        }
        let infoEl;
        if (queryRes.length === 1) //only one matching elements 👍
            infoEl = queryRes[0];
        else if (queryRes.length >= 2) { //2+ conflicting matches 🤏 so so  (needs processing to find right element)
            for (let i = 0; i < queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue === asgmtName) { //if element's asgmt title matches asgmtName, that is the right element
                    infoEl = queryRes[i];
                    break;
                }
            }
        }
        else { //returns if no matches 👎
            if (!this.ignoreOldAsgmts) {
                console.error(`No elements matched ${asgmtName}`, {
                    errorInfo: {
                        getAsgmtByNamePathEl: this.getAsgmtByNamePathEl,
                        query,
                        queryRes,
                        infoEl
                    }
                }, 'This error may be caused by old asgmts');
            }
            return ['No matches', 'No matches'];
        }
        let blockEl = this.infoToBlockEl(infoEl); //block (has styles)
        return [infoEl, blockEl];
    }
    j_check({ //polymorphism allows this function to be specialized among each SchoologyPage subclass. However, it is called from this SchoologyPage
    // Below are the conventional inputs
    asgmtEl, forcedState = null, //if null, j_check toggles. if true/false, it forces into that state
    options: { storeInChrome = true, animate = false //shows animation when checking
     } }) { }
    createGreenHighlightEl({ //creates highlightGreenEl with animate/no animate
    pageType, animate //: Boolean
     }) {
        const highlightGreen = document.createElement('div');
        highlightGreen.classList.add('highlight-green');
        highlightGreen.classList.add(`highlight-green-${pageType}`);
        highlightGreen.innerHTML = /* highlight animaged svg */ `
            <svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 10 10'
                style='width: 100%; height: 100%; transform: scaleX(-1)'>
                <!-- Dark Green Background -->
                <path fill='rgb(115, 252, 127)' d='M 10 0 L 10 10 L 0 10 L 0 0 Z' />
                <!-- Slash Between Center -->
                <path stroke='green' d='M 0 0 L 10 10 Z'>
                ${ //if animate, add an animation tag inside <path>
        animate
            ?
                `<!-- Animation notes: at start, no movement. gradually gets faster and faster -->
                    <animate
                        attributeName='d'
                        dur='0.2s'
                        repeatCount='1'
                        values='
                            M 0 0 L;
                            M 0 0 L;
                            M 0 0 L;
                            M 0 0 L;
                            M 0 0 L;
                            M 0 0 L;
                            M 0 0 L;
                            M 0 0 L 0.7 0.7 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L 8.39 8.39 L;
                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L 8.39 8.39 L 10 10 L'
                    />` : ''}
                </path>
                <path stroke='green' d='M 0 0 L 10 10 Z'>
                    
                </path>
            </svg>
        `;
        return highlightGreen;
    }
    updateCheckedTasks(coursesGlobal) {
        console.log('Updating to ', coursesGlobal);
        chrome.storage.sync.set({ checkedTasks: coursesGlobal });
    }
}
exports["default"] = SchoologyPage;


/***/ }),

/***/ "./src/pages/collapseOverdue.ts":
/*!**************************************!*\
  !*** ./src/pages/collapseOverdue.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
function collapseOverdue() {
    const overdueWrapperPath = `div.overdue-submissions-wrapper`;
    let intervalId = setInterval(() => {
        let ready = !!document.querySelector('div.overdue-submissions-wrapper>div.upcoming-list');
        if (ready) {
            init();
            clearInterval(intervalId);
        }
    });
    async function init() {
        function get() {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get('settings', ({ settings }) => {
                    resolve(settings.overdueCollapsed);
                });
            });
        }
        async function set(newVal) {
            let oldSettings = await get();
            let newSettings = Object.assign({}, oldSettings);
            newSettings.overdueCollapsed = newVal;
            chrome.storage.sync.set({
                settings: newSettings
            });
        }
        let initialVal = await get();
        const container = document.querySelector(overdueWrapperPath + '>h3');
        const collapseBtn = document.createElement('button');
        collapseBtn.style.marginLeft = '4rem'; //distance between text
        collapseBtn.innerText = 'Hide Overdue Assignments';
        collapseBtn.classList.add('j_button');
        collapseBtn.addEventListener('click', async () => {
            const newVal = !(await get()); //opposite of oldVal
            rerenderCollapseBtn(newVal);
            set(newVal);
        });
        container.appendChild(collapseBtn);
        rerenderCollapseBtn(initialVal); //initial call
        function rerenderCollapseBtn(newVal) {
            const asgmtsEl = document.querySelector(overdueWrapperPath + '>div.upcoming-list');
            asgmtsEl.classList.toggle('j_collapsed', newVal); //class if newVal
            collapseBtn.innerText = newVal ? 'Show Overdue Assignments' : 'Hide Overdue Assignments';
        }
    }
}
exports["default"] = collapseOverdue;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const CalendarPage_1 = __webpack_require__(/*! ./pages/CalendarPage */ "./src/pages/CalendarPage.ts");
const HomePage_1 = __webpack_require__(/*! ./pages/HomePage */ "./src/pages/HomePage.ts");
const CoursePage_1 = __webpack_require__(/*! ./pages/CoursePage */ "./src/pages/CoursePage.ts");
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
                    new CoursePage_1.default(courseId);
                });
            }
            else if (window.location.pathname.includes('home')) { //type 3: schoology home page
                executeAfterDoneLoading(() => {
                    new HomePage_1.default({ containerSelectors: [
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
            new CalendarPage_1.default();
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QSxrRUFBa0U7QUFDbEU7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQixpQkFBaUIsdUZBQXVGO0FBQ3hHO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdIQUFnSDtBQUNoSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL2Z1bmN0aW9ucy50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvQ2FsZW5kYXJQYWdlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9Db3Vyc2VQYWdlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9Ib21lUGFnZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvU2Nob29sb2d5UGFnZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvY29sbGFwc2VPdmVyZHVlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVtb3ZlU3BhY2VzID0gdm9pZCAwO1xuZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKGlucHV0KSB7XG4gICAgLy8gRGlmZmVyZW50IHNwYWNpbmcgYmVsb3c6XG4gICAgLy8gXCJBbGdlYnJhIElJIChIKTogQUxHRUJSQSBJSSBIIC0gR1wiXG4gICAgLy8gXCJBbGdlYnJhIElJIChIKSA6IEFMR0VCUkEgSUkgSCAtIEcgXCJcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgY2hhcmFjdGVyIG9mIGlucHV0KVxuICAgICAgICBpZiAoY2hhcmFjdGVyICE9PSAnICcpXG4gICAgICAgICAgICBzdHIgKz0gY2hhcmFjdGVyO1xuICAgIHJldHVybiBzdHI7XG59XG5leHBvcnRzLnJlbW92ZVNwYWNlcyA9IHJlbW92ZVNwYWNlcztcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgU2Nob29sb2d5UGFnZV8xID0gcmVxdWlyZShcIi4vU2Nob29sb2d5UGFnZVwiKTtcbmNvbnN0IGZ1bmN0aW9uc18xID0gcmVxdWlyZShcIi4uL2Z1bmN0aW9uc1wiKTtcbmNsYXNzIENhbGVuZGFyUGFnZSBleHRlbmRzIFNjaG9vbG9neVBhZ2VfMS5kZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgcGFnZVR5cGU6ICdjYWwnLFxuICAgICAgICAgICAgZ2V0QXNnbXRCeU5hbWVQYXRoRWw6ICdzcGFuLmZjLWV2ZW50LXRpdGxlPnNwYW4nLFxuICAgICAgICAgICAgaW5mb1RvQmxvY2tFbDogZWwgPT4gZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICBsaW1pdHM6IHtcbiAgICAgICAgICAgICAgICBjb3Vyc2VzOiAnJGFsbCcsXG4gICAgICAgICAgICAgICAgdGltZTogJ2FueSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkQ2hlY2ttYXJrcyh7XG4gICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuZmMtZXZlbnQ+ZGl2LmZjLWV2ZW50LWlubmVyJykucGFyZW50Tm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgICAgY3VzdG9tTWlkZGxlU2NyaXB0OiAoY2hlY2tFbCwgYXNnbXRFbCkgPT4ge1xuICAgICAgICAgICAgICAgIGpRdWVyeShjaGVja0VsKS5vbignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG86IGVsID0+IGVsXG4gICAgICAgIH0pO1xuICAgICAgICAvL1doZW4gY2hhbmdpbmcgbW9udGhzLCByZWxvYWQgcGFnZVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLmZjLWJ1dHRvbi1wcmV2JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWxvYWRUb0NvcnJlY3RNb250aFVSTCk7IC8vcHJldmlvdXMgbW9udGggYnV0dG9uXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4uZmMtYnV0dG9uLW5leHQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlbG9hZFRvQ29ycmVjdE1vbnRoVVJMKTsgLy9uZXh0IG1vbnRoIGJ1dHRvblxuICAgICAgICBmdW5jdGlvbiByZWxvYWRUb0NvcnJlY3RNb250aFVSTCgpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYy1oZWFkZXItdGl0bGUnKTsgLy8gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBsZXQgZWxUZXh0ID0gdGVtcEVsWydpbm5lclRleHQnXTtcbiAgICAgICAgICAgIGxldCBbbW9udGhOYW1lLCB5ZWFyXSA9IGVsVGV4dC5zcGxpdCgnICcpO1xuICAgICAgICAgICAgbGV0IG1vbnRoO1xuICAgICAgICAgICAgc3dpdGNoIChtb250aE5hbWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdKYW51YXJ5JzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDEnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdGZWJydWFyeSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzAyJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnTWFyY2gnOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwMyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0FwcmlsJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDQnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdNYXknOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0p1bmUnOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNic7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0p1bHknOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0F1Z3VzdCc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA4JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnU2VwdGVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDknO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdPY3RvYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMTAnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdOb3ZlbWJlcic6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzExJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnRGVjZW1iZXInOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGNvbnNvbGUuZXJyb3IoJ1Vua25vd24gbW9udGg/JywgbW9udGhOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBkYXRlVVJMID0gYCR7eWVhcn0tJHttb250aH1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coeyBkYXRlVVJMIH0pO1xuICAgICAgICAgICAgbGV0IG9sZFBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC8oLipcXC8pXFxkezR9LVxcZHsyfS8pWzFdOyAvL3JlbW92ZXMgbGFzdCAjIyMjLSMjIHBhcnQgb2YgVVJMXG4gICAgICAgICAgICBsZXQgbmV3UGF0aG5hbWUgPSBgJHtvbGRQYXRobmFtZX0ke2RhdGVVUkx9YDtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9IG5ld1BhdGhuYW1lO1xuICAgICAgICB9XG4gICAgICAgIC8vUmV2aXZlcyB3aGVuIGNoZWNrbWFya3MgZGlzYXBwZWFyIGR1ZSB0byBhc2dtdHMgcmUtcmVuZGVyIChzdWNoIGFzIHdoZW4gd2luZG93IHJlc2l6ZWQgb3IgYWRkZWQgYSBwZXJzb25hbCBhc2dtdClcbiAgICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcual9jaGVja19jYWwnKSkgLy9jaGVja21hcmtzIGRvbid0IGV4aXN0IGFueW1vcmVcbiAgICAgICAgICAgICAgICBuZXcgQ2FsZW5kYXJQYWdlKCk7IC8vcmV2aXZlIGNoZWNrbWFya3NcbiAgICAgICAgICAgIC8vYWx0ZXJuYXRpdmU6IHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9LCAzMDApO1xuICAgIH1cbiAgICBjaGVja0FsbEFzZ210RWwoKSB7XG4gICAgICAgIGxldCBlbGVtZW50c0J5RGF0ZSA9IGpRdWVyeShgc3BhbltjbGFzcyo9J2RheS0nXWApO1xuICAgICAgICBmb3IgKGxldCBlbCBvZiBlbGVtZW50c0J5RGF0ZSkge1xuICAgICAgICAgICAgbGV0IGFzZ210RWwgPSBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIGlmIChhc2dtdEVsICE9IG51bGwpXG4gICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgYXNnbXRFbCxcbiAgICAgICAgICAgICAgICAgICAgZm9yY2VkU3RhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAvL2ZvcmNlZFN0YXRlIGlzIHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0FsbEFzZ210RWxCZWZvcmVUb2RheSgpIHtcbiAgICAgICAgbGV0IGVsZW1lbnRzQnlEYXRlID0galF1ZXJ5KGBzcGFuW2NsYXNzKj0nZGF5LSddYCk7XG4gICAgICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCkuZ2V0RGF0ZSgpO1xuICAgICAgICBmb3IgKGxldCBlbCBvZiBlbGVtZW50c0J5RGF0ZSkge1xuICAgICAgICAgICAgbGV0IGRheU9mRWwgPSBwYXJzZUludChlbC5jbGFzc05hbWUuc2xpY2UoLTIpKTtcbiAgICAgICAgICAgIGxldCBiZWZvcmVUb2RheSA9IGRheU9mRWwgPCB0b2RheTtcbiAgICAgICAgICAgIGlmIChiZWZvcmVUb2RheSkgeyAvL2JlZm9yZSB0b2RheVxuICAgICAgICAgICAgICAgIGxldCBhc2dtdEVsID0gZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGFzZ210RWwgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzZ210RWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZWRTdGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUluQ2hyb21lOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGpfY2hlY2soeyBhc2dtdEVsLCBmb3JjZWRTdGF0ZSA9IG51bGwsIG9wdGlvbnM6IHsgc3RvcmVJbkNocm9tZSA9IHRydWUsIGFuaW1hdGUgPSBmYWxzZSAvL3Nob3dzIGFuaW1hdGlvbiB3aGVuIGNoZWNraW5nXG4gICAgIH0gfSkge1xuICAgICAgICAvL3N0b3JlSW5DaHJvbWUgaW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHRvIHNlbmQgcmVxdWVzdCB0byBzdG9yZSBpbiBjaHJvbWUuIGlzIGZhbHNlIHdoZW4gZXh0ZW5zaW9uIGluaXRpYWxpemluZyAmIGNoZWNraW5nIG9mZiBwcmlvciBhc2dtdHMgZnJvbSBzdG9yYWdlLiBpcyB0cnVlIGFsbCBvdGhlciB0aW1lc1xuICAgICAgICBsZXQgcEhpZ2hsaWdodCA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignLmhpZ2hsaWdodC1ncmVlbicpOyAvL2Jhc2VkIG9uIGl0ZW0gaW5zaWRlIGFzZ210XG4gICAgICAgIGNvbnN0IGNoZWNrbWFya0VsID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dC5qX2NoZWNrXyR7dGhpcy5wYWdlVHlwZX1gKTtcbiAgICAgICAgbGV0IGFzZ210VGV4dCA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignLmZjLWV2ZW50LWlubmVyPi5mYy1ldmVudC10aXRsZT5zcGFuJykuZmlyc3RDaGlsZC5ub2RlVmFsdWU7IC8vb25seSB2YWx1ZSBvZiBhc2dtdCAoZmlyc3RDaGlsZCksIG5vdCBpbmNsdWRpbmcgaW5zaWRlIGdyYW5kY2hpbGRyZW4gbGlrZSBpbm5lclRleHQoKVxuICAgICAgICBjb25zdCBjb3Vyc2VUZXh0ID0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykoYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGAuZmMtZXZlbnQtaW5uZXI+LmZjLWV2ZW50LXRpdGxlIHNwYW5bY2xhc3MqPSdyZWFsbS10aXRsZSddYCkuaW5uZXJUZXh0KTsgLyogbW9zdCBjaGlsZCBzcGFuIGNhbiBoYXZlIGNsYXNzIG9mIHJlYWxtLXRpdGxlLXVzZXIgb3IgcmVhbG0tdGl0bGUtY291cnNlIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IGl0IGlzIGEgcGVyc29uYWwgZXZlbnQgKi9cbiAgICAgICAgbGV0IG5ld1N0YXRlID0gZm9yY2VkU3RhdGUgIT09IG51bGwgJiYgZm9yY2VkU3RhdGUgIT09IHZvaWQgMCA/IGZvcmNlZFN0YXRlIDogcEhpZ2hsaWdodCA9PSBudWxsOyAvL2lmIHVzZXIgZm9yY2VkIHN0YXRlLCBvdmVycmlkZSBuZXdIaWdobGlnaHRcbiAgICAgICAgaWYgKG5ld1N0YXRlKSB7IC8vbm8gaGlnaGxpZ2h0IGdyZWVuIGFscmVhZHlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyAke2FzZ210VGV4dH1gKTtcbiAgICAgICAgICAgIC8vQ2hlY2tcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW5FbCA9IHRoaXMuY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlOiB0aGlzLnBhZ2VUeXBlLCBhbmltYXRlIH0pO1xuICAgICAgICAgICAgYXNnbXRFbC5pbnNlcnRCZWZvcmUoaGlnaGxpZ2h0R3JlZW5FbCwgYXNnbXRFbC5maXJzdENoaWxkKTsgLy9pbnNlcnQgYXMgZmlyc3QgZWxlbWVudCAoYmVmb3JlIGZpcnN0RWxlbWVudClcbiAgICAgICAgICAgIGlmIChzdG9yZUluQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvdXJzZVRleHQgaW4gdGhpcy5jb3Vyc2VzR2xvYmFsKSB7IC8vYWxyZWFkeSBleGlzdHMsIHNvIGFwcGVuZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbY291cnNlVGV4dF0uY2hlY2tlZC5wdXNoKGFzZ210VGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgeyAvL25vdCBleGlzdCwgc28gY3JlYXRlIGNvdXJzZSBsb2dcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQucHVzaChhc2dtdFRleHQpOyAvL3B1c2ggdG8gbmV3bHkgY3JlYXRlZCBjbGFzc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoZWNrZWRUYXNrcyh0aGlzLmNvdXJzZXNHbG9iYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFVuY2hlY2tpbmcgJHthc2dtdFRleHR9YCk7XG4gICAgICAgICAgICAvL1VuY2hlY2tcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGFzZ210RWwucmVtb3ZlQ2hpbGQocEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAvLyBjb3Vyc2VzR2xvYmFsLnBvcChjb3Vyc2VzR2xvYmFsLmluZGV4T2YoYXNnbXRUZXh0KSk7XG4gICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbY291cnNlVGV4dF0uY2hlY2tlZC5wb3AodGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQuaW5kZXhPZihhc2dtdFRleHQpKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2hlY2tlZFRhc2tzKHRoaXMuY291cnNlc0dsb2JhbCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDYWxlbmRhclBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNjaG9vbG9neVBhZ2VfMSA9IHJlcXVpcmUoXCIuL1NjaG9vbG9neVBhZ2VcIik7XG5jb25zdCBmdW5jdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9mdW5jdGlvbnNcIik7XG5jbGFzcyBDb3Vyc2VQYWdlIGV4dGVuZHMgU2Nob29sb2d5UGFnZV8xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKGNvdXJzZUlkKSB7XG4gICAgICAgIGxldCBjb250YWluZXJQYXRoID0gYCNjb3Vyc2UtZXZlbnRzIC51cGNvbWluZy1saXN0IC51cGNvbWluZy1ldmVudHMgLnVwY29taW5nLWxpc3RgO1xuICAgICAgICBsZXQgY291cnNlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjZW50ZXItdG9wPi5wYWdlLXRpdGxlJykuaW5uZXJUZXh0OyAvL2dyYWJzIGNvdXJzZSB0aXRsZVxuICAgICAgICBjb3Vyc2VOYW1lID0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykoY291cnNlTmFtZSk7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHBhZ2VUeXBlOiAnY291cnNlJyxcbiAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiBgJHtjb250YWluZXJQYXRofT5kaXZbZGF0YS1zdGFydF1gLFxuICAgICAgICAgICAgaW5mb1RvQmxvY2tFbDogZWwgPT4gZWwsXG4gICAgICAgICAgICBsaW1pdHM6IHtcbiAgICAgICAgICAgICAgICBjb3Vyc2VzOiBjb3Vyc2VOYW1lLFxuICAgICAgICAgICAgICAgIHRpbWU6ICdhbnknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvdXJzZUlkID0gY291cnNlSWQ7XG4gICAgICAgIHRoaXMuY291cnNlTmFtZSA9IGNvdXJzZU5hbWU7XG4gICAgICAgIHRoaXMuYWRkQ2hlY2ttYXJrcyh7XG4gICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclBhdGgpLFxuICAgICAgICAgICAgY3VzdG9tTWlkZGxlU2NyaXB0OiAoY2hlY2tFbCwgYXNnbXRFbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhc2dtdEVsLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZS1oZWFkZXInKSkgLy9kb2VzIG5vdCBhZGQgY2hlY2sgdG8gLmRhdGUtaGVhZGVyIGJ5IGNvbnRpbnVlO2luZyBvdXQgb2YgbG9vcFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2NvbnRpbnVlJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG86IGVsID0+IGVsLmZpcnN0Q2hpbGRcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGpfY2hlY2soeyBhc2dtdEVsLCBmb3JjZWRTdGF0ZSA9IG51bGwsIG9wdGlvbnM6IHsgc3RvcmVJbkNocm9tZSA9IHRydWUsIGFuaW1hdGUgPSBmYWxzZSAvL3Nob3dzIGFuaW1hdGlvbiB3aGVuIGNoZWNraW5nXG4gICAgIH0gfSkge1xuICAgICAgICBjb25zdCBwSGlnaGxpZ2h0ID0gISFhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTsgLy9iYXNlZCBvbiBjbGFzc0xpc3Qgb2YgYXNnbXRFbFxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGZvcmNlZFN0YXRlICE9PSBudWxsICYmIGZvcmNlZFN0YXRlICE9PSB2b2lkIDAgPyBmb3JjZWRTdGF0ZSA6ICFwSGlnaGxpZ2h0OyAvL29wcG9zaXRlIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgY29uc3QgY2hlY2ttYXJrRWwgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0LmpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWApO1xuICAgICAgICBjb25zdCBhc2dtdFRleHQgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKS5pbm5lclRleHQ7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgbmV3SGlnaGxpZ2h0OiBuZXdTdGF0ZSwgcEhpZ2hsaWdodCwgY2hlY2ttYXJrRWwgfSk7XG4gICAgICAgIGlmIChuZXdTdGF0ZSkgeyAvL25vIGhpZ2hsaWdodCBncmVlbiBhbHJlYWR5LCBzbyBjaGVja1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENoZWNraW5nICR7YXNnbXRUZXh0fWApO1xuICAgICAgICAgICAgLy9DaGVja1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoaWdobGlnaHRHcmVlbkVsID0gdGhpcy5jcmVhdGVHcmVlbkhpZ2hsaWdodEVsKHsgcGFnZVR5cGU6IHRoaXMucGFnZVR5cGUsIGFuaW1hdGUgfSk7XG4gICAgICAgICAgICBhc2dtdEVsLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJzsgLy9mb3IgZ3JlZW4gcmVjdCB0byBiZSBib3VuZCB0byBhc2dtdEVsXG4gICAgICAgICAgICBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2g0Jykuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnOyAvL3NvIHRoYXQgdGV4dCBhYm92ZSBjaGVja21hcmtcbiAgICAgICAgICAgIGFzZ210RWwuaW5zZXJ0QmVmb3JlKGhpZ2hsaWdodEdyZWVuRWwsIGFzZ210RWwuZmlyc3RDaGlsZCk7IC8vaW5zZXJ0IGFzIGZpcnN0IGVsZW1lbnQgKGJlZm9yZSBmaXJzdENoaWxkKVxuICAgICAgICAgICAgaWYgKHN0b3JlSW5DaHJvbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb3Vyc2VOYW1lIGluIHRoaXMuY291cnNlc0dsb2JhbCkgeyAvL2FscmVhZHkgZXhpc3RzLCBzbyBhcHBlbmRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW3RoaXMuY291cnNlTmFtZV0ucHVzaChhc2dtdFRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHsgLy9ub3QgZXhpc3QsIHNvIGNyZWF0ZSBjb3Vyc2UgbG9nXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZU5hbWVdID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZU5hbWVdLnB1c2goYXNnbXRUZXh0KTsgLy9wdXNoIHRvIG5ld2x5IGNyZWF0ZWQgY2xhc3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGVja2VkVGFza3ModGhpcy5jb3Vyc2VzR2xvYmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy91bmNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5jaGVja2luZyAke2FzZ210VGV4dH1gKTtcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHRvUmVtb3ZlID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7XG4gICAgICAgICAgICB0b1JlbW92ZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRvUmVtb3ZlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW3RoaXMuY291cnNlTmFtZV0ucG9wKC8vcmVtb3ZlIGNoZWNrZWRUYXNrR2xvYmFsIGZyb20gbGlzdFxuICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZU5hbWVdLmluZGV4T2YoYXNnbXRUZXh0KSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGVja2VkVGFza3ModGhpcy5jb3Vyc2VzR2xvYmFsKTsgLy91cGRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZU5hbWVdLnBvcCh0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VOYW1lXS5pbmRleE9mKGFzZ210VGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoZWNrZWRUYXNrcyh0aGlzLmNvdXJzZXNHbG9iYWwpO1xuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ291cnNlUGFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgU2Nob29sb2d5UGFnZV8xID0gcmVxdWlyZShcIi4vU2Nob29sb2d5UGFnZVwiKTtcbmNvbnN0IGNvbGxhcHNlT3ZlcmR1ZV8xID0gcmVxdWlyZShcIi4vY29sbGFwc2VPdmVyZHVlXCIpO1xuY29uc3QgZnVuY3Rpb25zXzEgPSByZXF1aXJlKFwiLi4vZnVuY3Rpb25zXCIpO1xuY2xhc3MgSG9tZVBhZ2UgZXh0ZW5kcyBTY2hvb2xvZ3lQYWdlXzEuZGVmYXVsdCB7XG4gICAgY29uc3RydWN0b3IoeyBjb250YWluZXJTZWxlY3RvcnMgfSkge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBwYWdlVHlwZTogJ2hvbWUnLFxuICAgICAgICAgICAgZ2V0QXNnbXRCeU5hbWVQYXRoRWw6IGNvbnRhaW5lclNlbGVjdG9ycy5tYXAocyA9PiBgJHtzfT5kaXZgKSxcbiAgICAgICAgICAgIGluZm9Ub0Jsb2NrRWw6IGVsID0+IGVsLFxuICAgICAgICAgICAgbGltaXRzOiB7XG4gICAgICAgICAgICAgICAgY291cnNlczogJyRhbGwnLFxuICAgICAgICAgICAgICAgIHRpbWU6ICdhbnknXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbXVsdGlwbGVBc2dtdENvbnRhaW5lcnM6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgICgwLCBjb2xsYXBzZU92ZXJkdWVfMS5kZWZhdWx0KSgpO1xuICAgICAgICBmb3IgKGxldCBjb250YWluZXJTZWxlY3RvciBvZiBjb250YWluZXJTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IGBoND5zcGFuYDtcbiAgICAgICAgICAgIGxldCBjb250YWluZXJDbGFzcyA9ICdqX2NoZWNrX2NvbnRhaW5lcic7XG4gICAgICAgICAgICB0aGlzLmFkZENoZWNrbWFya3Moe1xuICAgICAgICAgICAgICAgIGFzZ210RWxDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpLFxuICAgICAgICAgICAgICAgIGN1c3RvbU1pZGRsZVNjcmlwdDogKGNoZWNrRWwsIGFzZ210RWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzZ210RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlLWhlYWRlcicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdjb250aW51ZSc7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgeyAvL3ZhbGlkIGFzc2lnbm1tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgakNoZWNrQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgakNoZWNrQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoY29udGFpbmVyQ2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudE5vZGUgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoakNoZWNrQ29udGFpbmVyLCBwYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4udXBjb21pbmctdGltZScpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvOiBlbCA9PiBlbC5xdWVyeVNlbGVjdG9yKGAke3NlbGVjdG9yfSBzcGFuLiR7Y29udGFpbmVyQ2xhc3N9YCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBqX2NoZWNrKHsgYXNnbXRFbCwgZm9yY2VkU3RhdGUgPSBudWxsLCBvcHRpb25zOiB7IHN0b3JlSW5DaHJvbWUgPSB0cnVlLCBhbmltYXRlID0gZmFsc2UgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICB9IH0pIHtcbiAgICAgICAgY29uc29sZS5sb2coeyBhc2dtdEVsIH0pO1xuICAgICAgICBjb25zdCBwSGlnaGxpZ2h0ID0gISFhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTsgLy9iYXNlZCBvbiBjbGFzc0xpc3Qgb2YgYXNnbXRFbFxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGZvcmNlZFN0YXRlICE9PSBudWxsICYmIGZvcmNlZFN0YXRlICE9PSB2b2lkIDAgPyBmb3JjZWRTdGF0ZSA6ICFwSGlnaGxpZ2h0OyAvL29wcG9zaXRlIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgY29uc3QgY2hlY2ttYXJrRWwgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0LmpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWApO1xuICAgICAgICBjb25zdCB0ZW1wQW5jaG9yID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdhJyk7XG4gICAgICAgIGNvbnN0IGFzZ210VGV4dCA9IHRlbXBBbmNob3IuaW5uZXJUZXh0O1xuICAgICAgICBjb25zdCBjb3Vyc2VUZXh0ID0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykoYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoND5zcGFuJykuYXJpYUxhYmVsKTsgLy9uYW1lIG9mIGNvdXJzZSBiYXNlZCBvbiBhcmlhLWxhYmVsIG9mIGFzZ210RWwncyA8aDQ+J3MgPHNwYW4+J3MgPGRpdj5cbiAgICAgICAgLy8gY29uc29sZS5sb2coe2NvdXJzZVRleHQsIGFzZ210RWx9KTtcbiAgICAgICAgaWYgKG5ld1N0YXRlKSB7IC8vY2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyAnJHthc2dtdFRleHR9J2ApO1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoaWdobGlnaHRHcmVlbkVsID0gdGhpcy5jcmVhdGVHcmVlbkhpZ2hsaWdodEVsKHsgcGFnZVR5cGU6IHRoaXMucGFnZVR5cGUsIGFuaW1hdGUgfSk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2g0Jyk7XG4gICAgICAgICAgICBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2g0PnNwYW4nKS5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7IC8vc28gdGhhdCB0ZXh0IGFib3ZlIGNoZWNrbWFya1xuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShoaWdobGlnaHRHcmVlbkVsLCBwYXJlbnQuZmlyc3RDaGlsZCk7IC8vaW5zZXJ0IGFzIGZpcnN0IGVsZW1lbnQgKGJlZm9yZSBmaXJzdEVsZW1lbnQpXG4gICAgICAgICAgICBpZiAoc3RvcmVJbkNocm9tZSkge1xuICAgICAgICAgICAgICAgIGlmIChjb3Vyc2VUZXh0IGluIHRoaXMuY291cnNlc0dsb2JhbCkgeyAvL2FscmVhZHkgZXhpc3RzLCBzbyBhcHBlbmRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQucHVzaChhc2dtdFRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHsgLy9ub3QgZXhpc3QsIHNvIGNyZWF0ZSBjb3Vyc2UgbG9nXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFtjb3Vyc2VUZXh0XS5jaGVja2VkID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFtjb3Vyc2VUZXh0XS5jaGVja2VkLnB1c2goYXNnbXRUZXh0KTsgLy9wdXNoIHRvIG5ld2x5IGNyZWF0ZWQgY2xhc3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGVja2VkVGFza3ModGhpcy5jb3Vyc2VzR2xvYmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy91bmNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5jaGVja2luZyAnJHthc2dtdFRleHR9J2ApO1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgdG9SZW1vdmUgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTtcbiAgICAgICAgICAgIHRvUmVtb3ZlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodG9SZW1vdmUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbY291cnNlVGV4dF0uY2hlY2tlZC5wb3AoLy9yZW1vdmUgY2hlY2tlZFRhc2tHbG9iYWwgZnJvbSBsaXN0XG4gICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQuaW5kZXhPZihhc2dtdFRleHQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNoZWNrZWRUYXNrcyh0aGlzLmNvdXJzZXNHbG9iYWwpOyAvL3VwZGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQucG9wKHRoaXMuY291cnNlc0dsb2JhbFtjb3Vyc2VUZXh0XS5jaGVja2VkLmluZGV4T2YoYXNnbXRUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2hlY2tlZFRhc2tzKHRoaXMuY291cnNlc0dsb2JhbCk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBIb21lUGFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJqcXVlcnlcIi8+XG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cImNocm9tZVwiLz5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFNjaG9vbG9neVBhZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHsgcGFnZVR5cGUsIGdldEFzZ210QnlOYW1lUGF0aEVsLCBpbmZvVG9CbG9ja0VsLCBsaW1pdHMsIGlnbm9yZU9sZEFzZ210cyA9IHRydWUsIG11bHRpcGxlQXNnbXRDb250YWluZXJzID0gZmFsc2UgfSkge1xuICAgICAgICBjb25zb2xlLmxvZyh7IHBhZ2VUeXBlLCBnZXRBc2dtdEJ5TmFtZVBhdGhFbCwgaW5mb1RvQmxvY2tFbCwgbGltaXRzLCBpZ25vcmVPbGRBc2dtdHMsIG11bHRpcGxlQXNnbXRDb250YWluZXJzIH0pO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnc2V0dGluZ3MnLCAoeyBzZXR0aW5ncyB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2hvd0NoZWNrbWFya3MgPT09ICdvbkhvdmVyJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPbmx5IHNob3cgY2hlY2ttYXJrIG9uIGhvdmVyJyk7XG4gICAgICAgICAgICAgICAgLy9Mb2FkIHN0eWxlIGlmIG9ubHlTaG93Q2hlY2ttYXJrT25Ib3ZlclxuICAgICAgICAgICAgICAgIGxldCBzdHlsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgICAgICBzdHlsZUVsLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICAgICAgLmpfY2hlY2tfY2FsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjsgLyogYWxsIGlucHV0IGNoZWNrcyBoaWRkZW4gKi9cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuZmMtZXZlbnQ6aG92ZXIgLmpfY2hlY2tfY2FsIHsgLyogaW5wdXQgY2hlY2sgc2hvd24gb25ob3ZlciBvZiBhc2dtdCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFnZVR5cGUgPSBwYWdlVHlwZTsgLy9pbmRpY2F0ZXMgY3NzIGNsYXNzIGZvciBjaGVja2JveFxuICAgICAgICB0aGlzLm11bHRpcGxlQXNnbXRDb250YWluZXJzID0gbXVsdGlwbGVBc2dtdENvbnRhaW5lcnM7XG4gICAgICAgIHRoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWwgPSBnZXRBc2dtdEJ5TmFtZVBhdGhFbDsgLy9mcm9tIHdoZXJlIHRvIHNlYXJjaCA6Y29udGFpbnMoKSBvZiBhbiBhc2dtdCBieSBuYW1lXG4gICAgICAgIHRoaXMuaW5mb1RvQmxvY2tFbCA9IGluZm9Ub0Jsb2NrRWw7XG4gICAgICAgIHRoaXMuaWdub3JlT2xkQXNnbXRzID0gaWdub3JlT2xkQXNnbXRzO1xuICAgICAgICAvKntcbiAgICAgICAgICAgIGNvdXJzZXMsIC8vJyRhbGwnIHwgU3RyaW5nIG9mIGNvdXJzZSBuYW1lXG4gICAgICAgICAgICB0aW1lIC8vJ2FueScgfCAnZnV0dXJlJ1xuICAgICAgICB9Ki9cbiAgICAgICAgLy9saXN0ZW5zIGZvciBgcnVuICRjbWRgIG1lc3NhZ2UgZnJvbSBwb3B1cC5qc1xuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1zZywgc2VuZGVyLCByZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG1zZy5oYXNPd25Qcm9wZXJ0eSgncnVuJykpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1zZy5ydW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVsb2FkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrIGFsbCBhc2dtdHMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0FsbEFzZ210RWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGVjayBhbGwgYXNnbXRzIGJlZm9yZSB0b2RheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQWxsQXNnbXRFbEJlZm9yZVRvZGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Vua25vd24gcnVuIG1lc3NhZ2U6JywgbXNnLnJ1bik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9TZXRzIHRoaXMuY291cnNlc0dsb2JhbCB0byBjaHJvbWUgc3RvcmFnZVxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnY291cnNlcycsICh7IGNvdXJzZXMgfSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsID0gY291cnNlcztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3Vyc2VzJywgY291cnNlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsaW1pdHMpOyAvL3RpbWUgJiBjb3Vyc2UgbGltaXRzIHdoZW4gZ2V0dGluZyBhc2dtdHNcbiAgICAgICAgICAgIGlmIChsaW1pdHMuY291cnNlcyA9PT0gJyRhbGwnICYmIGxpbWl0cy50aW1lID09PSAnYW55JykgeyAvL2NhbGVuZGFyIG9yIGhvbWUgcGFnZVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNvdXJzZSBvZiBjb3Vyc2VzKSB7IC8vVE9ETzogY2hhbmdlIHNjaGVtYVxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tlZCA9IGNvdXJzZS5jaGVja2VkOyAvL2FzZ210c1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhc2dtdEVsIG9mIGNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5mb0VsLCBibG9ja0VsXSA9IHRoaXMuZ2V0QXNnbXRCeU5hbWUoYXNnbXRFbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mb0VsICE9PSAnTm8gbWF0Y2hlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNnbXRFbDogYmxvY2tFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxpbWl0cy5jb3Vyc2VzID09PSAnJGFsbCcgJiYgdGhpcy50aW1lID09PSAnZnV0dXJlJykgeyAvL25vdCBiZWluZyB1c2VkLCBwb3RlbnRpYWwgaWYgbm90IHByZXYgYXNnbXRzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsaW1pdHMuY291cnNlcyAhPT0gJyRhbGwnICYmIHRoaXMudGltZSA9PT0gJ2FueScpIHsgLy9jb3Vyc2UgcGFnZSAoYWxsIGFzZ210cyBvZiBjb3Vyc2UpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE9ubHkgY2hlY2tpbmcgdGhlIGNvdXJzZTogJHt0aGlzLmNvdXJzZXN9YCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvdXJzZXMgaW4gdGhpcy5jb3Vyc2VzR2xvYmFsKSB7IC8vaWYgY2hlY2tlZCBhc2dtdHMgb2YgdGhhdCBjb3Vyc2VcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFzZ210cyA9IHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZXNdO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXNnbXRzJywgYXNnbXRzKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYXNnbXRFbCBvZiBhc2dtdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5mb0VsLCBibG9ja0VsXSA9IHRoaXMuZ2V0QXNnbXRCeU5hbWUoYXNnbXRFbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mb0VsICE9PSAnTm8gbWF0Y2hlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNnbXRFbDogYmxvY2tFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNoZWNrQWxsQXNnbXRFbCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIGNoZWNrQWxsQXNnbXRFbEJlZm9yZVRvZGF5KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgYWRkQ2hlY2ttYXJrcyh7IC8vY2FsbGVkIGluIHN1YmNsYXNzJyBjb25zdHJ1Y3RvciwgYWRkcyBjaGVja21hcmtzIHRvIGVhY2ggYXNnbXQgZm9yIGNsaWNraW5nOyBjaGVja3MgdGhvc2UgY2hlY2ttYXJrcyBiYXNlZCBvbiBjaHJvbWUgc3RvcmFnZVxuICAgIGFzZ210RWxDb250YWluZXIsIC8vd2hlcmUgdGhlIGFzZ210cyBhcmUgbG9jYXRlZFxuICAgIGN1c3RvbU1pZGRsZVNjcmlwdCwgLy9hbm9ueW1vdXMgZnVuYyBleGVjdXRlZCBpbiB0aGUgbWlkZGxlXG4gICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvIC8vZGV0ZXJtaW5lcyBob3cgdG8gYWRkIGNoaWxkcmVuIGVscyBpZSBlbD0+ZWwucGFyZW50Tm9kZVxuICAgICB9KSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGFzZ210RWxDb250YWluZXIuY2hpbGRyZW47XG4gICAgICAgIGZvciAobGV0IGFzZ210RWwgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGxldCBjaGVja0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGNoZWNrRWwuY2xhc3NOYW1lID0gYGpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWA7XG4gICAgICAgICAgICBjaGVja0VsLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICAgICAgY2hlY2tFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9hbmltYXRlIGJlY2F1c2UgdXNlciBjbGlja2luZ1xuICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgIGFzZ210RWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlOiB0cnVlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgdG9SdW4gPSBjdXN0b21NaWRkbGVTY3JpcHQoY2hlY2tFbCwgYXNnbXRFbCk7IC8vcmV0dXJucyBzdHJpbmcgdG8gZXZhbHVhdGUgKHJhcmVseSB1c2VkKVxuICAgICAgICAgICAgaWYgKHRvUnVuID09PSAnY29udGludWUnKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvKGFzZ210RWwpLmFwcGVuZENoaWxkKGNoZWNrRWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldEFzZ210QnlOYW1lKGFzZ210TmFtZSkge1xuICAgICAgICBsZXQgcXVlcnksIHF1ZXJ5UmVzO1xuICAgICAgICBjb25zb2xlLmxvZyhhc2dtdE5hbWUsIHRoaXMubXVsdGlwbGVBc2dtdENvbnRhaW5lcnMpO1xuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZUFzZ210Q29udGFpbmVycykgeyAvL211bHRpcGxlIGFzZ210IGNvbnRhaW5lcnMgdG8gY2hlY2tcbiAgICAgICAgICAgIGZvciAobGV0IGdldEFzZ210QnlOYW1lUGF0aEVsIG9mIHRoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWwpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IGAke2dldEFzZ210QnlOYW1lUGF0aEVsfTpjb250YWlucygnJHthc2dtdE5hbWUucmVwbGFjZUFsbChgJ2AsIGBcXFxcJ2ApIC8qIGVzY2FwZSBxdW90ZSBtYXJrcyAqL30nKWA7XG4gICAgICAgICAgICAgICAgcXVlcnlSZXMgPSBqUXVlcnkocXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChxdWVyeVJlcy5sZW5ndGggPiAwKSAvL2tlZXBzIGdvaW5nIHRocnUgYXNnbXRDb250YWluZXJzIHVudGlsIHF1ZXJ5UmVzIGlzIGFuIGFzZ210XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBxdWVyeSA9IGAke3RoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWx9OmNvbnRhaW5zKCcke2FzZ210TmFtZS5yZXBsYWNlQWxsKGAnYCwgYFxcXFwnYCkgLyogZXNjYXBlIHF1b3RlIG1hcmtzICovfScpYDtcbiAgICAgICAgICAgIHF1ZXJ5UmVzID0galF1ZXJ5KHF1ZXJ5KTsgLy9oYXMgaW5mbyAoY291cnNlICYgZXZlbnQpLCBpZGVudGlmaWVyXG4gICAgICAgICAgICAvL2pRdWVyeSdzIDpjb250YWlucygpIHdpbGwgbWF0Y2ggZWxlbWVudHMgd2hlcmUgYXNnbXROYW1lIGlzIGEgc3Vic3RyaW5nIG9mIHRoZSBhc2dtdC4gZWxzZSBpZiBiZWxvdyBoYW5kbGVzIG92ZXJsYXBzXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZm9FbDtcbiAgICAgICAgaWYgKHF1ZXJ5UmVzLmxlbmd0aCA9PT0gMSkgLy9vbmx5IG9uZSBtYXRjaGluZyBlbGVtZW50cyDwn5GNXG4gICAgICAgICAgICBpbmZvRWwgPSBxdWVyeVJlc1swXTtcbiAgICAgICAgZWxzZSBpZiAocXVlcnlSZXMubGVuZ3RoID49IDIpIHsgLy8yKyBjb25mbGljdGluZyBtYXRjaGVzIPCfpI8gc28gc28gIChuZWVkcyBwcm9jZXNzaW5nIHRvIGZpbmQgcmlnaHQgZWxlbWVudClcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlSZXMubGVuZ3RoOyBpKyspIHsgLy90ZXN0IGZvciBldmVyeSBlbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5UmVzW2ldLmZpcnN0Q2hpbGQubm9kZVZhbHVlID09PSBhc2dtdE5hbWUpIHsgLy9pZiBlbGVtZW50J3MgYXNnbXQgdGl0bGUgbWF0Y2hlcyBhc2dtdE5hbWUsIHRoYXQgaXMgdGhlIHJpZ2h0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgaW5mb0VsID0gcXVlcnlSZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy9yZXR1cm5zIGlmIG5vIG1hdGNoZXMg8J+RjlxuICAgICAgICAgICAgaWYgKCF0aGlzLmlnbm9yZU9sZEFzZ210cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE5vIGVsZW1lbnRzIG1hdGNoZWQgJHthc2dtdE5hbWV9YCwge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiB0aGlzLmdldEFzZ210QnlOYW1lUGF0aEVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVJlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9FbFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgJ1RoaXMgZXJyb3IgbWF5IGJlIGNhdXNlZCBieSBvbGQgYXNnbXRzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gWydObyBtYXRjaGVzJywgJ05vIG1hdGNoZXMnXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYmxvY2tFbCA9IHRoaXMuaW5mb1RvQmxvY2tFbChpbmZvRWwpOyAvL2Jsb2NrIChoYXMgc3R5bGVzKVxuICAgICAgICByZXR1cm4gW2luZm9FbCwgYmxvY2tFbF07XG4gICAgfVxuICAgIGpfY2hlY2soeyAvL3BvbHltb3JwaGlzbSBhbGxvd3MgdGhpcyBmdW5jdGlvbiB0byBiZSBzcGVjaWFsaXplZCBhbW9uZyBlYWNoIFNjaG9vbG9neVBhZ2Ugc3ViY2xhc3MuIEhvd2V2ZXIsIGl0IGlzIGNhbGxlZCBmcm9tIHRoaXMgU2Nob29sb2d5UGFnZVxuICAgIC8vIEJlbG93IGFyZSB0aGUgY29udmVudGlvbmFsIGlucHV0c1xuICAgIGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgLy9pZiBudWxsLCBqX2NoZWNrIHRvZ2dsZXMuIGlmIHRydWUvZmFsc2UsIGl0IGZvcmNlcyBpbnRvIHRoYXQgc3RhdGVcbiAgICBvcHRpb25zOiB7IHN0b3JlSW5DaHJvbWUgPSB0cnVlLCBhbmltYXRlID0gZmFsc2UgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICB9IH0pIHsgfVxuICAgIGNyZWF0ZUdyZWVuSGlnaGxpZ2h0RWwoeyAvL2NyZWF0ZXMgaGlnaGxpZ2h0R3JlZW5FbCB3aXRoIGFuaW1hdGUvbm8gYW5pbWF0ZVxuICAgIHBhZ2VUeXBlLCBhbmltYXRlIC8vOiBCb29sZWFuXG4gICAgIH0pIHtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgaGlnaGxpZ2h0R3JlZW4uY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0LWdyZWVuJyk7XG4gICAgICAgIGhpZ2hsaWdodEdyZWVuLmNsYXNzTGlzdC5hZGQoYGhpZ2hsaWdodC1ncmVlbi0ke3BhZ2VUeXBlfWApO1xuICAgICAgICBoaWdobGlnaHRHcmVlbi5pbm5lckhUTUwgPSAvKiBoaWdobGlnaHQgYW5pbWFnZWQgc3ZnICovIGBcbiAgICAgICAgICAgIDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB2ZXJzaW9uPScxLjEnIHByZXNlcnZlQXNwZWN0UmF0aW89J25vbmUnIHZpZXdCb3g9JzAgMCAxMCAxMCdcbiAgICAgICAgICAgICAgICBzdHlsZT0nd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgdHJhbnNmb3JtOiBzY2FsZVgoLTEpJz5cbiAgICAgICAgICAgICAgICA8IS0tIERhcmsgR3JlZW4gQmFja2dyb3VuZCAtLT5cbiAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPSdyZ2IoMTE1LCAyNTIsIDEyNyknIGQ9J00gMTAgMCBMIDEwIDEwIEwgMCAxMCBMIDAgMCBaJyAvPlxuICAgICAgICAgICAgICAgIDwhLS0gU2xhc2ggQmV0d2VlbiBDZW50ZXIgLS0+XG4gICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSdncmVlbicgZD0nTSAwIDAgTCAxMCAxMCBaJz5cbiAgICAgICAgICAgICAgICAkeyAvL2lmIGFuaW1hdGUsIGFkZCBhbiBhbmltYXRpb24gdGFnIGluc2lkZSA8cGF0aD5cbiAgICAgICAgYW5pbWF0ZVxuICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgIGA8IS0tIEFuaW1hdGlvbiBub3RlczogYXQgc3RhcnQsIG5vIG1vdmVtZW50LiBncmFkdWFsbHkgZ2V0cyBmYXN0ZXIgYW5kIGZhc3RlciAtLT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU9J2QnXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXI9JzAuMnMnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRDb3VudD0nMSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcz0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuNyAwLjcgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTCA3LjI5IDcuMjkgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTCA3LjI5IDcuMjkgTCA4LjM5IDguMzkgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTCA3LjI5IDcuMjkgTCA4LjM5IDguMzkgTCAxMCAxMCBMJ1xuICAgICAgICAgICAgICAgICAgICAvPmAgOiAnJ31cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSdncmVlbicgZD0nTSAwIDAgTCAxMCAxMCBaJz5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIGA7XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRHcmVlbjtcbiAgICB9XG4gICAgdXBkYXRlQ2hlY2tlZFRhc2tzKGNvdXJzZXNHbG9iYWwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1VwZGF0aW5nIHRvICcsIGNvdXJzZXNHbG9iYWwpO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IGNoZWNrZWRUYXNrczogY291cnNlc0dsb2JhbCB9KTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBTY2hvb2xvZ3lQYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjb2xsYXBzZU92ZXJkdWUoKSB7XG4gICAgY29uc3Qgb3ZlcmR1ZVdyYXBwZXJQYXRoID0gYGRpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXJgO1xuICAgIGxldCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgcmVhZHkgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXI+ZGl2LnVwY29taW5nLWxpc3QnKTtcbiAgICAgICAgaWYgKHJlYWR5KSB7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnc2V0dGluZ3MnLCAoeyBzZXR0aW5ncyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc2V0dGluZ3Mub3ZlcmR1ZUNvbGxhcHNlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBzZXQobmV3VmFsKSB7XG4gICAgICAgICAgICBsZXQgb2xkU2V0dGluZ3MgPSBhd2FpdCBnZXQoKTtcbiAgICAgICAgICAgIGxldCBuZXdTZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIG9sZFNldHRpbmdzKTtcbiAgICAgICAgICAgIG5ld1NldHRpbmdzLm92ZXJkdWVDb2xsYXBzZWQgPSBuZXdWYWw7XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IG5ld1NldHRpbmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5pdGlhbFZhbCA9IGF3YWl0IGdldCgpO1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG92ZXJkdWVXcmFwcGVyUGF0aCArICc+aDMnKTtcbiAgICAgICAgY29uc3QgY29sbGFwc2VCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29sbGFwc2VCdG4uc3R5bGUubWFyZ2luTGVmdCA9ICc0cmVtJzsgLy9kaXN0YW5jZSBiZXR3ZWVuIHRleHRcbiAgICAgICAgY29sbGFwc2VCdG4uaW5uZXJUZXh0ID0gJ0hpZGUgT3ZlcmR1ZSBBc3NpZ25tZW50cyc7XG4gICAgICAgIGNvbGxhcHNlQnRuLmNsYXNzTGlzdC5hZGQoJ2pfYnV0dG9uJyk7XG4gICAgICAgIGNvbGxhcHNlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsID0gIShhd2FpdCBnZXQoKSk7IC8vb3Bwb3NpdGUgb2Ygb2xkVmFsXG4gICAgICAgICAgICByZXJlbmRlckNvbGxhcHNlQnRuKG5ld1ZhbCk7XG4gICAgICAgICAgICBzZXQobmV3VmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb2xsYXBzZUJ0bik7XG4gICAgICAgIHJlcmVuZGVyQ29sbGFwc2VCdG4oaW5pdGlhbFZhbCk7IC8vaW5pdGlhbCBjYWxsXG4gICAgICAgIGZ1bmN0aW9uIHJlcmVuZGVyQ29sbGFwc2VCdG4obmV3VmFsKSB7XG4gICAgICAgICAgICBjb25zdCBhc2dtdHNFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3ZlcmR1ZVdyYXBwZXJQYXRoICsgJz5kaXYudXBjb21pbmctbGlzdCcpO1xuICAgICAgICAgICAgYXNnbXRzRWwuY2xhc3NMaXN0LnRvZ2dsZSgnal9jb2xsYXBzZWQnLCBuZXdWYWwpOyAvL2NsYXNzIGlmIG5ld1ZhbFxuICAgICAgICAgICAgY29sbGFwc2VCdG4uaW5uZXJUZXh0ID0gbmV3VmFsID8gJ1Nob3cgT3ZlcmR1ZSBBc3NpZ25tZW50cycgOiAnSGlkZSBPdmVyZHVlIEFzc2lnbm1lbnRzJztcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IGNvbGxhcHNlT3ZlcmR1ZTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IENhbGVuZGFyUGFnZV8xID0gcmVxdWlyZShcIi4vcGFnZXMvQ2FsZW5kYXJQYWdlXCIpO1xuY29uc3QgSG9tZVBhZ2VfMSA9IHJlcXVpcmUoXCIuL3BhZ2VzL0hvbWVQYWdlXCIpO1xuY29uc3QgQ291cnNlUGFnZV8xID0gcmVxdWlyZShcIi4vcGFnZXMvQ291cnNlUGFnZVwiKTtcbi8vVGhpcyBzY3JpcHQgaXMgaW5qZWN0ZWQgaW50byBldmVyeSBwYWdlLlxuLy9GdW5jdGlvbnMgYXJlIGluIHNlcXVlbnRpYWwgb3JkZXJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZGV0ZXJtaW5lU2Nob29sb2d5UGFnZVR5cGUsIGZhbHNlKTsgLy93YWl0IGZvciBET00gZWxlbWVudHMgdG8gbG9hZFxuZnVuY3Rpb24gZXhlY3V0ZUFmdGVyRG9uZUxvYWRpbmcoY2FsbGJhY2ssIC8vZXhlY3V0ZWQgYWZ0ZXJcbmlzTG9hZGluZyA9ICgpID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51cGNvbWluZy1saXN0Pi5yZWZyZXNoLXdyYXBwZXIgaW1nW2FsdD1cIkxvYWRpbmdcIl0nKSAhPSBudWxsIC8vZGVmYXVsdCBpcyBpZiB0aGVyZSBpcyBubyBsb2FkaW5nIHN5bWJvbCBvbiB0aGUgcGFnZVxuKSB7XG4gICAgbGV0IGludGVydmFsSUQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChpc0xvYWRpbmcoKSkge1xuICAgICAgICAgICAgLy8gQ29udGludWUgd2FpdGluZ1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcuLi4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRCk7IC8vc3RvcCBpbnRlcnZhbFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMCk7XG59XG5mdW5jdGlvbiBkZXRlcm1pbmVTY2hvb2xvZ3lQYWdlVHlwZSgpIHtcbiAgICBqUXVlcnkubm9Db25mbGljdCgpOyAvL3NjaG9vbG9neSBhbHNvIGhhcyBpdHMgb3duIGpRdWVyeSwgc28gdXNlIGBqUXVlcnlgIGluc3RlYWQgb2YgYCRgIHRvIGF2b2lkIGNvbmZsaWN0XG4gICAgLy8gY29uc29sZS5sb2coJzEuIEV4dGVuc2lvbiBydW5uaW5nJyk7XG4gICAgLy9DYWxlbmRhclxuICAgIGNvbnN0IGhhc1NjaG9vbG9neVNjcmlwdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBzY3JpcHRbc3JjKj0nc2Nob29sb2d5LmNvbSddYCk7IC8vc2Nob29sb2d5IHBhZ2VcbiAgICBpZiAoaGFzU2Nob29sb2d5U2NyaXB0cykgeyAvL3NjaG9vbG9neSBwYWdlIChkZXRlcm1pbmUgd2hpY2ggb25lKVxuICAgICAgICBjb25zdCBoYXNDYWxlbmRhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmY2FsZW5kYXInKTsgLy9jYWxlbmRhciBwYWdlXG4gICAgICAgIGNvbnN0IHVybEhhc0NhbGVuZGFyID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCdjYWxlbmRhcicpO1xuICAgICAgICBpZiAoaGFzQ2FsZW5kYXIgJiYgdXJsSGFzQ2FsZW5kYXIpIHsgLy90eXBlIDE6IHNjaG9vbG9neSBjYWxlbmRhclxuICAgICAgICAgICAgd2FpdEZvckV2ZW50c0xvYWRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vTm90IGNhbGVuZGFyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGhhc0NvdXJzZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXFwvY291cnNlXFwvKFxcZCspXFwvLyk7XG4gICAgICAgICAgICBpZiAoaGFzQ291cnNlKSB7IC8vdHlwZSAyOiBjb3Vyc2UgbWF0ZXJpYWxzIHBhZ2VcbiAgICAgICAgICAgICAgICBsZXQgY291cnNlSWQgPSBoYXNDb3Vyc2VbMV07XG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFmdGVyRG9uZUxvYWRpbmcoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXcgQ291cnNlUGFnZV8xLmRlZmF1bHQoY291cnNlSWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCdob21lJykpIHsgLy90eXBlIDM6IHNjaG9vbG9neSBob21lIHBhZ2VcbiAgICAgICAgICAgICAgICBleGVjdXRlQWZ0ZXJEb25lTG9hZGluZygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBIb21lUGFnZV8xLmRlZmF1bHQoeyBjb250YWluZXJTZWxlY3RvcnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2LnVwY29taW5nLWV2ZW50cy13cmFwcGVyPmRpdi51cGNvbWluZy1saXN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2Lm92ZXJkdWUtc3VibWlzc2lvbnMtd3JhcHBlcj5kaXYudXBjb21pbmctbGlzdCcsIC8vb3ZlcmR1ZSBhc2dtdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIF0gfSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4gIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXI+ZGl2LnVwY29taW5nLWxpc3QnKSk7IC8vY2hlY2sgaWYgdXBjb21pbmcgbGlzdCBleGlzdHMsIG5vdCBpZiBsb2FkaW5nIGljb24gZG9lcyBub3QgZXhpc3RcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgeyAvL05vbi1zY2hvb2xvZ3ktcmVsYXRlZCBwYWdlXG4gICAgICAgICAgICAgICAgLy9wYXNzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLzxoMT4gQ0FMRU5EQVJcbi8vUmVzaXplIGV2ZW50IGxpc3RlbmVyXG5mdW5jdGlvbiB3YWl0Rm9yRXZlbnRzTG9hZGVkKCkge1xuICAgIGxldCBjaGVja0lmRXZlbnRzTG9hZGVkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgY2FsZW5kYXJFdmVudHNMb2FkZWQgPSBqUXVlcnkoJyNmY2FsZW5kYXI+ZGl2LmZjLWNvbnRlbnQ+ZGl2LmZjLXZpZXc+ZGl2JylbMF0uY2hpbGRyZW4ubGVuZ3RoID49IDM7IC8vbW9yZSB0aGFuIHRocmVlIGFzZ210cyBvbiBjYWxlbmRhciBpbmRpY2F0aW5nIGFzZ210cyBsb2FkZWRcbiAgICAgICAgaWYgKGNhbGVuZGFyRXZlbnRzTG9hZGVkKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGNoZWNrSWZFdmVudHNMb2FkZWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJzMuIEFkZCBjaGVja21hcmtzJyk7XG4gICAgICAgICAgICAvLyBTY2hvb2xvZ3lDYWxlbmRhclBhZ2UoKTtcbiAgICAgICAgICAgIG5ldyBDYWxlbmRhclBhZ2VfMS5kZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3RpbGwgd2FpdGluZyBmb3IgY2FsZW5kYXIgZXZlbnRzIHRvIGxvYWQnKTtcbiAgICAgICAgfVxuICAgIH0sIDIwMCk7XG59XG4vLyAqIENPTkZJR1xuLy8gY29uc3QgaG9tZXdvcmtDaGVja2VyU2Nob29sb2d5Q29uZmlnPXtcbi8vICAgICB2ZXJib3NlOiB0cnVlIC8vd2hldGhlciBvciBub3QgdG8gc2hvdyBjb25zb2xlIG1lc3NhZ2VzXG4vLyB9XG4vLyBcbi8vIDxNb2RpZnkgY29uc29sZS5sb2coKSBhbmQgY29uc29sZS5lcnJvcigpXG4vLyBsZXQgb2dDb25zb2xlTG9nPWNvbnNvbGUubG9nO1xuLy8gY29uc29sZS5sb2c9KC4uLmFyZ3MpPT57XG4vLyAgICAgaWYgKGhvbWV3b3JrQ2hlY2tlclNjaG9vbG9neUNvbmZpZy52ZXJib3NlKVxuLy8gICAgICAgICBvZ0NvbnNvbGVMb2coYOKTomAsIC4uLmFyZ3MpO1xuLy8gfTtcbi8vIGxldCBvZ0NvbnNvbGVFcnJvcj1jb25zb2xlLmVycm9yO1xuLy8gY29uc29sZS5lcnJvcj0oLi4uYXJncyk9Pntcbi8vICAgICBpZiAoaG9tZXdvcmtDaGVja2VyU2Nob29sb2d5Q29uZmlnLnZlcmJvc2UpXG4vLyAgICAgb2dDb25zb2xlRXJyb3IoYOKTomAsIC4uLmFyZ3MpO1xuLy8gfTtcbi8vIC8+XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=