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
            const dateURL = `${year}-${month}`;
            console.log({ dateURL });
            const oldPathname = window.location.pathname.match(/(.*\/)\d{4}-\d{2}/)[1]; //removes last ####-## part of URL
            const newPathname = `${oldPathname}${dateURL}`;
            window.location.pathname = newPathname;
        }
        //Revives when checkmarks disappear due to asgmts re-render (such as when window resized or added a personal asgmt)
        setInterval(() => {
            if (!document.querySelector('.j_check_cal')) //checkmarks don't exist anymore
                new CalendarPage(); //revive checkmarks
            //alternative: window.location.reload()
        }, 300);
    }
    checkAllAsgmts() {
        const elementsByDate = jQuery(`span[class*='day-']`);
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
    checkAllAsgmtsBeforeToday() {
        const elementsByDate = jQuery(`span[class*='day-']`);
        const today = new Date().getDate();
        for (let el of elementsByDate) {
            const dayOfEl = parseInt(el.className.slice(-2));
            const beforeToday = dayOfEl < today;
            if (beforeToday) { //before today
                const asgmtEl = el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
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
        const pHighlight = asgmtEl.querySelector('.highlight-green'); //based on item inside asgmt
        const checkmarkEl = asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const asgmtText = asgmtEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of asgmt (firstChild), not including inside grandchildren like innerText()
        const courseText = (0, functions_1.removeSpaces)(asgmtEl.querySelector(`.fc-event-inner>.fc-event-title span[class*='realm-title']`).innerText); /* most child span can have class of realm-title-user or realm-title-course based on whether or not it is a personal event */
        const newState = forcedState !== null && forcedState !== void 0 ? forcedState : pHighlight == null; //if user forced state, override newHighlight
        if (newState) { //no highlight green already
            console.log(`Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked = true;
            const highlightGreenEl = this.createGreenHighlightEl({ pageType: this.pageType, animate });
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstElement)
            if (storeInChrome)
                this.addAsgmt(courseText, asgmtText, { createCourseIfNotExist: true });
        }
        else {
            console.log(`Unchecking ${asgmtText}`);
            //Uncheck
            checkmarkEl.checked = false;
            asgmtEl.removeChild(pHighlight);
            // coursesGlobal.pop(coursesGlobal.indexOf(asgmtText));
            this.removeAsgmt(courseText, asgmtText);
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
        const pHighlight = asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
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
                this.updateCourses(this.coursesGlobal);
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
                this.updateCourses(this.coursesGlobal); //update
            }
            catch (err) {
                console.error(err);
                setTimeout(() => {
                    this.coursesGlobal[this.courseName].pop(this.coursesGlobal[this.courseName].indexOf(asgmtText));
                    this.updateCourses(this.coursesGlobal);
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
                this.updateCourses(this.coursesGlobal);
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
                this.updateCourses(this.coursesGlobal); //update
            }
            catch (err) {
                console.error(err);
                setTimeout(() => {
                    this.coursesGlobal[courseText].checked.pop(this.coursesGlobal[courseText].checked.indexOf(asgmtText));
                    this.updateCourses(this.coursesGlobal);
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
                        this.checkAllAsgmts();
                        break;
                    case 'check all asgmts before today':
                        this.checkAllAsgmtsBeforeToday();
                        break;
                    default:
                        console.error('Unknown run message:', msg.run);
                }
            }
            return true;
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
            return true;
        });
    }
    checkAllAsgmts() {
        throw new Error("Method not implemented.");
    }
    checkAllAsgmtsBeforeToday() {
        throw new Error("Method not implemented.");
    }
    //* <methods to interact with this.courseGlobal
    getCourse(name) {
        return this.coursesGlobal.find(course => course.name === name);
    }
    createCourse(course, options) {
        this.coursesGlobal.push({
            name: course,
            noSpacesName: '$Filler',
            checked: []
        });
        if (!options.dontSave) //save unless specified to not save
            this.updateCourses();
    }
    /**
     * @param course name
     * @returns course name
    */
    deleteCourse(name) {
        delete this.coursesGlobal[this.coursesGlobal.findIndex(course => course.name === name) //get index
        ];
        this.updateCourses().then(() => {
            return name;
        });
    }
    /**
     * @param course course name
     * @param asgmt assignment name
     */
    addAsgmt(course, asgmt, options) {
        if (options.createCourseIfNotExist && this.getCourse(course) === undefined) //create course if not exists
            this.createCourse(course, { dontSave: true });
        this.getCourse(course).checked.push(asgmt);
        this.updateCourses();
    }
    removeAsgmt(courseName, asgmt) {
        this.getCourse(courseName).checked = this.getCourse(courseName).checked.filter(item => (item !== asgmt));
        this.updateCourses().then(() => {
            return asgmt;
        });
    }
    /**
     * Updates chrome's storage with checked tasks parameter
     * @returns Promise boolean succeeded?
     * */
    updateCourses(newCourses) {
        newCourses = newCourses !== null && newCourses !== void 0 ? newCourses : this.coursesGlobal; //default is this.coursesGlobal
        const data = JSON.stringify({ courses: newCourses });
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                run: 'update chrome storage',
                data
            }, response => {
                return resolve(response); //succeeded or not
            });
        });
    }
    //* >
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
    //creates highlightGreenEl with animate/no animate
    createGreenHighlightEl({ pageType, animate = true }) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudCBzY3JpcHQgYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7Ozs7Ozs7Ozs7O0FDYlA7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Qsd0JBQXdCLG1CQUFPLENBQUMscURBQWlCO0FBQ2pELG9CQUFvQixtQkFBTyxDQUFDLHdDQUFjO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0EsMEdBQTBHO0FBQzFHLDBHQUEwRztBQUMxRztBQUNBLHVFQUF1RTtBQUN2RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsS0FBSyxHQUFHLE1BQU07QUFDN0MsMEJBQTBCLFNBQVM7QUFDbkMseUVBQXlFLEVBQUUsSUFBSSxFQUFFLE9BQU87QUFDeEYsbUNBQW1DLFlBQVksRUFBRSxRQUFRO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLEdBQUc7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBLGNBQWMsd0NBQXdDO0FBQ3RELFFBQVE7QUFDUjtBQUNBLHNFQUFzRTtBQUN0RSxtRUFBbUUsY0FBYztBQUNqRiw4R0FBOEc7QUFDOUcseUpBQXlKO0FBQ3pKLDRHQUE0RztBQUM1Ryx3QkFBd0I7QUFDeEIsb0NBQW9DLFVBQVU7QUFDOUM7QUFDQTtBQUNBLG1FQUFtRSxrQ0FBa0M7QUFDckcsd0VBQXdFO0FBQ3hFO0FBQ0EsdURBQXVELDhCQUE4QjtBQUNyRjtBQUNBO0FBQ0Esc0NBQXNDLFVBQVU7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFlOzs7Ozs7Ozs7OztBQ2hKRjtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCx3QkFBd0IsbUJBQU8sQ0FBQyxxREFBaUI7QUFDakQsb0JBQW9CLG1CQUFPLENBQUMsd0NBQWM7QUFDMUM7QUFDQTtBQUNBO0FBQ0Esc0ZBQXNGO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxjQUFjO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdIQUFnSDtBQUNoSDtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBLGNBQWMsd0NBQXdDO0FBQ3RELFFBQVE7QUFDUixzRUFBc0U7QUFDdEUscUdBQXFHO0FBQ3JHLG1FQUFtRSxjQUFjO0FBQ2pGO0FBQ0Esc0JBQXNCLGlEQUFpRDtBQUN2RSx3QkFBd0I7QUFDeEIsb0NBQW9DLFVBQVU7QUFDOUM7QUFDQTtBQUNBLG1FQUFtRSxrQ0FBa0M7QUFDckcsaURBQWlEO0FBQ2pELHFFQUFxRTtBQUNyRSx3RUFBd0U7QUFDeEU7QUFDQSw2REFBNkQ7QUFDN0Q7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBLHlFQUF5RTtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZixzQ0FBc0MsVUFBVTtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0Q7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWU7Ozs7Ozs7Ozs7O0FDM0VGO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHdCQUF3QixtQkFBTyxDQUFDLHFEQUFpQjtBQUNqRCwwQkFBMEIsbUJBQU8sQ0FBQyx5REFBbUI7QUFDckQsb0JBQW9CLG1CQUFPLENBQUMsd0NBQWM7QUFDMUM7QUFDQSxrQkFBa0Isb0JBQW9CO0FBQ3RDO0FBQ0E7QUFDQSxpRUFBaUUsRUFBRTtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQix1RUFBdUUsVUFBVSxPQUFPLGVBQWU7QUFDdkcsYUFBYTtBQUNiO0FBQ0E7QUFDQSxjQUFjLHdDQUF3QztBQUN0RCxRQUFRO0FBQ1Isc0JBQXNCLFNBQVM7QUFDL0Isd0VBQXdFO0FBQ3hFLHFHQUFxRztBQUNyRyxtRUFBbUUsY0FBYztBQUNqRjtBQUNBO0FBQ0Esc0dBQXNHO0FBQ3RHLHdCQUF3QixvQkFBb0I7QUFDNUMsd0JBQXdCO0FBQ3hCLHFDQUFxQyxVQUFVO0FBQy9DO0FBQ0EsbUVBQW1FLGtDQUFrQztBQUNyRztBQUNBLDBFQUEwRTtBQUMxRSxzRUFBc0U7QUFDdEU7QUFDQSx3REFBd0Q7QUFDeEQ7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBLDRFQUE0RTtBQUM1RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZix1Q0FBdUMsVUFBVTtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0Q7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWU7Ozs7Ozs7Ozs7O0FDckZGO0FBQ2I7QUFDQTtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RDtBQUNBLGtCQUFrQixnSEFBZ0g7QUFDbEksc0JBQXNCLGlHQUFpRztBQUN2SCwrQ0FBK0MsVUFBVTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxrQ0FBa0M7QUFDbEM7QUFDQSwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSw4Q0FBOEMsU0FBUztBQUN2RDtBQUNBO0FBQ0EsaUNBQWlDO0FBQ2pDLHNFQUFzRTtBQUN0RSw4Q0FBOEM7QUFDOUMsa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsNEVBQTRFO0FBQzVFO0FBQ0EseUVBQXlFO0FBQ3pFLHlEQUF5RCxhQUFhO0FBQ3RFLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsZ0JBQWdCO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFHQUFxRztBQUNyRyxzQ0FBc0MscUJBQXFCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLDBDQUEwQztBQUMxQyxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQSxvQkFBb0IsK0VBQStFO0FBQ25HO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsY0FBYztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiLDhEQUE4RDtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsMkJBQTJCLHFCQUFxQixhQUFhLDBEQUEwRDtBQUN2SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLDBCQUEwQixhQUFhLDBEQUEwRDtBQUN4SCxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QztBQUN6Qyw0QkFBNEIscUJBQXFCLE9BQU87QUFDeEQsc0VBQXNFO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQSxxREFBcUQsVUFBVTtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLGVBQWU7QUFDZixRQUFRO0FBQ1I7QUFDQSw2QkFBNkIsMEJBQTBCO0FBQ3ZEO0FBQ0E7QUFDQSx3REFBd0QsU0FBUztBQUNqRTtBQUNBO0FBQ0Esb0NBQW9DLGNBQWM7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFlOzs7Ozs7Ozs7OztBQ3hSRjtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxVQUFVO0FBQ2pFO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7QUFDQSw4REFBOEQ7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBZTs7Ozs7OztVQy9DZjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7O0FDdEJhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHVCQUF1QixtQkFBTyxDQUFDLHlEQUFzQjtBQUNyRCxtQkFBbUIsbUJBQU8sQ0FBQyxpREFBa0I7QUFDN0MscUJBQXFCLG1CQUFPLENBQUMscURBQW9CO0FBQ2pEO0FBQ0E7QUFDQSxvRUFBb0U7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0EsMkZBQTJGO0FBQzNGLCtCQUErQjtBQUMvQixrRUFBa0U7QUFDbEU7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxrRUFBa0U7QUFDbEU7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQixpQkFBaUIsdUZBQXVGO0FBQ3hHO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdIQUFnSDtBQUNoSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL2Z1bmN0aW9ucy50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvQ2FsZW5kYXJQYWdlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9Db3Vyc2VQYWdlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9Ib21lUGFnZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvU2Nob29sb2d5UGFnZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvY29sbGFwc2VPdmVyZHVlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVtb3ZlU3BhY2VzID0gdm9pZCAwO1xuZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKGlucHV0KSB7XG4gICAgLy8gRGlmZmVyZW50IHNwYWNpbmcgYmVsb3c6XG4gICAgLy8gXCJBbGdlYnJhIElJIChIKTogQUxHRUJSQSBJSSBIIC0gR1wiXG4gICAgLy8gXCJBbGdlYnJhIElJIChIKSA6IEFMR0VCUkEgSUkgSCAtIEcgXCJcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgY2hhcmFjdGVyIG9mIGlucHV0KVxuICAgICAgICBpZiAoY2hhcmFjdGVyICE9PSAnICcpXG4gICAgICAgICAgICBzdHIgKz0gY2hhcmFjdGVyO1xuICAgIHJldHVybiBzdHI7XG59XG5leHBvcnRzLnJlbW92ZVNwYWNlcyA9IHJlbW92ZVNwYWNlcztcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgU2Nob29sb2d5UGFnZV8xID0gcmVxdWlyZShcIi4vU2Nob29sb2d5UGFnZVwiKTtcbmNvbnN0IGZ1bmN0aW9uc18xID0gcmVxdWlyZShcIi4uL2Z1bmN0aW9uc1wiKTtcbmNsYXNzIENhbGVuZGFyUGFnZSBleHRlbmRzIFNjaG9vbG9neVBhZ2VfMS5kZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgcGFnZVR5cGU6ICdjYWwnLFxuICAgICAgICAgICAgZ2V0QXNnbXRCeU5hbWVQYXRoRWw6ICdzcGFuLmZjLWV2ZW50LXRpdGxlPnNwYW4nLFxuICAgICAgICAgICAgaW5mb1RvQmxvY2tFbDogZWwgPT4gZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICBsaW1pdHM6IHtcbiAgICAgICAgICAgICAgICBjb3Vyc2VzOiAnJGFsbCcsXG4gICAgICAgICAgICAgICAgdGltZTogJ2FueSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkQ2hlY2ttYXJrcyh7XG4gICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuZmMtZXZlbnQ+ZGl2LmZjLWV2ZW50LWlubmVyJykucGFyZW50Tm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgICAgY3VzdG9tTWlkZGxlU2NyaXB0OiAoY2hlY2tFbCwgYXNnbXRFbCkgPT4ge1xuICAgICAgICAgICAgICAgIGpRdWVyeShjaGVja0VsKS5vbignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG86IGVsID0+IGVsXG4gICAgICAgIH0pO1xuICAgICAgICAvL1doZW4gY2hhbmdpbmcgbW9udGhzLCByZWxvYWQgcGFnZVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLmZjLWJ1dHRvbi1wcmV2JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWxvYWRUb0NvcnJlY3RNb250aFVSTCk7IC8vcHJldmlvdXMgbW9udGggYnV0dG9uXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4uZmMtYnV0dG9uLW5leHQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlbG9hZFRvQ29ycmVjdE1vbnRoVVJMKTsgLy9uZXh0IG1vbnRoIGJ1dHRvblxuICAgICAgICBmdW5jdGlvbiByZWxvYWRUb0NvcnJlY3RNb250aFVSTCgpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYy1oZWFkZXItdGl0bGUnKTsgLy8gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBsZXQgZWxUZXh0ID0gdGVtcEVsWydpbm5lclRleHQnXTtcbiAgICAgICAgICAgIGxldCBbbW9udGhOYW1lLCB5ZWFyXSA9IGVsVGV4dC5zcGxpdCgnICcpO1xuICAgICAgICAgICAgbGV0IG1vbnRoO1xuICAgICAgICAgICAgc3dpdGNoIChtb250aE5hbWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdKYW51YXJ5JzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDEnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdGZWJydWFyeSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzAyJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnTWFyY2gnOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwMyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0FwcmlsJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDQnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdNYXknOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0p1bmUnOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNic7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0p1bHknOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0F1Z3VzdCc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA4JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnU2VwdGVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDknO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdPY3RvYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMTAnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdOb3ZlbWJlcic6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzExJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnRGVjZW1iZXInOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGNvbnNvbGUuZXJyb3IoJ1Vua25vd24gbW9udGg/JywgbW9udGhOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRhdGVVUkwgPSBgJHt5ZWFyfS0ke21vbnRofWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh7IGRhdGVVUkwgfSk7XG4gICAgICAgICAgICBjb25zdCBvbGRQYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvKC4qXFwvKVxcZHs0fS1cXGR7Mn0vKVsxXTsgLy9yZW1vdmVzIGxhc3QgIyMjIy0jIyBwYXJ0IG9mIFVSTFxuICAgICAgICAgICAgY29uc3QgbmV3UGF0aG5hbWUgPSBgJHtvbGRQYXRobmFtZX0ke2RhdGVVUkx9YDtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9IG5ld1BhdGhuYW1lO1xuICAgICAgICB9XG4gICAgICAgIC8vUmV2aXZlcyB3aGVuIGNoZWNrbWFya3MgZGlzYXBwZWFyIGR1ZSB0byBhc2dtdHMgcmUtcmVuZGVyIChzdWNoIGFzIHdoZW4gd2luZG93IHJlc2l6ZWQgb3IgYWRkZWQgYSBwZXJzb25hbCBhc2dtdClcbiAgICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcual9jaGVja19jYWwnKSkgLy9jaGVja21hcmtzIGRvbid0IGV4aXN0IGFueW1vcmVcbiAgICAgICAgICAgICAgICBuZXcgQ2FsZW5kYXJQYWdlKCk7IC8vcmV2aXZlIGNoZWNrbWFya3NcbiAgICAgICAgICAgIC8vYWx0ZXJuYXRpdmU6IHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9LCAzMDApO1xuICAgIH1cbiAgICBjaGVja0FsbEFzZ210cygpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHNCeURhdGUgPSBqUXVlcnkoYHNwYW5bY2xhc3MqPSdkYXktJ11gKTtcbiAgICAgICAgZm9yIChsZXQgZWwgb2YgZWxlbWVudHNCeURhdGUpIHtcbiAgICAgICAgICAgIGxldCBhc2dtdEVsID0gZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICBpZiAoYXNnbXRFbCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgIGFzZ210RWwsXG4gICAgICAgICAgICAgICAgICAgIGZvcmNlZFN0YXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUluQ2hyb21lOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgLy9mb3JjZWRTdGF0ZSBpcyB0cnVlXG4gICAgICAgIH1cbiAgICB9XG4gICAgY2hlY2tBbGxBc2dtdHNCZWZvcmVUb2RheSgpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHNCeURhdGUgPSBqUXVlcnkoYHNwYW5bY2xhc3MqPSdkYXktJ11gKTtcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLmdldERhdGUoKTtcbiAgICAgICAgZm9yIChsZXQgZWwgb2YgZWxlbWVudHNCeURhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRheU9mRWwgPSBwYXJzZUludChlbC5jbGFzc05hbWUuc2xpY2UoLTIpKTtcbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZVRvZGF5ID0gZGF5T2ZFbCA8IHRvZGF5O1xuICAgICAgICAgICAgaWYgKGJlZm9yZVRvZGF5KSB7IC8vYmVmb3JlIHRvZGF5XG4gICAgICAgICAgICAgICAgY29uc3QgYXNnbXRFbCA9IGVsLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGlmIChhc2dtdEVsICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc2dtdEVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VkU3RhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBqX2NoZWNrKHsgYXNnbXRFbCwgZm9yY2VkU3RhdGUgPSBudWxsLCBvcHRpb25zOiB7IHN0b3JlSW5DaHJvbWUgPSB0cnVlLCBhbmltYXRlID0gZmFsc2UgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICB9IH0pIHtcbiAgICAgICAgLy9zdG9yZUluQ2hyb21lIGluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB0byBzZW5kIHJlcXVlc3QgdG8gc3RvcmUgaW4gY2hyb21lLiBpcyBmYWxzZSB3aGVuIGV4dGVuc2lvbiBpbml0aWFsaXppbmcgJiBjaGVja2luZyBvZmYgcHJpb3IgYXNnbXRzIGZyb20gc3RvcmFnZS4gaXMgdHJ1ZSBhbGwgb3RoZXIgdGltZXNcbiAgICAgICAgY29uc3QgcEhpZ2hsaWdodCA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignLmhpZ2hsaWdodC1ncmVlbicpOyAvL2Jhc2VkIG9uIGl0ZW0gaW5zaWRlIGFzZ210XG4gICAgICAgIGNvbnN0IGNoZWNrbWFya0VsID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dC5qX2NoZWNrXyR7dGhpcy5wYWdlVHlwZX1gKTtcbiAgICAgICAgY29uc3QgYXNnbXRUZXh0ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuZmMtZXZlbnQtaW5uZXI+LmZjLWV2ZW50LXRpdGxlPnNwYW4nKS5maXJzdENoaWxkLm5vZGVWYWx1ZTsgLy9vbmx5IHZhbHVlIG9mIGFzZ210IChmaXJzdENoaWxkKSwgbm90IGluY2x1ZGluZyBpbnNpZGUgZ3JhbmRjaGlsZHJlbiBsaWtlIGlubmVyVGV4dCgpXG4gICAgICAgIGNvbnN0IGNvdXJzZVRleHQgPSAoMCwgZnVuY3Rpb25zXzEucmVtb3ZlU3BhY2VzKShhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoYC5mYy1ldmVudC1pbm5lcj4uZmMtZXZlbnQtdGl0bGUgc3BhbltjbGFzcyo9J3JlYWxtLXRpdGxlJ11gKS5pbm5lclRleHQpOyAvKiBtb3N0IGNoaWxkIHNwYW4gY2FuIGhhdmUgY2xhc3Mgb2YgcmVhbG0tdGl0bGUtdXNlciBvciByZWFsbS10aXRsZS1jb3Vyc2UgYmFzZWQgb24gd2hldGhlciBvciBub3QgaXQgaXMgYSBwZXJzb25hbCBldmVudCAqL1xuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGZvcmNlZFN0YXRlICE9PSBudWxsICYmIGZvcmNlZFN0YXRlICE9PSB2b2lkIDAgPyBmb3JjZWRTdGF0ZSA6IHBIaWdobGlnaHQgPT0gbnVsbDsgLy9pZiB1c2VyIGZvcmNlZCBzdGF0ZSwgb3ZlcnJpZGUgbmV3SGlnaGxpZ2h0XG4gICAgICAgIGlmIChuZXdTdGF0ZSkgeyAvL25vIGhpZ2hsaWdodCBncmVlbiBhbHJlYWR5XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgJHthc2dtdFRleHR9YCk7XG4gICAgICAgICAgICAvL0NoZWNrXG4gICAgICAgICAgICBjaGVja21hcmtFbC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodEdyZWVuRWwgPSB0aGlzLmNyZWF0ZUdyZWVuSGlnaGxpZ2h0RWwoeyBwYWdlVHlwZTogdGhpcy5wYWdlVHlwZSwgYW5pbWF0ZSB9KTtcbiAgICAgICAgICAgIGFzZ210RWwuaW5zZXJ0QmVmb3JlKGhpZ2hsaWdodEdyZWVuRWwsIGFzZ210RWwuZmlyc3RDaGlsZCk7IC8vaW5zZXJ0IGFzIGZpcnN0IGVsZW1lbnQgKGJlZm9yZSBmaXJzdEVsZW1lbnQpXG4gICAgICAgICAgICBpZiAoc3RvcmVJbkNocm9tZSlcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEFzZ210KGNvdXJzZVRleHQsIGFzZ210VGV4dCwgeyBjcmVhdGVDb3Vyc2VJZk5vdEV4aXN0OiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFVuY2hlY2tpbmcgJHthc2dtdFRleHR9YCk7XG4gICAgICAgICAgICAvL1VuY2hlY2tcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGFzZ210RWwucmVtb3ZlQ2hpbGQocEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAvLyBjb3Vyc2VzR2xvYmFsLnBvcChjb3Vyc2VzR2xvYmFsLmluZGV4T2YoYXNnbXRUZXh0KSk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFzZ210KGNvdXJzZVRleHQsIGFzZ210VGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDYWxlbmRhclBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNjaG9vbG9neVBhZ2VfMSA9IHJlcXVpcmUoXCIuL1NjaG9vbG9neVBhZ2VcIik7XG5jb25zdCBmdW5jdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9mdW5jdGlvbnNcIik7XG5jbGFzcyBDb3Vyc2VQYWdlIGV4dGVuZHMgU2Nob29sb2d5UGFnZV8xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKGNvdXJzZUlkKSB7XG4gICAgICAgIGxldCBjb250YWluZXJQYXRoID0gYCNjb3Vyc2UtZXZlbnRzIC51cGNvbWluZy1saXN0IC51cGNvbWluZy1ldmVudHMgLnVwY29taW5nLWxpc3RgO1xuICAgICAgICBsZXQgY291cnNlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjZW50ZXItdG9wPi5wYWdlLXRpdGxlJykuaW5uZXJUZXh0OyAvL2dyYWJzIGNvdXJzZSB0aXRsZVxuICAgICAgICBjb3Vyc2VOYW1lID0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykoY291cnNlTmFtZSk7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHBhZ2VUeXBlOiAnY291cnNlJyxcbiAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiBgJHtjb250YWluZXJQYXRofT5kaXZbZGF0YS1zdGFydF1gLFxuICAgICAgICAgICAgaW5mb1RvQmxvY2tFbDogZWwgPT4gZWwsXG4gICAgICAgICAgICBsaW1pdHM6IHtcbiAgICAgICAgICAgICAgICBjb3Vyc2VzOiBjb3Vyc2VOYW1lLFxuICAgICAgICAgICAgICAgIHRpbWU6ICdhbnknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvdXJzZUlkID0gY291cnNlSWQ7XG4gICAgICAgIHRoaXMuY291cnNlTmFtZSA9IGNvdXJzZU5hbWU7XG4gICAgICAgIHRoaXMuYWRkQ2hlY2ttYXJrcyh7XG4gICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclBhdGgpLFxuICAgICAgICAgICAgY3VzdG9tTWlkZGxlU2NyaXB0OiAoY2hlY2tFbCwgYXNnbXRFbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhc2dtdEVsLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZS1oZWFkZXInKSkgLy9kb2VzIG5vdCBhZGQgY2hlY2sgdG8gLmRhdGUtaGVhZGVyIGJ5IGNvbnRpbnVlO2luZyBvdXQgb2YgbG9vcFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2NvbnRpbnVlJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG86IGVsID0+IGVsLmZpcnN0Q2hpbGRcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGpfY2hlY2soeyBhc2dtdEVsLCBmb3JjZWRTdGF0ZSA9IG51bGwsIG9wdGlvbnM6IHsgc3RvcmVJbkNocm9tZSA9IHRydWUsIGFuaW1hdGUgPSBmYWxzZSAvL3Nob3dzIGFuaW1hdGlvbiB3aGVuIGNoZWNraW5nXG4gICAgIH0gfSkge1xuICAgICAgICBjb25zdCBwSGlnaGxpZ2h0ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7IC8vYmFzZWQgb24gY2xhc3NMaXN0IG9mIGFzZ210RWxcbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBmb3JjZWRTdGF0ZSAhPT0gbnVsbCAmJiBmb3JjZWRTdGF0ZSAhPT0gdm9pZCAwID8gZm9yY2VkU3RhdGUgOiAhcEhpZ2hsaWdodDsgLy9vcHBvc2l0ZSB3aGVuIGNoZWNraW5nXG4gICAgICAgIGNvbnN0IGNoZWNrbWFya0VsID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dC5qX2NoZWNrXyR7dGhpcy5wYWdlVHlwZX1gKTtcbiAgICAgICAgY29uc3QgYXNnbXRUZXh0ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdhJykuaW5uZXJUZXh0O1xuICAgICAgICBjb25zb2xlLmxvZyh7IG5ld0hpZ2hsaWdodDogbmV3U3RhdGUsIHBIaWdobGlnaHQsIGNoZWNrbWFya0VsIH0pO1xuICAgICAgICBpZiAobmV3U3RhdGUpIHsgLy9ubyBoaWdobGlnaHQgZ3JlZW4gYWxyZWFkeSwgc28gY2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyAke2FzZ210VGV4dH1gKTtcbiAgICAgICAgICAgIC8vQ2hlY2tcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW5FbCA9IHRoaXMuY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlOiB0aGlzLnBhZ2VUeXBlLCBhbmltYXRlIH0pO1xuICAgICAgICAgICAgYXNnbXRFbC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7IC8vZm9yIGdyZWVuIHJlY3QgdG8gYmUgYm91bmQgdG8gYXNnbXRFbFxuICAgICAgICAgICAgYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoNCcpLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJzsgLy9zbyB0aGF0IHRleHQgYWJvdmUgY2hlY2ttYXJrXG4gICAgICAgICAgICBhc2dtdEVsLmluc2VydEJlZm9yZShoaWdobGlnaHRHcmVlbkVsLCBhc2dtdEVsLmZpcnN0Q2hpbGQpOyAvL2luc2VydCBhcyBmaXJzdCBlbGVtZW50IChiZWZvcmUgZmlyc3RDaGlsZClcbiAgICAgICAgICAgIGlmIChzdG9yZUluQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY291cnNlTmFtZSBpbiB0aGlzLmNvdXJzZXNHbG9iYWwpIHsgLy9hbHJlYWR5IGV4aXN0cywgc28gYXBwZW5kXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZU5hbWVdLnB1c2goYXNnbXRUZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7IC8vbm90IGV4aXN0LCBzbyBjcmVhdGUgY291cnNlIGxvZ1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VOYW1lXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VOYW1lXS5wdXNoKGFzZ210VGV4dCk7IC8vcHVzaCB0byBuZXdseSBjcmVhdGVkIGNsYXNzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ291cnNlcyh0aGlzLmNvdXJzZXNHbG9iYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvL3VuY2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmNoZWNraW5nICR7YXNnbXRUZXh0fWApO1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgdG9SZW1vdmUgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTtcbiAgICAgICAgICAgIHRvUmVtb3ZlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodG9SZW1vdmUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VOYW1lXS5wb3AoLy9yZW1vdmUgY2hlY2tlZFRhc2tHbG9iYWwgZnJvbSBsaXN0XG4gICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW3RoaXMuY291cnNlTmFtZV0uaW5kZXhPZihhc2dtdFRleHQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNvdXJzZXModGhpcy5jb3Vyc2VzR2xvYmFsKTsgLy91cGRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZU5hbWVdLnBvcCh0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VOYW1lXS5pbmRleE9mKGFzZ210VGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNvdXJzZXModGhpcy5jb3Vyc2VzR2xvYmFsKTtcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENvdXJzZVBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNjaG9vbG9neVBhZ2VfMSA9IHJlcXVpcmUoXCIuL1NjaG9vbG9neVBhZ2VcIik7XG5jb25zdCBjb2xsYXBzZU92ZXJkdWVfMSA9IHJlcXVpcmUoXCIuL2NvbGxhcHNlT3ZlcmR1ZVwiKTtcbmNvbnN0IGZ1bmN0aW9uc18xID0gcmVxdWlyZShcIi4uL2Z1bmN0aW9uc1wiKTtcbmNsYXNzIEhvbWVQYWdlIGV4dGVuZHMgU2Nob29sb2d5UGFnZV8xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKHsgY29udGFpbmVyU2VsZWN0b3JzIH0pIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgcGFnZVR5cGU6ICdob21lJyxcbiAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiBjb250YWluZXJTZWxlY3RvcnMubWFwKHMgPT4gYCR7c30+ZGl2YCksXG4gICAgICAgICAgICBpbmZvVG9CbG9ja0VsOiBlbCA9PiBlbCxcbiAgICAgICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgICAgIGNvdXJzZXM6ICckYWxsJyxcbiAgICAgICAgICAgICAgICB0aW1lOiAnYW55J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG11bHRpcGxlQXNnbXRDb250YWluZXJzOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAoMCwgY29sbGFwc2VPdmVyZHVlXzEuZGVmYXVsdCkoKTtcbiAgICAgICAgZm9yIChsZXQgY29udGFpbmVyU2VsZWN0b3Igb2YgY29udGFpbmVyU2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgaDQ+c3BhbmA7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyQ2xhc3MgPSAnal9jaGVja19jb250YWluZXInO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGVja21hcmtzKHtcbiAgICAgICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKSxcbiAgICAgICAgICAgICAgICBjdXN0b21NaWRkbGVTY3JpcHQ6IChjaGVja0VsLCBhc2dtdEVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhc2dtdEVsLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZS1oZWFkZXInKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnY29udGludWUnO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIHsgLy92YWxpZCBhc3NpZ25tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGpDaGVja0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpDaGVja0NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGNvbnRhaW5lckNsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnROb2RlID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpDaGVja0NvbnRhaW5lciwgcGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdzcGFuLnVwY29taW5nLXRpbWUnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxvY2F0ZUVsVG9BcHBlbmRDaGVja21hcmtUbzogZWwgPT4gZWwucXVlcnlTZWxlY3RvcihgJHtzZWxlY3Rvcn0gc3Bhbi4ke2NvbnRhaW5lckNsYXNzfWApLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgal9jaGVjayh7IGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgb3B0aW9uczogeyBzdG9yZUluQ2hyb21lID0gdHJ1ZSwgYW5pbWF0ZSA9IGZhbHNlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgfSB9KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYXNnbXRFbCB9KTtcbiAgICAgICAgY29uc3QgcEhpZ2hsaWdodCA9ICEhYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7IC8vYmFzZWQgb24gY2xhc3NMaXN0IG9mIGFzZ210RWxcbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBmb3JjZWRTdGF0ZSAhPT0gbnVsbCAmJiBmb3JjZWRTdGF0ZSAhPT0gdm9pZCAwID8gZm9yY2VkU3RhdGUgOiAhcEhpZ2hsaWdodDsgLy9vcHBvc2l0ZSB3aGVuIGNoZWNraW5nXG4gICAgICAgIGNvbnN0IGNoZWNrbWFya0VsID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dC5qX2NoZWNrXyR7dGhpcy5wYWdlVHlwZX1gKTtcbiAgICAgICAgY29uc3QgdGVtcEFuY2hvciA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICBjb25zdCBhc2dtdFRleHQgPSB0ZW1wQW5jaG9yLmlubmVyVGV4dDtcbiAgICAgICAgY29uc3QgY291cnNlVGV4dCA9ICgwLCBmdW5jdGlvbnNfMS5yZW1vdmVTcGFjZXMpKGFzZ210RWwucXVlcnlTZWxlY3RvcignaDQ+c3BhbicpLmFyaWFMYWJlbCk7IC8vbmFtZSBvZiBjb3Vyc2UgYmFzZWQgb24gYXJpYS1sYWJlbCBvZiBhc2dtdEVsJ3MgPGg0PidzIDxzcGFuPidzIDxkaXY+XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHtjb3Vyc2VUZXh0LCBhc2dtdEVsfSk7XG4gICAgICAgIGlmIChuZXdTdGF0ZSkgeyAvL2NoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgJyR7YXNnbXRUZXh0fSdgKTtcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW5FbCA9IHRoaXMuY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlOiB0aGlzLnBhZ2VUeXBlLCBhbmltYXRlIH0pO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoNCcpO1xuICAgICAgICAgICAgYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoND5zcGFuJykuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnOyAvL3NvIHRoYXQgdGV4dCBhYm92ZSBjaGVja21hcmtcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaGlnaGxpZ2h0R3JlZW5FbCwgcGFyZW50LmZpcnN0Q2hpbGQpOyAvL2luc2VydCBhcyBmaXJzdCBlbGVtZW50IChiZWZvcmUgZmlyc3RFbGVtZW50KVxuICAgICAgICAgICAgaWYgKHN0b3JlSW5DaHJvbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoY291cnNlVGV4dCBpbiB0aGlzLmNvdXJzZXNHbG9iYWwpIHsgLy9hbHJlYWR5IGV4aXN0cywgc28gYXBwZW5kXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFtjb3Vyc2VUZXh0XS5jaGVja2VkLnB1c2goYXNnbXRUZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7IC8vbm90IGV4aXN0LCBzbyBjcmVhdGUgY291cnNlIGxvZ1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbY291cnNlVGV4dF0uY2hlY2tlZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbY291cnNlVGV4dF0uY2hlY2tlZC5wdXNoKGFzZ210VGV4dCk7IC8vcHVzaCB0byBuZXdseSBjcmVhdGVkIGNsYXNzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ291cnNlcyh0aGlzLmNvdXJzZXNHbG9iYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvL3VuY2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmNoZWNraW5nICcke2FzZ210VGV4dH0nYCk7XG4gICAgICAgICAgICBjaGVja21hcmtFbC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCB0b1JlbW92ZSA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignLmhpZ2hsaWdodC1ncmVlbicpO1xuICAgICAgICAgICAgdG9SZW1vdmUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0b1JlbW92ZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbFtjb3Vyc2VUZXh0XS5jaGVja2VkLnBvcCgvL3JlbW92ZSBjaGVja2VkVGFza0dsb2JhbCBmcm9tIGxpc3RcbiAgICAgICAgICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWxbY291cnNlVGV4dF0uY2hlY2tlZC5pbmRleE9mKGFzZ210VGV4dCkpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ291cnNlcyh0aGlzLmNvdXJzZXNHbG9iYWwpOyAvL3VwZGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsW2NvdXJzZVRleHRdLmNoZWNrZWQucG9wKHRoaXMuY291cnNlc0dsb2JhbFtjb3Vyc2VUZXh0XS5jaGVja2VkLmluZGV4T2YoYXNnbXRUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ291cnNlcyh0aGlzLmNvdXJzZXNHbG9iYWwpO1xuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gSG9tZVBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwianF1ZXJ5XCIvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJjaHJvbWVcIi8+XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBTY2hvb2xvZ3lQYWdlIHtcbiAgICBjb25zdHJ1Y3Rvcih7IHBhZ2VUeXBlLCBnZXRBc2dtdEJ5TmFtZVBhdGhFbCwgaW5mb1RvQmxvY2tFbCwgbGltaXRzLCBpZ25vcmVPbGRBc2dtdHMgPSB0cnVlLCBtdWx0aXBsZUFzZ210Q29udGFpbmVycyA9IGZhbHNlIH0pIHtcbiAgICAgICAgY29uc29sZS5sb2coeyBwYWdlVHlwZSwgZ2V0QXNnbXRCeU5hbWVQYXRoRWwsIGluZm9Ub0Jsb2NrRWwsIGxpbWl0cywgaWdub3JlT2xkQXNnbXRzLCBtdWx0aXBsZUFzZ210Q29udGFpbmVycyB9KTtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NldHRpbmdzJywgKHsgc2V0dGluZ3MgfSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNob3dDaGVja21hcmtzID09PSAnb25Ib3ZlcicpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnT25seSBzaG93IGNoZWNrbWFyayBvbiBob3ZlcicpO1xuICAgICAgICAgICAgICAgIC8vTG9hZCBzdHlsZSBpZiBvbmx5U2hvd0NoZWNrbWFya09uSG92ZXJcbiAgICAgICAgICAgICAgICBsZXQgc3R5bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgc3R5bGVFbC5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICAgICAgICAgIC5qX2NoZWNrX2NhbCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiBoaWRkZW47IC8qIGFsbCBpbnB1dCBjaGVja3MgaGlkZGVuICovXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLmZjLWV2ZW50OmhvdmVyIC5qX2NoZWNrX2NhbCB7IC8qIGlucHV0IGNoZWNrIHNob3duIG9uaG92ZXIgb2YgYXNnbXQgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhZ2VUeXBlID0gcGFnZVR5cGU7IC8vaW5kaWNhdGVzIGNzcyBjbGFzcyBmb3IgY2hlY2tib3hcbiAgICAgICAgdGhpcy5tdWx0aXBsZUFzZ210Q29udGFpbmVycyA9IG11bHRpcGxlQXNnbXRDb250YWluZXJzO1xuICAgICAgICB0aGlzLmdldEFzZ210QnlOYW1lUGF0aEVsID0gZ2V0QXNnbXRCeU5hbWVQYXRoRWw7IC8vZnJvbSB3aGVyZSB0byBzZWFyY2ggOmNvbnRhaW5zKCkgb2YgYW4gYXNnbXQgYnkgbmFtZVxuICAgICAgICB0aGlzLmluZm9Ub0Jsb2NrRWwgPSBpbmZvVG9CbG9ja0VsO1xuICAgICAgICB0aGlzLmlnbm9yZU9sZEFzZ210cyA9IGlnbm9yZU9sZEFzZ210cztcbiAgICAgICAgLyp7XG4gICAgICAgICAgICBjb3Vyc2VzLCAvLyckYWxsJyB8IFN0cmluZyBvZiBjb3Vyc2UgbmFtZVxuICAgICAgICAgICAgdGltZSAvLydhbnknIHwgJ2Z1dHVyZSdcbiAgICAgICAgfSovXG4gICAgICAgIC8vbGlzdGVucyBmb3IgYHJ1biAkY21kYCBtZXNzYWdlIGZyb20gcG9wdXAuanNcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtc2csIHNlbmRlciwgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChtc2cuaGFzT3duUHJvcGVydHkoJ3J1bicpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChtc2cucnVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbG9hZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGVjayBhbGwgYXNnbXRzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tBbGxBc2dtdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGVjayBhbGwgYXNnbXRzIGJlZm9yZSB0b2RheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQWxsQXNnbXRzQmVmb3JlVG9kYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5rbm93biBydW4gbWVzc2FnZTonLCBtc2cucnVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vU2V0cyB0aGlzLmNvdXJzZXNHbG9iYWwgdG8gY2hyb21lIHN0b3JhZ2VcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ2NvdXJzZXMnLCAoeyBjb3Vyc2VzIH0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbCA9IGNvdXJzZXM7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY291cnNlcycsIGNvdXJzZXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobGltaXRzKTsgLy90aW1lICYgY291cnNlIGxpbWl0cyB3aGVuIGdldHRpbmcgYXNnbXRzXG4gICAgICAgICAgICBpZiAobGltaXRzLmNvdXJzZXMgPT09ICckYWxsJyAmJiBsaW1pdHMudGltZSA9PT0gJ2FueScpIHsgLy9jYWxlbmRhciBvciBob21lIHBhZ2VcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjb3Vyc2Ugb2YgY291cnNlcykgeyAvL1RPRE86IGNoYW5nZSBzY2hlbWFcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrZWQgPSBjb3Vyc2UuY2hlY2tlZDsgLy9hc2dtdHNcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYXNnbXRFbCBvZiBjaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luZm9FbCwgYmxvY2tFbF0gPSB0aGlzLmdldEFzZ210QnlOYW1lKGFzZ210RWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9FbCAhPT0gJ05vIG1hdGNoZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzZ210RWw6IGJsb2NrRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsaW1pdHMuY291cnNlcyA9PT0gJyRhbGwnICYmIHRoaXMudGltZSA9PT0gJ2Z1dHVyZScpIHsgLy9ub3QgYmVpbmcgdXNlZCwgcG90ZW50aWFsIGlmIG5vdCBwcmV2IGFzZ210c1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGltaXRzLmNvdXJzZXMgIT09ICckYWxsJyAmJiB0aGlzLnRpbWUgPT09ICdhbnknKSB7IC8vY291cnNlIHBhZ2UgKGFsbCBhc2dtdHMgb2YgY291cnNlKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbmx5IGNoZWNraW5nIHRoZSBjb3Vyc2U6ICR7dGhpcy5jb3Vyc2VzfWApO1xuICAgICAgICAgICAgICAgIGlmIChjb3Vyc2VzIGluIHRoaXMuY291cnNlc0dsb2JhbCkgeyAvL2lmIGNoZWNrZWQgYXNnbXRzIG9mIHRoYXQgY291cnNlXG4gICAgICAgICAgICAgICAgICAgIGxldCBhc2dtdHMgPSB0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VzXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0FzZ210cycsIGFzZ210cyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGFzZ210RWwgb2YgYXNnbXRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luZm9FbCwgYmxvY2tFbF0gPSB0aGlzLmdldEFzZ210QnlOYW1lKGFzZ210RWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9FbCAhPT0gJ05vIG1hdGNoZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzZ210RWw6IGJsb2NrRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNoZWNrQWxsQXNnbXRzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgY2hlY2tBbGxBc2dtdHNCZWZvcmVUb2RheSgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIC8vKiA8bWV0aG9kcyB0byBpbnRlcmFjdCB3aXRoIHRoaXMuY291cnNlR2xvYmFsXG4gICAgZ2V0Q291cnNlKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY291cnNlc0dsb2JhbC5maW5kKGNvdXJzZSA9PiBjb3Vyc2UubmFtZSA9PT0gbmFtZSk7XG4gICAgfVxuICAgIGNyZWF0ZUNvdXJzZShjb3Vyc2UsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogY291cnNlLFxuICAgICAgICAgICAgbm9TcGFjZXNOYW1lOiAnJEZpbGxlcicsXG4gICAgICAgICAgICBjaGVja2VkOiBbXVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFvcHRpb25zLmRvbnRTYXZlKSAvL3NhdmUgdW5sZXNzIHNwZWNpZmllZCB0byBub3Qgc2F2ZVxuICAgICAgICAgICAgdGhpcy51cGRhdGVDb3Vyc2VzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjb3Vyc2UgbmFtZVxuICAgICAqIEByZXR1cm5zIGNvdXJzZSBuYW1lXG4gICAgKi9cbiAgICBkZWxldGVDb3Vyc2UobmFtZSkge1xuICAgICAgICBkZWxldGUgdGhpcy5jb3Vyc2VzR2xvYmFsW3RoaXMuY291cnNlc0dsb2JhbC5maW5kSW5kZXgoY291cnNlID0+IGNvdXJzZS5uYW1lID09PSBuYW1lKSAvL2dldCBpbmRleFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLnVwZGF0ZUNvdXJzZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGNvdXJzZSBjb3Vyc2UgbmFtZVxuICAgICAqIEBwYXJhbSBhc2dtdCBhc3NpZ25tZW50IG5hbWVcbiAgICAgKi9cbiAgICBhZGRBc2dtdChjb3Vyc2UsIGFzZ210LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNyZWF0ZUNvdXJzZUlmTm90RXhpc3QgJiYgdGhpcy5nZXRDb3Vyc2UoY291cnNlKSA9PT0gdW5kZWZpbmVkKSAvL2NyZWF0ZSBjb3Vyc2UgaWYgbm90IGV4aXN0c1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb3Vyc2UoY291cnNlLCB7IGRvbnRTYXZlOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmdldENvdXJzZShjb3Vyc2UpLmNoZWNrZWQucHVzaChhc2dtdCk7XG4gICAgICAgIHRoaXMudXBkYXRlQ291cnNlcygpO1xuICAgIH1cbiAgICByZW1vdmVBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdCkge1xuICAgICAgICB0aGlzLmdldENvdXJzZShjb3Vyc2VOYW1lKS5jaGVja2VkID0gdGhpcy5nZXRDb3Vyc2UoY291cnNlTmFtZSkuY2hlY2tlZC5maWx0ZXIoaXRlbSA9PiAoaXRlbSAhPT0gYXNnbXQpKTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3Vyc2VzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXNnbXQ7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGNocm9tZSdzIHN0b3JhZ2Ugd2l0aCBjaGVja2VkIHRhc2tzIHBhcmFtZXRlclxuICAgICAqIEByZXR1cm5zIFByb21pc2UgYm9vbGVhbiBzdWNjZWVkZWQ/XG4gICAgICogKi9cbiAgICB1cGRhdGVDb3Vyc2VzKG5ld0NvdXJzZXMpIHtcbiAgICAgICAgbmV3Q291cnNlcyA9IG5ld0NvdXJzZXMgIT09IG51bGwgJiYgbmV3Q291cnNlcyAhPT0gdm9pZCAwID8gbmV3Q291cnNlcyA6IHRoaXMuY291cnNlc0dsb2JhbDsgLy9kZWZhdWx0IGlzIHRoaXMuY291cnNlc0dsb2JhbFxuICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5zdHJpbmdpZnkoeyBjb3Vyc2VzOiBuZXdDb3Vyc2VzIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHJ1bjogJ3VwZGF0ZSBjaHJvbWUgc3RvcmFnZScsXG4gICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgfSwgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTsgLy9zdWNjZWVkZWQgb3Igbm90XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vKiA+XG4gICAgYWRkQ2hlY2ttYXJrcyh7IC8vY2FsbGVkIGluIHN1YmNsYXNzJyBjb25zdHJ1Y3RvciwgYWRkcyBjaGVja21hcmtzIHRvIGVhY2ggYXNnbXQgZm9yIGNsaWNraW5nOyBjaGVja3MgdGhvc2UgY2hlY2ttYXJrcyBiYXNlZCBvbiBjaHJvbWUgc3RvcmFnZVxuICAgIGFzZ210RWxDb250YWluZXIsIC8vd2hlcmUgdGhlIGFzZ210cyBhcmUgbG9jYXRlZFxuICAgIGN1c3RvbU1pZGRsZVNjcmlwdCwgLy9hbm9ueW1vdXMgZnVuYyBleGVjdXRlZCBpbiB0aGUgbWlkZGxlXG4gICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvIC8vZGV0ZXJtaW5lcyBob3cgdG8gYWRkIGNoaWxkcmVuIGVscyBpZSBlbD0+ZWwucGFyZW50Tm9kZVxuICAgICB9KSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGFzZ210RWxDb250YWluZXIuY2hpbGRyZW47XG4gICAgICAgIGZvciAobGV0IGFzZ210RWwgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGxldCBjaGVja0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGNoZWNrRWwuY2xhc3NOYW1lID0gYGpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWA7XG4gICAgICAgICAgICBjaGVja0VsLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICAgICAgY2hlY2tFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9hbmltYXRlIGJlY2F1c2UgdXNlciBjbGlja2luZ1xuICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgIGFzZ210RWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlOiB0cnVlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgdG9SdW4gPSBjdXN0b21NaWRkbGVTY3JpcHQoY2hlY2tFbCwgYXNnbXRFbCk7IC8vcmV0dXJucyBzdHJpbmcgdG8gZXZhbHVhdGUgKHJhcmVseSB1c2VkKVxuICAgICAgICAgICAgaWYgKHRvUnVuID09PSAnY29udGludWUnKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvKGFzZ210RWwpLmFwcGVuZENoaWxkKGNoZWNrRWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldEFzZ210QnlOYW1lKGFzZ210TmFtZSkge1xuICAgICAgICBsZXQgcXVlcnksIHF1ZXJ5UmVzO1xuICAgICAgICBjb25zb2xlLmxvZyhhc2dtdE5hbWUsIHRoaXMubXVsdGlwbGVBc2dtdENvbnRhaW5lcnMpO1xuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZUFzZ210Q29udGFpbmVycykgeyAvL211bHRpcGxlIGFzZ210IGNvbnRhaW5lcnMgdG8gY2hlY2tcbiAgICAgICAgICAgIGZvciAobGV0IGdldEFzZ210QnlOYW1lUGF0aEVsIG9mIHRoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWwpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IGAke2dldEFzZ210QnlOYW1lUGF0aEVsfTpjb250YWlucygnJHthc2dtdE5hbWUucmVwbGFjZUFsbChgJ2AsIGBcXFxcJ2ApIC8qIGVzY2FwZSBxdW90ZSBtYXJrcyAqL30nKWA7XG4gICAgICAgICAgICAgICAgcXVlcnlSZXMgPSBqUXVlcnkocXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChxdWVyeVJlcy5sZW5ndGggPiAwKSAvL2tlZXBzIGdvaW5nIHRocnUgYXNnbXRDb250YWluZXJzIHVudGlsIHF1ZXJ5UmVzIGlzIGFuIGFzZ210XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBxdWVyeSA9IGAke3RoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWx9OmNvbnRhaW5zKCcke2FzZ210TmFtZS5yZXBsYWNlQWxsKGAnYCwgYFxcXFwnYCkgLyogZXNjYXBlIHF1b3RlIG1hcmtzICovfScpYDtcbiAgICAgICAgICAgIHF1ZXJ5UmVzID0galF1ZXJ5KHF1ZXJ5KTsgLy9oYXMgaW5mbyAoY291cnNlICYgZXZlbnQpLCBpZGVudGlmaWVyXG4gICAgICAgICAgICAvL2pRdWVyeSdzIDpjb250YWlucygpIHdpbGwgbWF0Y2ggZWxlbWVudHMgd2hlcmUgYXNnbXROYW1lIGlzIGEgc3Vic3RyaW5nIG9mIHRoZSBhc2dtdC4gZWxzZSBpZiBiZWxvdyBoYW5kbGVzIG92ZXJsYXBzXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZm9FbDtcbiAgICAgICAgaWYgKHF1ZXJ5UmVzLmxlbmd0aCA9PT0gMSkgLy9vbmx5IG9uZSBtYXRjaGluZyBlbGVtZW50cyDwn5GNXG4gICAgICAgICAgICBpbmZvRWwgPSBxdWVyeVJlc1swXTtcbiAgICAgICAgZWxzZSBpZiAocXVlcnlSZXMubGVuZ3RoID49IDIpIHsgLy8yKyBjb25mbGljdGluZyBtYXRjaGVzIPCfpI8gc28gc28gIChuZWVkcyBwcm9jZXNzaW5nIHRvIGZpbmQgcmlnaHQgZWxlbWVudClcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlSZXMubGVuZ3RoOyBpKyspIHsgLy90ZXN0IGZvciBldmVyeSBlbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5UmVzW2ldLmZpcnN0Q2hpbGQubm9kZVZhbHVlID09PSBhc2dtdE5hbWUpIHsgLy9pZiBlbGVtZW50J3MgYXNnbXQgdGl0bGUgbWF0Y2hlcyBhc2dtdE5hbWUsIHRoYXQgaXMgdGhlIHJpZ2h0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgaW5mb0VsID0gcXVlcnlSZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy9yZXR1cm5zIGlmIG5vIG1hdGNoZXMg8J+RjlxuICAgICAgICAgICAgaWYgKCF0aGlzLmlnbm9yZU9sZEFzZ210cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE5vIGVsZW1lbnRzIG1hdGNoZWQgJHthc2dtdE5hbWV9YCwge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiB0aGlzLmdldEFzZ210QnlOYW1lUGF0aEVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVJlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9FbFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgJ1RoaXMgZXJyb3IgbWF5IGJlIGNhdXNlZCBieSBvbGQgYXNnbXRzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gWydObyBtYXRjaGVzJywgJ05vIG1hdGNoZXMnXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYmxvY2tFbCA9IHRoaXMuaW5mb1RvQmxvY2tFbChpbmZvRWwpOyAvL2Jsb2NrIChoYXMgc3R5bGVzKVxuICAgICAgICByZXR1cm4gW2luZm9FbCwgYmxvY2tFbF07XG4gICAgfVxuICAgIGpfY2hlY2soeyAvL3BvbHltb3JwaGlzbSBhbGxvd3MgdGhpcyBmdW5jdGlvbiB0byBiZSBzcGVjaWFsaXplZCBhbW9uZyBlYWNoIFNjaG9vbG9neVBhZ2Ugc3ViY2xhc3MuIEhvd2V2ZXIsIGl0IGlzIGNhbGxlZCBmcm9tIHRoaXMgU2Nob29sb2d5UGFnZVxuICAgIC8vIEJlbG93IGFyZSB0aGUgY29udmVudGlvbmFsIGlucHV0c1xuICAgIGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgLy9pZiBudWxsLCBqX2NoZWNrIHRvZ2dsZXMuIGlmIHRydWUvZmFsc2UsIGl0IGZvcmNlcyBpbnRvIHRoYXQgc3RhdGVcbiAgICBvcHRpb25zOiB7IHN0b3JlSW5DaHJvbWUgPSB0cnVlLCBhbmltYXRlID0gZmFsc2UgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICB9IH0pIHsgfVxuICAgIC8vY3JlYXRlcyBoaWdobGlnaHRHcmVlbkVsIHdpdGggYW5pbWF0ZS9ubyBhbmltYXRlXG4gICAgY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlLCBhbmltYXRlID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodEdyZWVuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGhpZ2hsaWdodEdyZWVuLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodC1ncmVlbicpO1xuICAgICAgICBoaWdobGlnaHRHcmVlbi5jbGFzc0xpc3QuYWRkKGBoaWdobGlnaHQtZ3JlZW4tJHtwYWdlVHlwZX1gKTtcbiAgICAgICAgaGlnaGxpZ2h0R3JlZW4uaW5uZXJIVE1MID0gLyogaGlnaGxpZ2h0IGFuaW1hZ2VkIHN2ZyAqLyBgXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgdmVyc2lvbj0nMS4xJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSdub25lJyB2aWV3Qm94PScwIDAgMTAgMTAnXG4gICAgICAgICAgICAgICAgc3R5bGU9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7IHRyYW5zZm9ybTogc2NhbGVYKC0xKSc+XG4gICAgICAgICAgICAgICAgPCEtLSBEYXJrIEdyZWVuIEJhY2tncm91bmQgLS0+XG4gICAgICAgICAgICAgICAgPHBhdGggZmlsbD0ncmdiKDExNSwgMjUyLCAxMjcpJyBkPSdNIDEwIDAgTCAxMCAxMCBMIDAgMTAgTCAwIDAgWicgLz5cbiAgICAgICAgICAgICAgICA8IS0tIFNsYXNoIEJldHdlZW4gQ2VudGVyIC0tPlxuICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0nZ3JlZW4nIGQ9J00gMCAwIEwgMTAgMTAgWic+XG4gICAgICAgICAgICAgICAgJHsgLy9pZiBhbmltYXRlLCBhZGQgYW4gYW5pbWF0aW9uIHRhZyBpbnNpZGUgPHBhdGg+XG4gICAgICAgIGFuaW1hdGVcbiAgICAgICAgICAgID9cbiAgICAgICAgICAgICAgICBgPCEtLSBBbmltYXRpb24gbm90ZXM6IGF0IHN0YXJ0LCBubyBtb3ZlbWVudC4gZ3JhZHVhbGx5IGdldHMgZmFzdGVyIGFuZCBmYXN0ZXIgLS0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVOYW1lPSdkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyPScwLjJzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0Q291bnQ9JzEnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjcgMC43IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEwgMC44IDAuOCBMIDEuNiAxLjYgTCAyLjUgMi41IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEwgNy4yOSA3LjI5IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEwgNy4yOSA3LjI5IEwgOC4zOSA4LjM5IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEwgNy4yOSA3LjI5IEwgOC4zOSA4LjM5IEwgMTAgMTAgTCdcbiAgICAgICAgICAgICAgICAgICAgLz5gIDogJyd9XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0nZ3JlZW4nIGQ9J00gMCAwIEwgMTAgMTAgWic+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBgO1xuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0R3JlZW47XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2Nob29sb2d5UGFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gY29sbGFwc2VPdmVyZHVlKCkge1xuICAgIGNvbnN0IG92ZXJkdWVXcmFwcGVyUGF0aCA9IGBkaXYub3ZlcmR1ZS1zdWJtaXNzaW9ucy13cmFwcGVyYDtcbiAgICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IHJlYWR5ID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYub3ZlcmR1ZS1zdWJtaXNzaW9ucy13cmFwcGVyPmRpdi51cGNvbWluZy1saXN0Jyk7XG4gICAgICAgIGlmIChyZWFkeSkge1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NldHRpbmdzJywgKHsgc2V0dGluZ3MgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNldHRpbmdzLm92ZXJkdWVDb2xsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gc2V0KG5ld1ZhbCkge1xuICAgICAgICAgICAgbGV0IG9sZFNldHRpbmdzID0gYXdhaXQgZ2V0KCk7XG4gICAgICAgICAgICBsZXQgbmV3U2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBvbGRTZXR0aW5ncyk7XG4gICAgICAgICAgICBuZXdTZXR0aW5ncy5vdmVyZHVlQ29sbGFwc2VkID0gbmV3VmFsO1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe1xuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBuZXdTZXR0aW5nc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluaXRpYWxWYWwgPSBhd2FpdCBnZXQoKTtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvdmVyZHVlV3JhcHBlclBhdGggKyAnPmgzJyk7XG4gICAgICAgIGNvbnN0IGNvbGxhcHNlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbGxhcHNlQnRuLnN0eWxlLm1hcmdpbkxlZnQgPSAnNHJlbSc7IC8vZGlzdGFuY2UgYmV0d2VlbiB0ZXh0XG4gICAgICAgIGNvbGxhcHNlQnRuLmlubmVyVGV4dCA9ICdIaWRlIE92ZXJkdWUgQXNzaWdubWVudHMnO1xuICAgICAgICBjb2xsYXBzZUJ0bi5jbGFzc0xpc3QuYWRkKCdqX2J1dHRvbicpO1xuICAgICAgICBjb2xsYXBzZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbCA9ICEoYXdhaXQgZ2V0KCkpOyAvL29wcG9zaXRlIG9mIG9sZFZhbFxuICAgICAgICAgICAgcmVyZW5kZXJDb2xsYXBzZUJ0bihuZXdWYWwpO1xuICAgICAgICAgICAgc2V0KG5ld1ZhbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29sbGFwc2VCdG4pO1xuICAgICAgICByZXJlbmRlckNvbGxhcHNlQnRuKGluaXRpYWxWYWwpOyAvL2luaXRpYWwgY2FsbFxuICAgICAgICBmdW5jdGlvbiByZXJlbmRlckNvbGxhcHNlQnRuKG5ld1ZhbCkge1xuICAgICAgICAgICAgY29uc3QgYXNnbXRzRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG92ZXJkdWVXcmFwcGVyUGF0aCArICc+ZGl2LnVwY29taW5nLWxpc3QnKTtcbiAgICAgICAgICAgIGFzZ210c0VsLmNsYXNzTGlzdC50b2dnbGUoJ2pfY29sbGFwc2VkJywgbmV3VmFsKTsgLy9jbGFzcyBpZiBuZXdWYWxcbiAgICAgICAgICAgIGNvbGxhcHNlQnRuLmlubmVyVGV4dCA9IG5ld1ZhbCA/ICdTaG93IE92ZXJkdWUgQXNzaWdubWVudHMnIDogJ0hpZGUgT3ZlcmR1ZSBBc3NpZ25tZW50cyc7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBjb2xsYXBzZU92ZXJkdWU7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBDYWxlbmRhclBhZ2VfMSA9IHJlcXVpcmUoXCIuL3BhZ2VzL0NhbGVuZGFyUGFnZVwiKTtcbmNvbnN0IEhvbWVQYWdlXzEgPSByZXF1aXJlKFwiLi9wYWdlcy9Ib21lUGFnZVwiKTtcbmNvbnN0IENvdXJzZVBhZ2VfMSA9IHJlcXVpcmUoXCIuL3BhZ2VzL0NvdXJzZVBhZ2VcIik7XG4vL1RoaXMgc2NyaXB0IGlzIGluamVjdGVkIGludG8gZXZlcnkgcGFnZS5cbi8vRnVuY3Rpb25zIGFyZSBpbiBzZXF1ZW50aWFsIG9yZGVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGRldGVybWluZVNjaG9vbG9neVBhZ2VUeXBlLCBmYWxzZSk7IC8vd2FpdCBmb3IgRE9NIGVsZW1lbnRzIHRvIGxvYWRcbmZ1bmN0aW9uIGV4ZWN1dGVBZnRlckRvbmVMb2FkaW5nKGNhbGxiYWNrLCAvL2V4ZWN1dGVkIGFmdGVyXG5pc0xvYWRpbmcgPSAoKSA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudXBjb21pbmctbGlzdD4ucmVmcmVzaC13cmFwcGVyIGltZ1thbHQ9XCJMb2FkaW5nXCJdJykgIT0gbnVsbCAvL2RlZmF1bHQgaXMgaWYgdGhlcmUgaXMgbm8gbG9hZGluZyBzeW1ib2wgb24gdGhlIHBhZ2Vcbikge1xuICAgIGxldCBpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoaXNMb2FkaW5nKCkpIHtcbiAgICAgICAgICAgIC8vIENvbnRpbnVlIHdhaXRpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nLi4uJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpOyAvL3N0b3AgaW50ZXJ2YWxcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDApO1xufVxuZnVuY3Rpb24gZGV0ZXJtaW5lU2Nob29sb2d5UGFnZVR5cGUoKSB7XG4gICAgalF1ZXJ5Lm5vQ29uZmxpY3QoKTsgLy9zY2hvb2xvZ3kgYWxzbyBoYXMgaXRzIG93biBqUXVlcnksIHNvIHVzZSBgalF1ZXJ5YCBpbnN0ZWFkIG9mIGAkYCB0byBhdm9pZCBjb25mbGljdFxuICAgIC8vIGNvbnNvbGUubG9nKCcxLiBFeHRlbnNpb24gcnVubmluZycpO1xuICAgIC8vQ2FsZW5kYXJcbiAgICBjb25zdCBoYXNTY2hvb2xvZ3lTY3JpcHRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgc2NyaXB0W3NyYyo9J3NjaG9vbG9neS5jb20nXWApOyAvL3NjaG9vbG9neSBwYWdlXG4gICAgaWYgKGhhc1NjaG9vbG9neVNjcmlwdHMpIHsgLy9zY2hvb2xvZ3kgcGFnZSAoZGV0ZXJtaW5lIHdoaWNoIG9uZSlcbiAgICAgICAgY29uc3QgaGFzQ2FsZW5kYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmNhbGVuZGFyJyk7IC8vY2FsZW5kYXIgcGFnZVxuICAgICAgICBjb25zdCB1cmxIYXNDYWxlbmRhciA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnY2FsZW5kYXInKTtcbiAgICAgICAgaWYgKGhhc0NhbGVuZGFyICYmIHVybEhhc0NhbGVuZGFyKSB7IC8vdHlwZSAxOiBzY2hvb2xvZ3kgY2FsZW5kYXJcbiAgICAgICAgICAgIHdhaXRGb3JFdmVudHNMb2FkZWQoKTtcbiAgICAgICAgfVxuICAgICAgICAvL05vdCBjYWxlbmRhclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBoYXNDb3Vyc2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL1xcL2NvdXJzZVxcLyhcXGQrKVxcLy8pO1xuICAgICAgICAgICAgaWYgKGhhc0NvdXJzZSkgeyAvL3R5cGUgMjogY291cnNlIG1hdGVyaWFscyBwYWdlXG4gICAgICAgICAgICAgICAgbGV0IGNvdXJzZUlkID0gaGFzQ291cnNlWzFdO1xuICAgICAgICAgICAgICAgIGV4ZWN1dGVBZnRlckRvbmVMb2FkaW5nKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvdXJzZVBhZ2VfMS5kZWZhdWx0KGNvdXJzZUlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnaG9tZScpKSB7IC8vdHlwZSAzOiBzY2hvb2xvZ3kgaG9tZSBwYWdlXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFmdGVyRG9uZUxvYWRpbmcoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXcgSG9tZVBhZ2VfMS5kZWZhdWx0KHsgY29udGFpbmVyU2VsZWN0b3JzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpdi51cGNvbWluZy1ldmVudHMtd3JhcHBlcj5kaXYudXBjb21pbmctbGlzdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXI+ZGl2LnVwY29taW5nLWxpc3QnLCAvL292ZXJkdWUgYXNnbXRzXG4gICAgICAgICAgICAgICAgICAgICAgICBdIH0pO1xuICAgICAgICAgICAgICAgIH0sICgpID0+ICFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYub3ZlcmR1ZS1zdWJtaXNzaW9ucy13cmFwcGVyPmRpdi51cGNvbWluZy1saXN0JykpOyAvL2NoZWNrIGlmIHVwY29taW5nIGxpc3QgZXhpc3RzLCBub3QgaWYgbG9hZGluZyBpY29uIGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHsgLy9Ob24tc2Nob29sb2d5LXJlbGF0ZWQgcGFnZVxuICAgICAgICAgICAgICAgIC8vcGFzc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLy88aDE+IENBTEVOREFSXG4vL1Jlc2l6ZSBldmVudCBsaXN0ZW5lclxuZnVuY3Rpb24gd2FpdEZvckV2ZW50c0xvYWRlZCgpIHtcbiAgICBsZXQgY2hlY2tJZkV2ZW50c0xvYWRlZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IGNhbGVuZGFyRXZlbnRzTG9hZGVkID0galF1ZXJ5KCcjZmNhbGVuZGFyPmRpdi5mYy1jb250ZW50PmRpdi5mYy12aWV3PmRpdicpWzBdLmNoaWxkcmVuLmxlbmd0aCA+PSAzOyAvL21vcmUgdGhhbiB0aHJlZSBhc2dtdHMgb24gY2FsZW5kYXIgaW5kaWNhdGluZyBhc2dtdHMgbG9hZGVkXG4gICAgICAgIGlmIChjYWxlbmRhckV2ZW50c0xvYWRlZCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjaGVja0lmRXZlbnRzTG9hZGVkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCczLiBBZGQgY2hlY2ttYXJrcycpO1xuICAgICAgICAgICAgLy8gU2Nob29sb2d5Q2FsZW5kYXJQYWdlKCk7XG4gICAgICAgICAgICBuZXcgQ2FsZW5kYXJQYWdlXzEuZGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0aWxsIHdhaXRpbmcgZm9yIGNhbGVuZGFyIGV2ZW50cyB0byBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCAyMDApO1xufVxuLy8gKiBDT05GSUdcbi8vIGNvbnN0IGhvbWV3b3JrQ2hlY2tlclNjaG9vbG9neUNvbmZpZz17XG4vLyAgICAgdmVyYm9zZTogdHJ1ZSAvL3doZXRoZXIgb3Igbm90IHRvIHNob3cgY29uc29sZSBtZXNzYWdlc1xuLy8gfVxuLy8gXG4vLyA8TW9kaWZ5IGNvbnNvbGUubG9nKCkgYW5kIGNvbnNvbGUuZXJyb3IoKVxuLy8gbGV0IG9nQ29uc29sZUxvZz1jb25zb2xlLmxvZztcbi8vIGNvbnNvbGUubG9nPSguLi5hcmdzKT0+e1xuLy8gICAgIGlmIChob21ld29ya0NoZWNrZXJTY2hvb2xvZ3lDb25maWcudmVyYm9zZSlcbi8vICAgICAgICAgb2dDb25zb2xlTG9nKGDik6JgLCAuLi5hcmdzKTtcbi8vIH07XG4vLyBsZXQgb2dDb25zb2xlRXJyb3I9Y29uc29sZS5lcnJvcjtcbi8vIGNvbnNvbGUuZXJyb3I9KC4uLmFyZ3MpPT57XG4vLyAgICAgaWYgKGhvbWV3b3JrQ2hlY2tlclNjaG9vbG9neUNvbmZpZy52ZXJib3NlKVxuLy8gICAgIG9nQ29uc29sZUVycm9yKGDik6JgLCAuLi5hcmdzKTtcbi8vIH07XG4vLyAvPlxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9