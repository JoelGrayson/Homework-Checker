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
        const courseName = asgmtEl.querySelector(`.fc-event-inner>.fc-event-title span[class*='realm-title']`).innerText; /* most child span can have class of realm-title-user or realm-title-course based on whether or not it is a personal event */
        const newState = forcedState !== null && forcedState !== void 0 ? forcedState : pHighlight == null; //if user forced state, override newHighlight
        if (newState) { //no highlight green already
            console.log(`Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked = true;
            const highlightGreenEl = this.createGreenHighlightEl({ pageType: this.pageType, animate });
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstElement)
            if (storeInChrome)
                this.addAsgmt(courseName, asgmtText, { createCourseIfNotExist: true });
        }
        else {
            console.log(`Unchecking ${asgmtText}`);
            //Uncheck
            checkmarkEl.checked = false;
            asgmtEl.removeChild(pHighlight);
            // coursesGlobal.pop(coursesGlobal.indexOf(asgmtText));
            this.removeAsgmt(courseName, asgmtText);
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
            if (storeInChrome)
                this.addAsgmt(this.courseName, asgmtText, { createCourseIfNotExist: true });
        }
        else { //uncheck
            console.log(`Unchecking ${asgmtText}`);
            checkmarkEl.checked = false;
            const toRemove = asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            try {
                this.removeAsgmt(this.courseName, asgmtText);
            }
            catch (err) {
                console.error(err);
                setTimeout(() => {
                    this.removeAsgmt(this.courseName, asgmtText);
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
        const courseName = (asgmtEl.querySelector('h4>span').ariaLabel); //name of course based on aria-label of asgmtEl's <h4>'s <span>'s <div>
        // differs from courseName on calendar, so use space-less version for comparison
        if (newState) { //check
            console.log(`Checking '${asgmtText}'`);
            checkmarkEl.checked = true;
            const highlightGreenEl = this.createGreenHighlightEl({ pageType: this.pageType, animate });
            const parent = asgmtEl.querySelector('h4');
            asgmtEl.querySelector('h4>span').style.position = 'relative'; //so that text above checkmark
            parent.insertBefore(highlightGreenEl, parent.firstChild); //insert as first element (before firstElement)
            if (storeInChrome)
                this.addAsgmt(courseName, asgmtText, { createCourseIfNotExist: true });
        }
        else { //uncheck
            console.log(`Unchecking '${asgmtText}'`);
            checkmarkEl.checked = false;
            const toRemove = asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            try {
                this.removeAsgmt(courseName, asgmtText);
            }
            catch (err) {
                console.error(err);
                setTimeout(() => {
                    this.removeAsgmt(courseName, asgmtText);
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/// <reference types="jquery"/>
/// <reference types="chrome"/>
Object.defineProperty(exports, "__esModule", ({ value: true }));
const functions_1 = __webpack_require__(/*! ../functions */ "./src/functions.ts");
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
                for (let courseName of courses) { //check all assignments of all specified courses
                    let course = this.getCourse(courseName);
                    if (course != undefined) { //if the course exists
                        for (let asgmt of course.checked) {
                            let [infoEl, blockEl] = this.getAsgmtByName(asgmt);
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
    getCourse(name, options = { noSpacesName: true }) {
        if (options.noSpacesName)
            return this.coursesGlobal.find(course => (0, functions_1.removeSpaces)(course.name) === (0, functions_1.removeSpaces)(name)); //compare space-less names
        return this.coursesGlobal.find(course => course.name === name);
    }
    createCourse(course, options = { save: true }) {
        console.log('Creating course', course);
        this.coursesGlobal.push({
            name: course,
            noSpacesName: (0, functions_1.removeSpaces)(course),
            checked: []
        });
        if (options.save) //save unless specified to not save
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
        var _a, _b;
        (_a = options.createCourseIfNotExist) !== null && _a !== void 0 ? _a : (options.createCourseIfNotExist = false);
        (_b = options.noSpacesName) !== null && _b !== void 0 ? _b : (options.noSpacesName = true);
        if (options.createCourseIfNotExist && this.getCourse(course) === undefined) //create course if not exists
            this.createCourse(course, { save: false });
        console.log({ noSpacesName: options.noSpacesName });
        this.getCourse(course, { noSpacesName: options.noSpacesName }).checked.push(asgmt);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QztBQUN2QztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBLDJGQUEyRjtBQUMzRiwrQkFBK0I7QUFDL0Isa0VBQWtFO0FBQ2xFO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0Esa0VBQWtFO0FBQ2xFO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0IsaUJBQWlCLHVGQUF1RjtBQUN4RztBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnSEFBZ0g7QUFDaEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9mdW5jdGlvbnMudHMiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL3BhZ2VzL0NhbGVuZGFyUGFnZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvQ291cnNlUGFnZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvcGFnZXMvSG9tZVBhZ2UudHMiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL3BhZ2VzL1NjaG9vbG9neVBhZ2UudHMiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL3BhZ2VzL2NvbGxhcHNlT3ZlcmR1ZS50cyIsIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJlbW92ZVNwYWNlcyA9IHZvaWQgMDtcbmZ1bmN0aW9uIHJlbW92ZVNwYWNlcyhpbnB1dCkge1xuICAgIC8vIERpZmZlcmVudCBzcGFjaW5nIGJlbG93OlxuICAgIC8vIFwiQWxnZWJyYSBJSSAoSCk6IEFMR0VCUkEgSUkgSCAtIEdcIlxuICAgIC8vIFwiQWxnZWJyYSBJSSAoSCkgOiBBTEdFQlJBIElJIEggLSBHIFwiXG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGZvciAobGV0IGNoYXJhY3RlciBvZiBpbnB1dClcbiAgICAgICAgaWYgKGNoYXJhY3RlciAhPT0gJyAnKVxuICAgICAgICAgICAgc3RyICs9IGNoYXJhY3RlcjtcbiAgICByZXR1cm4gc3RyO1xufVxuZXhwb3J0cy5yZW1vdmVTcGFjZXMgPSByZW1vdmVTcGFjZXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNjaG9vbG9neVBhZ2VfMSA9IHJlcXVpcmUoXCIuL1NjaG9vbG9neVBhZ2VcIik7XG5jbGFzcyBDYWxlbmRhclBhZ2UgZXh0ZW5kcyBTY2hvb2xvZ3lQYWdlXzEuZGVmYXVsdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHBhZ2VUeXBlOiAnY2FsJyxcbiAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiAnc3Bhbi5mYy1ldmVudC10aXRsZT5zcGFuJyxcbiAgICAgICAgICAgIGluZm9Ub0Jsb2NrRWw6IGVsID0+IGVsLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgICAgbGltaXRzOiB7XG4gICAgICAgICAgICAgICAgY291cnNlczogJyRhbGwnLFxuICAgICAgICAgICAgICAgIHRpbWU6ICdhbnknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZENoZWNrbWFya3Moe1xuICAgICAgICAgICAgYXNnbXRFbENvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LmZjLWV2ZW50PmRpdi5mYy1ldmVudC1pbm5lcicpLnBhcmVudE5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICAgIGN1c3RvbU1pZGRsZVNjcmlwdDogKGNoZWNrRWwsIGFzZ210RWwpID0+IHtcbiAgICAgICAgICAgICAgICBqUXVlcnkoY2hlY2tFbCkub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvOiBlbCA9PiBlbFxuICAgICAgICB9KTtcbiAgICAgICAgLy9XaGVuIGNoYW5naW5nIG1vbnRocywgcmVsb2FkIHBhZ2VcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3Bhbi5mYy1idXR0b24tcHJldicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVsb2FkVG9Db3JyZWN0TW9udGhVUkwpOyAvL3ByZXZpb3VzIG1vbnRoIGJ1dHRvblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLmZjLWJ1dHRvbi1uZXh0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZWxvYWRUb0NvcnJlY3RNb250aFVSTCk7IC8vbmV4dCBtb250aCBidXR0b25cbiAgICAgICAgZnVuY3Rpb24gcmVsb2FkVG9Db3JyZWN0TW9udGhVUkwoKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmMtaGVhZGVyLXRpdGxlJyk7IC8vIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgbGV0IGVsVGV4dCA9IHRlbXBFbFsnaW5uZXJUZXh0J107XG4gICAgICAgICAgICBsZXQgW21vbnRoTmFtZSwgeWVhcl0gPSBlbFRleHQuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgIGxldCBtb250aDtcbiAgICAgICAgICAgIHN3aXRjaCAobW9udGhOYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnSmFudWFyeSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnRmVicnVhcnknOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwMic7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ01hcmNoJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDMnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBcHJpbCc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA0JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnTWF5JzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdKdW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDYnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdKdWx5JzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBdWd1c3QnOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwOCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1NlcHRlbWJlcic6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA5JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnT2N0b2Jlcic6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzEwJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnTm92ZW1iZXInOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcxMSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0RlY2VtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMTInO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBjb25zb2xlLmVycm9yKCdVbmtub3duIG1vbnRoPycsIG1vbnRoTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkYXRlVVJMID0gYCR7eWVhcn0tJHttb250aH1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coeyBkYXRlVVJMIH0pO1xuICAgICAgICAgICAgY29uc3Qgb2xkUGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goLyguKlxcLylcXGR7NH0tXFxkezJ9LylbMV07IC8vcmVtb3ZlcyBsYXN0ICMjIyMtIyMgcGFydCBvZiBVUkxcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGhuYW1lID0gYCR7b2xkUGF0aG5hbWV9JHtkYXRlVVJMfWA7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPSBuZXdQYXRobmFtZTtcbiAgICAgICAgfVxuICAgICAgICAvL1Jldml2ZXMgd2hlbiBjaGVja21hcmtzIGRpc2FwcGVhciBkdWUgdG8gYXNnbXRzIHJlLXJlbmRlciAoc3VjaCBhcyB3aGVuIHdpbmRvdyByZXNpemVkIG9yIGFkZGVkIGEgcGVyc29uYWwgYXNnbXQpXG4gICAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpfY2hlY2tfY2FsJykpIC8vY2hlY2ttYXJrcyBkb24ndCBleGlzdCBhbnltb3JlXG4gICAgICAgICAgICAgICAgbmV3IENhbGVuZGFyUGFnZSgpOyAvL3Jldml2ZSBjaGVja21hcmtzXG4gICAgICAgICAgICAvL2FsdGVybmF0aXZlOiB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgfSwgMzAwKTtcbiAgICB9XG4gICAgY2hlY2tBbGxBc2dtdHMoKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzQnlEYXRlID0galF1ZXJ5KGBzcGFuW2NsYXNzKj0nZGF5LSddYCk7XG4gICAgICAgIGZvciAobGV0IGVsIG9mIGVsZW1lbnRzQnlEYXRlKSB7XG4gICAgICAgICAgICBsZXQgYXNnbXRFbCA9IGVsLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgaWYgKGFzZ210RWwgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aGlzLmpfY2hlY2soe1xuICAgICAgICAgICAgICAgICAgICBhc2dtdEVsLFxuICAgICAgICAgICAgICAgICAgICBmb3JjZWRTdGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7IC8vZm9yY2VkU3RhdGUgaXMgdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuICAgIGNoZWNrQWxsQXNnbXRzQmVmb3JlVG9kYXkoKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzQnlEYXRlID0galF1ZXJ5KGBzcGFuW2NsYXNzKj0nZGF5LSddYCk7XG4gICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS5nZXREYXRlKCk7XG4gICAgICAgIGZvciAobGV0IGVsIG9mIGVsZW1lbnRzQnlEYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBkYXlPZkVsID0gcGFyc2VJbnQoZWwuY2xhc3NOYW1lLnNsaWNlKC0yKSk7XG4gICAgICAgICAgICBjb25zdCBiZWZvcmVUb2RheSA9IGRheU9mRWwgPCB0b2RheTtcbiAgICAgICAgICAgIGlmIChiZWZvcmVUb2RheSkgeyAvL2JlZm9yZSB0b2RheVxuICAgICAgICAgICAgICAgIGNvbnN0IGFzZ210RWwgPSBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBpZiAoYXNnbXRFbCAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmpfY2hlY2soe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNnbXRFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlZFN0YXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgal9jaGVjayh7IGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgb3B0aW9uczogeyBzdG9yZUluQ2hyb21lID0gdHJ1ZSwgYW5pbWF0ZSA9IGZhbHNlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgfSB9KSB7XG4gICAgICAgIC8vc3RvcmVJbkNocm9tZSBpbmRpY2F0ZXMgd2hldGhlciBvciBub3QgdG8gc2VuZCByZXF1ZXN0IHRvIHN0b3JlIGluIGNocm9tZS4gaXMgZmFsc2Ugd2hlbiBleHRlbnNpb24gaW5pdGlhbGl6aW5nICYgY2hlY2tpbmcgb2ZmIHByaW9yIGFzZ210cyBmcm9tIHN0b3JhZ2UuIGlzIHRydWUgYWxsIG90aGVyIHRpbWVzXG4gICAgICAgIGNvbnN0IHBIaWdobGlnaHQgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTsgLy9iYXNlZCBvbiBpdGVtIGluc2lkZSBhc2dtdFxuICAgICAgICBjb25zdCBjaGVja21hcmtFbCA9IGFzZ210RWwucXVlcnlTZWxlY3RvcihgaW5wdXQual9jaGVja18ke3RoaXMucGFnZVR5cGV9YCk7XG4gICAgICAgIGNvbnN0IGFzZ210VGV4dCA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignLmZjLWV2ZW50LWlubmVyPi5mYy1ldmVudC10aXRsZT5zcGFuJykuZmlyc3RDaGlsZC5ub2RlVmFsdWU7IC8vb25seSB2YWx1ZSBvZiBhc2dtdCAoZmlyc3RDaGlsZCksIG5vdCBpbmNsdWRpbmcgaW5zaWRlIGdyYW5kY2hpbGRyZW4gbGlrZSBpbm5lclRleHQoKVxuICAgICAgICBjb25zdCBjb3Vyc2VOYW1lID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGAuZmMtZXZlbnQtaW5uZXI+LmZjLWV2ZW50LXRpdGxlIHNwYW5bY2xhc3MqPSdyZWFsbS10aXRsZSddYCkuaW5uZXJUZXh0OyAvKiBtb3N0IGNoaWxkIHNwYW4gY2FuIGhhdmUgY2xhc3Mgb2YgcmVhbG0tdGl0bGUtdXNlciBvciByZWFsbS10aXRsZS1jb3Vyc2UgYmFzZWQgb24gd2hldGhlciBvciBub3QgaXQgaXMgYSBwZXJzb25hbCBldmVudCAqL1xuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGZvcmNlZFN0YXRlICE9PSBudWxsICYmIGZvcmNlZFN0YXRlICE9PSB2b2lkIDAgPyBmb3JjZWRTdGF0ZSA6IHBIaWdobGlnaHQgPT0gbnVsbDsgLy9pZiB1c2VyIGZvcmNlZCBzdGF0ZSwgb3ZlcnJpZGUgbmV3SGlnaGxpZ2h0XG4gICAgICAgIGlmIChuZXdTdGF0ZSkgeyAvL25vIGhpZ2hsaWdodCBncmVlbiBhbHJlYWR5XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgJHthc2dtdFRleHR9YCk7XG4gICAgICAgICAgICAvL0NoZWNrXG4gICAgICAgICAgICBjaGVja21hcmtFbC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodEdyZWVuRWwgPSB0aGlzLmNyZWF0ZUdyZWVuSGlnaGxpZ2h0RWwoeyBwYWdlVHlwZTogdGhpcy5wYWdlVHlwZSwgYW5pbWF0ZSB9KTtcbiAgICAgICAgICAgIGFzZ210RWwuaW5zZXJ0QmVmb3JlKGhpZ2hsaWdodEdyZWVuRWwsIGFzZ210RWwuZmlyc3RDaGlsZCk7IC8vaW5zZXJ0IGFzIGZpcnN0IGVsZW1lbnQgKGJlZm9yZSBmaXJzdEVsZW1lbnQpXG4gICAgICAgICAgICBpZiAoc3RvcmVJbkNocm9tZSlcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEFzZ210KGNvdXJzZU5hbWUsIGFzZ210VGV4dCwgeyBjcmVhdGVDb3Vyc2VJZk5vdEV4aXN0OiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFVuY2hlY2tpbmcgJHthc2dtdFRleHR9YCk7XG4gICAgICAgICAgICAvL1VuY2hlY2tcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGFzZ210RWwucmVtb3ZlQ2hpbGQocEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAvLyBjb3Vyc2VzR2xvYmFsLnBvcChjb3Vyc2VzR2xvYmFsLmluZGV4T2YoYXNnbXRUZXh0KSk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFzZ210KGNvdXJzZU5hbWUsIGFzZ210VGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDYWxlbmRhclBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNjaG9vbG9neVBhZ2VfMSA9IHJlcXVpcmUoXCIuL1NjaG9vbG9neVBhZ2VcIik7XG5jb25zdCBmdW5jdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9mdW5jdGlvbnNcIik7XG5jbGFzcyBDb3Vyc2VQYWdlIGV4dGVuZHMgU2Nob29sb2d5UGFnZV8xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKGNvdXJzZUlkKSB7XG4gICAgICAgIGxldCBjb250YWluZXJQYXRoID0gYCNjb3Vyc2UtZXZlbnRzIC51cGNvbWluZy1saXN0IC51cGNvbWluZy1ldmVudHMgLnVwY29taW5nLWxpc3RgO1xuICAgICAgICBsZXQgY291cnNlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjZW50ZXItdG9wPi5wYWdlLXRpdGxlJykuaW5uZXJUZXh0OyAvL2dyYWJzIGNvdXJzZSB0aXRsZVxuICAgICAgICBjb3Vyc2VOYW1lID0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykoY291cnNlTmFtZSk7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHBhZ2VUeXBlOiAnY291cnNlJyxcbiAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiBgJHtjb250YWluZXJQYXRofT5kaXZbZGF0YS1zdGFydF1gLFxuICAgICAgICAgICAgaW5mb1RvQmxvY2tFbDogZWwgPT4gZWwsXG4gICAgICAgICAgICBsaW1pdHM6IHtcbiAgICAgICAgICAgICAgICBjb3Vyc2VzOiBjb3Vyc2VOYW1lLFxuICAgICAgICAgICAgICAgIHRpbWU6ICdhbnknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvdXJzZUlkID0gY291cnNlSWQ7XG4gICAgICAgIHRoaXMuY291cnNlTmFtZSA9IGNvdXJzZU5hbWU7XG4gICAgICAgIHRoaXMuYWRkQ2hlY2ttYXJrcyh7XG4gICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclBhdGgpLFxuICAgICAgICAgICAgY3VzdG9tTWlkZGxlU2NyaXB0OiAoY2hlY2tFbCwgYXNnbXRFbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhc2dtdEVsLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZS1oZWFkZXInKSkgLy9kb2VzIG5vdCBhZGQgY2hlY2sgdG8gLmRhdGUtaGVhZGVyIGJ5IGNvbnRpbnVlO2luZyBvdXQgb2YgbG9vcFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2NvbnRpbnVlJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG86IGVsID0+IGVsLmZpcnN0Q2hpbGRcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGpfY2hlY2soeyBhc2dtdEVsLCBmb3JjZWRTdGF0ZSA9IG51bGwsIG9wdGlvbnM6IHsgc3RvcmVJbkNocm9tZSA9IHRydWUsIGFuaW1hdGUgPSBmYWxzZSAvL3Nob3dzIGFuaW1hdGlvbiB3aGVuIGNoZWNraW5nXG4gICAgIH0gfSkge1xuICAgICAgICBjb25zdCBwSGlnaGxpZ2h0ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7IC8vYmFzZWQgb24gY2xhc3NMaXN0IG9mIGFzZ210RWxcbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBmb3JjZWRTdGF0ZSAhPT0gbnVsbCAmJiBmb3JjZWRTdGF0ZSAhPT0gdm9pZCAwID8gZm9yY2VkU3RhdGUgOiAhcEhpZ2hsaWdodDsgLy9vcHBvc2l0ZSB3aGVuIGNoZWNraW5nXG4gICAgICAgIGNvbnN0IGNoZWNrbWFya0VsID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dC5qX2NoZWNrXyR7dGhpcy5wYWdlVHlwZX1gKTtcbiAgICAgICAgY29uc3QgYXNnbXRUZXh0ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdhJykuaW5uZXJUZXh0O1xuICAgICAgICBjb25zb2xlLmxvZyh7IG5ld0hpZ2hsaWdodDogbmV3U3RhdGUsIHBIaWdobGlnaHQsIGNoZWNrbWFya0VsIH0pO1xuICAgICAgICBpZiAobmV3U3RhdGUpIHsgLy9ubyBoaWdobGlnaHQgZ3JlZW4gYWxyZWFkeSwgc28gY2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyAke2FzZ210VGV4dH1gKTtcbiAgICAgICAgICAgIC8vQ2hlY2tcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW5FbCA9IHRoaXMuY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlOiB0aGlzLnBhZ2VUeXBlLCBhbmltYXRlIH0pO1xuICAgICAgICAgICAgYXNnbXRFbC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7IC8vZm9yIGdyZWVuIHJlY3QgdG8gYmUgYm91bmQgdG8gYXNnbXRFbFxuICAgICAgICAgICAgYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoNCcpLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJzsgLy9zbyB0aGF0IHRleHQgYWJvdmUgY2hlY2ttYXJrXG4gICAgICAgICAgICBhc2dtdEVsLmluc2VydEJlZm9yZShoaWdobGlnaHRHcmVlbkVsLCBhc2dtdEVsLmZpcnN0Q2hpbGQpOyAvL2luc2VydCBhcyBmaXJzdCBlbGVtZW50IChiZWZvcmUgZmlyc3RDaGlsZClcbiAgICAgICAgICAgIGlmIChzdG9yZUluQ2hyb21lKVxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQXNnbXQodGhpcy5jb3Vyc2VOYW1lLCBhc2dtdFRleHQsIHsgY3JlYXRlQ291cnNlSWZOb3RFeGlzdDogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy91bmNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5jaGVja2luZyAke2FzZ210VGV4dH1gKTtcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHRvUmVtb3ZlID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7XG4gICAgICAgICAgICB0b1JlbW92ZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRvUmVtb3ZlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBc2dtdCh0aGlzLmNvdXJzZU5hbWUsIGFzZ210VGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFzZ210KHRoaXMuY291cnNlTmFtZSwgYXNnbXRUZXh0KTtcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENvdXJzZVBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFNjaG9vbG9neVBhZ2VfMSA9IHJlcXVpcmUoXCIuL1NjaG9vbG9neVBhZ2VcIik7XG5jb25zdCBjb2xsYXBzZU92ZXJkdWVfMSA9IHJlcXVpcmUoXCIuL2NvbGxhcHNlT3ZlcmR1ZVwiKTtcbmNsYXNzIEhvbWVQYWdlIGV4dGVuZHMgU2Nob29sb2d5UGFnZV8xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKHsgY29udGFpbmVyU2VsZWN0b3JzIH0pIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgcGFnZVR5cGU6ICdob21lJyxcbiAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiBjb250YWluZXJTZWxlY3RvcnMubWFwKHMgPT4gYCR7c30+ZGl2YCksXG4gICAgICAgICAgICBpbmZvVG9CbG9ja0VsOiBlbCA9PiBlbCxcbiAgICAgICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgICAgIGNvdXJzZXM6ICckYWxsJyxcbiAgICAgICAgICAgICAgICB0aW1lOiAnYW55J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG11bHRpcGxlQXNnbXRDb250YWluZXJzOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAoMCwgY29sbGFwc2VPdmVyZHVlXzEuZGVmYXVsdCkoKTtcbiAgICAgICAgZm9yIChsZXQgY29udGFpbmVyU2VsZWN0b3Igb2YgY29udGFpbmVyU2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgaDQ+c3BhbmA7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyQ2xhc3MgPSAnal9jaGVja19jb250YWluZXInO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGVja21hcmtzKHtcbiAgICAgICAgICAgICAgICBhc2dtdEVsQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKSxcbiAgICAgICAgICAgICAgICBjdXN0b21NaWRkbGVTY3JpcHQ6IChjaGVja0VsLCBhc2dtdEVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhc2dtdEVsLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZS1oZWFkZXInKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnY29udGludWUnO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIHsgLy92YWxpZCBhc3NpZ25tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGpDaGVja0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpDaGVja0NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGNvbnRhaW5lckNsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnROb2RlID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpDaGVja0NvbnRhaW5lciwgcGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdzcGFuLnVwY29taW5nLXRpbWUnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxvY2F0ZUVsVG9BcHBlbmRDaGVja21hcmtUbzogZWwgPT4gZWwucXVlcnlTZWxlY3RvcihgJHtzZWxlY3Rvcn0gc3Bhbi4ke2NvbnRhaW5lckNsYXNzfWApLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgal9jaGVjayh7IGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgb3B0aW9uczogeyBzdG9yZUluQ2hyb21lID0gdHJ1ZSwgYW5pbWF0ZSA9IGZhbHNlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgfSB9KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYXNnbXRFbCB9KTtcbiAgICAgICAgY29uc3QgcEhpZ2hsaWdodCA9ICEhYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7IC8vYmFzZWQgb24gY2xhc3NMaXN0IG9mIGFzZ210RWxcbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBmb3JjZWRTdGF0ZSAhPT0gbnVsbCAmJiBmb3JjZWRTdGF0ZSAhPT0gdm9pZCAwID8gZm9yY2VkU3RhdGUgOiAhcEhpZ2hsaWdodDsgLy9vcHBvc2l0ZSB3aGVuIGNoZWNraW5nXG4gICAgICAgIGNvbnN0IGNoZWNrbWFya0VsID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKGBpbnB1dC5qX2NoZWNrXyR7dGhpcy5wYWdlVHlwZX1gKTtcbiAgICAgICAgY29uc3QgdGVtcEFuY2hvciA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICBjb25zdCBhc2dtdFRleHQgPSB0ZW1wQW5jaG9yLmlubmVyVGV4dDtcbiAgICAgICAgY29uc3QgY291cnNlTmFtZSA9IChhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2g0PnNwYW4nKS5hcmlhTGFiZWwpOyAvL25hbWUgb2YgY291cnNlIGJhc2VkIG9uIGFyaWEtbGFiZWwgb2YgYXNnbXRFbCdzIDxoND4ncyA8c3Bhbj4ncyA8ZGl2PlxuICAgICAgICAvLyBkaWZmZXJzIGZyb20gY291cnNlTmFtZSBvbiBjYWxlbmRhciwgc28gdXNlIHNwYWNlLWxlc3MgdmVyc2lvbiBmb3IgY29tcGFyaXNvblxuICAgICAgICBpZiAobmV3U3RhdGUpIHsgLy9jaGVja1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENoZWNraW5nICcke2FzZ210VGV4dH0nYCk7XG4gICAgICAgICAgICBjaGVja21hcmtFbC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodEdyZWVuRWwgPSB0aGlzLmNyZWF0ZUdyZWVuSGlnaGxpZ2h0RWwoeyBwYWdlVHlwZTogdGhpcy5wYWdlVHlwZSwgYW5pbWF0ZSB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGFzZ210RWwucXVlcnlTZWxlY3RvcignaDQnKTtcbiAgICAgICAgICAgIGFzZ210RWwucXVlcnlTZWxlY3RvcignaDQ+c3BhbicpLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJzsgLy9zbyB0aGF0IHRleHQgYWJvdmUgY2hlY2ttYXJrXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGhpZ2hsaWdodEdyZWVuRWwsIHBhcmVudC5maXJzdENoaWxkKTsgLy9pbnNlcnQgYXMgZmlyc3QgZWxlbWVudCAoYmVmb3JlIGZpcnN0RWxlbWVudClcbiAgICAgICAgICAgIGlmIChzdG9yZUluQ2hyb21lKVxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQXNnbXQoY291cnNlTmFtZSwgYXNnbXRUZXh0LCB7IGNyZWF0ZUNvdXJzZUlmTm90RXhpc3Q6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vdW5jaGVja1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFVuY2hlY2tpbmcgJyR7YXNnbXRUZXh0fSdgKTtcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHRvUmVtb3ZlID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7XG4gICAgICAgICAgICB0b1JlbW92ZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRvUmVtb3ZlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdFRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdFRleHQpO1xuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gSG9tZVBhZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwianF1ZXJ5XCIvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJjaHJvbWVcIi8+XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBmdW5jdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9mdW5jdGlvbnNcIik7XG5jbGFzcyBTY2hvb2xvZ3lQYWdlIHtcbiAgICBjb25zdHJ1Y3Rvcih7IHBhZ2VUeXBlLCBnZXRBc2dtdEJ5TmFtZVBhdGhFbCwgaW5mb1RvQmxvY2tFbCwgbGltaXRzLCBpZ25vcmVPbGRBc2dtdHMgPSB0cnVlLCBtdWx0aXBsZUFzZ210Q29udGFpbmVycyA9IGZhbHNlIH0pIHtcbiAgICAgICAgY29uc29sZS5sb2coeyBwYWdlVHlwZSwgZ2V0QXNnbXRCeU5hbWVQYXRoRWwsIGluZm9Ub0Jsb2NrRWwsIGxpbWl0cywgaWdub3JlT2xkQXNnbXRzLCBtdWx0aXBsZUFzZ210Q29udGFpbmVycyB9KTtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NldHRpbmdzJywgKHsgc2V0dGluZ3MgfSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNob3dDaGVja21hcmtzID09PSAnb25Ib3ZlcicpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnT25seSBzaG93IGNoZWNrbWFyayBvbiBob3ZlcicpO1xuICAgICAgICAgICAgICAgIC8vTG9hZCBzdHlsZSBpZiBvbmx5U2hvd0NoZWNrbWFya09uSG92ZXJcbiAgICAgICAgICAgICAgICBsZXQgc3R5bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgc3R5bGVFbC5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICAgICAgICAgIC5qX2NoZWNrX2NhbCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiBoaWRkZW47IC8qIGFsbCBpbnB1dCBjaGVja3MgaGlkZGVuICovXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLmZjLWV2ZW50OmhvdmVyIC5qX2NoZWNrX2NhbCB7IC8qIGlucHV0IGNoZWNrIHNob3duIG9uaG92ZXIgb2YgYXNnbXQgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhZ2VUeXBlID0gcGFnZVR5cGU7IC8vaW5kaWNhdGVzIGNzcyBjbGFzcyBmb3IgY2hlY2tib3hcbiAgICAgICAgdGhpcy5tdWx0aXBsZUFzZ210Q29udGFpbmVycyA9IG11bHRpcGxlQXNnbXRDb250YWluZXJzO1xuICAgICAgICB0aGlzLmdldEFzZ210QnlOYW1lUGF0aEVsID0gZ2V0QXNnbXRCeU5hbWVQYXRoRWw7IC8vZnJvbSB3aGVyZSB0byBzZWFyY2ggOmNvbnRhaW5zKCkgb2YgYW4gYXNnbXQgYnkgbmFtZVxuICAgICAgICB0aGlzLmluZm9Ub0Jsb2NrRWwgPSBpbmZvVG9CbG9ja0VsO1xuICAgICAgICB0aGlzLmlnbm9yZU9sZEFzZ210cyA9IGlnbm9yZU9sZEFzZ210cztcbiAgICAgICAgLyp7XG4gICAgICAgICAgICBjb3Vyc2VzLCAvLyckYWxsJyB8IFN0cmluZyBvZiBjb3Vyc2UgbmFtZVxuICAgICAgICAgICAgdGltZSAvLydhbnknIHwgJ2Z1dHVyZSdcbiAgICAgICAgfSovXG4gICAgICAgIC8vbGlzdGVucyBmb3IgYHJ1biAkY21kYCBtZXNzYWdlIGZyb20gcG9wdXAuanNcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtc2csIHNlbmRlciwgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChtc2cuaGFzT3duUHJvcGVydHkoJ3J1bicpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChtc2cucnVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbG9hZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGVjayBhbGwgYXNnbXRzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tBbGxBc2dtdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGVjayBhbGwgYXNnbXRzIGJlZm9yZSB0b2RheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQWxsQXNnbXRzQmVmb3JlVG9kYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5rbm93biBydW4gbWVzc2FnZTonLCBtc2cucnVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vU2V0cyB0aGlzLmNvdXJzZXNHbG9iYWwgdG8gY2hyb21lIHN0b3JhZ2VcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ2NvdXJzZXMnLCAoeyBjb3Vyc2VzIH0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291cnNlc0dsb2JhbCA9IGNvdXJzZXM7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY291cnNlcycsIGNvdXJzZXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobGltaXRzKTsgLy90aW1lICYgY291cnNlIGxpbWl0cyB3aGVuIGdldHRpbmcgYXNnbXRzXG4gICAgICAgICAgICBpZiAobGltaXRzLmNvdXJzZXMgPT09ICckYWxsJyAmJiBsaW1pdHMudGltZSA9PT0gJ2FueScpIHsgLy9jYWxlbmRhciBvciBob21lIHBhZ2VcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjb3Vyc2Ugb2YgY291cnNlcykgeyAvL1RPRE86IGNoYW5nZSBzY2hlbWFcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrZWQgPSBjb3Vyc2UuY2hlY2tlZDsgLy9hc2dtdHNcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYXNnbXRFbCBvZiBjaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luZm9FbCwgYmxvY2tFbF0gPSB0aGlzLmdldEFzZ210QnlOYW1lKGFzZ210RWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9FbCAhPT0gJ05vIG1hdGNoZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzZ210RWw6IGJsb2NrRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsaW1pdHMuY291cnNlcyA9PT0gJyRhbGwnICYmIHRoaXMudGltZSA9PT0gJ2Z1dHVyZScpIHsgLy9ub3QgYmVpbmcgdXNlZCwgcG90ZW50aWFsIGlmIG5vdCBwcmV2IGFzZ210c1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGltaXRzLmNvdXJzZXMgIT09ICckYWxsJyAmJiB0aGlzLnRpbWUgPT09ICdhbnknKSB7IC8vY291cnNlIHBhZ2UgKGFsbCBhc2dtdHMgb2YgY291cnNlKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbmx5IGNoZWNraW5nIHRoZSBjb3Vyc2U6ICR7dGhpcy5jb3Vyc2VzfWApO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGNvdXJzZU5hbWUgb2YgY291cnNlcykgeyAvL2NoZWNrIGFsbCBhc3NpZ25tZW50cyBvZiBhbGwgc3BlY2lmaWVkIGNvdXJzZXNcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdXJzZSA9IHRoaXMuZ2V0Q291cnNlKGNvdXJzZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY291cnNlICE9IHVuZGVmaW5lZCkgeyAvL2lmIHRoZSBjb3Vyc2UgZXhpc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhc2dtdCBvZiBjb3Vyc2UuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5mb0VsLCBibG9ja0VsXSA9IHRoaXMuZ2V0QXNnbXRCeU5hbWUoYXNnbXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvRWwgIT09ICdObyBtYXRjaGVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzZ210RWw6IGJsb2NrRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGVja0FsbEFzZ210cygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIGNoZWNrQWxsQXNnbXRzQmVmb3JlVG9kYXkoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICAvLyogPG1ldGhvZHMgdG8gaW50ZXJhY3Qgd2l0aCB0aGlzLmNvdXJzZUdsb2JhbFxuICAgIGdldENvdXJzZShuYW1lLCBvcHRpb25zID0geyBub1NwYWNlc05hbWU6IHRydWUgfSkge1xuICAgICAgICBpZiAob3B0aW9ucy5ub1NwYWNlc05hbWUpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb3Vyc2VzR2xvYmFsLmZpbmQoY291cnNlID0+ICgwLCBmdW5jdGlvbnNfMS5yZW1vdmVTcGFjZXMpKGNvdXJzZS5uYW1lKSA9PT0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykobmFtZSkpOyAvL2NvbXBhcmUgc3BhY2UtbGVzcyBuYW1lc1xuICAgICAgICByZXR1cm4gdGhpcy5jb3Vyc2VzR2xvYmFsLmZpbmQoY291cnNlID0+IGNvdXJzZS5uYW1lID09PSBuYW1lKTtcbiAgICB9XG4gICAgY3JlYXRlQ291cnNlKGNvdXJzZSwgb3B0aW9ucyA9IHsgc2F2ZTogdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBjb3Vyc2UnLCBjb3Vyc2UpO1xuICAgICAgICB0aGlzLmNvdXJzZXNHbG9iYWwucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBjb3Vyc2UsXG4gICAgICAgICAgICBub1NwYWNlc05hbWU6ICgwLCBmdW5jdGlvbnNfMS5yZW1vdmVTcGFjZXMpKGNvdXJzZSksXG4gICAgICAgICAgICBjaGVja2VkOiBbXVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2F2ZSkgLy9zYXZlIHVubGVzcyBzcGVjaWZpZWQgdG8gbm90IHNhdmVcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ291cnNlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gY291cnNlIG5hbWVcbiAgICAgKiBAcmV0dXJucyBjb3Vyc2UgbmFtZVxuICAgICovXG4gICAgZGVsZXRlQ291cnNlKG5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuY291cnNlc0dsb2JhbFt0aGlzLmNvdXJzZXNHbG9iYWwuZmluZEluZGV4KGNvdXJzZSA9PiBjb3Vyc2UubmFtZSA9PT0gbmFtZSkgLy9nZXQgaW5kZXhcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3Vyc2VzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjb3Vyc2UgY291cnNlIG5hbWVcbiAgICAgKiBAcGFyYW0gYXNnbXQgYXNzaWdubWVudCBuYW1lXG4gICAgICovXG4gICAgYWRkQXNnbXQoY291cnNlLCBhc2dtdCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgX2EsIF9iO1xuICAgICAgICAoX2EgPSBvcHRpb25zLmNyZWF0ZUNvdXJzZUlmTm90RXhpc3QpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IChvcHRpb25zLmNyZWF0ZUNvdXJzZUlmTm90RXhpc3QgPSBmYWxzZSk7XG4gICAgICAgIChfYiA9IG9wdGlvbnMubm9TcGFjZXNOYW1lKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiAob3B0aW9ucy5ub1NwYWNlc05hbWUgPSB0cnVlKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuY3JlYXRlQ291cnNlSWZOb3RFeGlzdCAmJiB0aGlzLmdldENvdXJzZShjb3Vyc2UpID09PSB1bmRlZmluZWQpIC8vY3JlYXRlIGNvdXJzZSBpZiBub3QgZXhpc3RzXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvdXJzZShjb3Vyc2UsIHsgc2F2ZTogZmFsc2UgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgbm9TcGFjZXNOYW1lOiBvcHRpb25zLm5vU3BhY2VzTmFtZSB9KTtcbiAgICAgICAgdGhpcy5nZXRDb3Vyc2UoY291cnNlLCB7IG5vU3BhY2VzTmFtZTogb3B0aW9ucy5ub1NwYWNlc05hbWUgfSkuY2hlY2tlZC5wdXNoKGFzZ210KTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3Vyc2VzKCk7XG4gICAgfVxuICAgIHJlbW92ZUFzZ210KGNvdXJzZU5hbWUsIGFzZ210KSB7XG4gICAgICAgIHRoaXMuZ2V0Q291cnNlKGNvdXJzZU5hbWUpLmNoZWNrZWQgPSB0aGlzLmdldENvdXJzZShjb3Vyc2VOYW1lKS5jaGVja2VkLmZpbHRlcihpdGVtID0+IChpdGVtICE9PSBhc2dtdCkpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNvdXJzZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhc2dtdDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgY2hyb21lJ3Mgc3RvcmFnZSB3aXRoIGNoZWNrZWQgdGFza3MgcGFyYW1ldGVyXG4gICAgICogQHJldHVybnMgUHJvbWlzZSBib29sZWFuIHN1Y2NlZWRlZD9cbiAgICAgKiAqL1xuICAgIHVwZGF0ZUNvdXJzZXMobmV3Q291cnNlcykge1xuICAgICAgICBuZXdDb3Vyc2VzID0gbmV3Q291cnNlcyAhPT0gbnVsbCAmJiBuZXdDb3Vyc2VzICE9PSB2b2lkIDAgPyBuZXdDb3Vyc2VzIDogdGhpcy5jb3Vyc2VzR2xvYmFsOyAvL2RlZmF1bHQgaXMgdGhpcy5jb3Vyc2VzR2xvYmFsXG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IGNvdXJzZXM6IG5ld0NvdXJzZXMgfSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgcnVuOiAndXBkYXRlIGNocm9tZSBzdG9yYWdlJyxcbiAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICB9LCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUocmVzcG9uc2UpOyAvL3N1Y2NlZWRlZCBvciBub3RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8qID5cbiAgICBhZGRDaGVja21hcmtzKHsgLy9jYWxsZWQgaW4gc3ViY2xhc3MnIGNvbnN0cnVjdG9yLCBhZGRzIGNoZWNrbWFya3MgdG8gZWFjaCBhc2dtdCBmb3IgY2xpY2tpbmc7IGNoZWNrcyB0aG9zZSBjaGVja21hcmtzIGJhc2VkIG9uIGNocm9tZSBzdG9yYWdlXG4gICAgYXNnbXRFbENvbnRhaW5lciwgLy93aGVyZSB0aGUgYXNnbXRzIGFyZSBsb2NhdGVkXG4gICAgY3VzdG9tTWlkZGxlU2NyaXB0LCAvL2Fub255bW91cyBmdW5jIGV4ZWN1dGVkIGluIHRoZSBtaWRkbGVcbiAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG8gLy9kZXRlcm1pbmVzIGhvdyB0byBhZGQgY2hpbGRyZW4gZWxzIGllIGVsPT5lbC5wYXJlbnROb2RlXG4gICAgIH0pIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gYXNnbXRFbENvbnRhaW5lci5jaGlsZHJlbjtcbiAgICAgICAgZm9yIChsZXQgYXNnbXRFbCBvZiBjaGlsZHJlbikge1xuICAgICAgICAgICAgbGV0IGNoZWNrRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgY2hlY2tFbC5jbGFzc05hbWUgPSBgal9jaGVja18ke3RoaXMucGFnZVR5cGV9YDtcbiAgICAgICAgICAgIGNoZWNrRWwudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgICAgICBjaGVja0VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2FuaW1hdGUgYmVjYXVzZSB1c2VyIGNsaWNraW5nXG4gICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgYXNnbXRFbCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU6IHRydWUgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCB0b1J1biA9IGN1c3RvbU1pZGRsZVNjcmlwdChjaGVja0VsLCBhc2dtdEVsKTsgLy9yZXR1cm5zIHN0cmluZyB0byBldmFsdWF0ZSAocmFyZWx5IHVzZWQpXG4gICAgICAgICAgICBpZiAodG9SdW4gPT09ICdjb250aW51ZScpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBsb2NhdGVFbFRvQXBwZW5kQ2hlY2ttYXJrVG8oYXNnbXRFbCkuYXBwZW5kQ2hpbGQoY2hlY2tFbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0QXNnbXRCeU5hbWUoYXNnbXROYW1lKSB7XG4gICAgICAgIGxldCBxdWVyeSwgcXVlcnlSZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKGFzZ210TmFtZSwgdGhpcy5tdWx0aXBsZUFzZ210Q29udGFpbmVycyk7XG4gICAgICAgIGlmICh0aGlzLm11bHRpcGxlQXNnbXRDb250YWluZXJzKSB7IC8vbXVsdGlwbGUgYXNnbXQgY29udGFpbmVycyB0byBjaGVja1xuICAgICAgICAgICAgZm9yIChsZXQgZ2V0QXNnbXRCeU5hbWVQYXRoRWwgb2YgdGhpcy5nZXRBc2dtdEJ5TmFtZVBhdGhFbCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gYCR7Z2V0QXNnbXRCeU5hbWVQYXRoRWx9OmNvbnRhaW5zKCcke2FzZ210TmFtZS5yZXBsYWNlQWxsKGAnYCwgYFxcXFwnYCkgLyogZXNjYXBlIHF1b3RlIG1hcmtzICovfScpYDtcbiAgICAgICAgICAgICAgICBxdWVyeVJlcyA9IGpRdWVyeShxdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5UmVzLmxlbmd0aCA+IDApIC8va2VlcHMgZ29pbmcgdGhydSBhc2dtdENvbnRhaW5lcnMgdW50aWwgcXVlcnlSZXMgaXMgYW4gYXNnbXRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gYCR7dGhpcy5nZXRBc2dtdEJ5TmFtZVBhdGhFbH06Y29udGFpbnMoJyR7YXNnbXROYW1lLnJlcGxhY2VBbGwoYCdgLCBgXFxcXCdgKSAvKiBlc2NhcGUgcXVvdGUgbWFya3MgKi99JylgO1xuICAgICAgICAgICAgcXVlcnlSZXMgPSBqUXVlcnkocXVlcnkpOyAvL2hhcyBpbmZvIChjb3Vyc2UgJiBldmVudCksIGlkZW50aWZpZXJcbiAgICAgICAgICAgIC8valF1ZXJ5J3MgOmNvbnRhaW5zKCkgd2lsbCBtYXRjaCBlbGVtZW50cyB3aGVyZSBhc2dtdE5hbWUgaXMgYSBzdWJzdHJpbmcgb2YgdGhlIGFzZ210LiBlbHNlIGlmIGJlbG93IGhhbmRsZXMgb3ZlcmxhcHNcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5mb0VsO1xuICAgICAgICBpZiAocXVlcnlSZXMubGVuZ3RoID09PSAxKSAvL29ubHkgb25lIG1hdGNoaW5nIGVsZW1lbnRzIPCfkY1cbiAgICAgICAgICAgIGluZm9FbCA9IHF1ZXJ5UmVzWzBdO1xuICAgICAgICBlbHNlIGlmIChxdWVyeVJlcy5sZW5ndGggPj0gMikgeyAvLzIrIGNvbmZsaWN0aW5nIG1hdGNoZXMg8J+kjyBzbyBzbyAgKG5lZWRzIHByb2Nlc3NpbmcgdG8gZmluZCByaWdodCBlbGVtZW50KVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeVJlcy5sZW5ndGg7IGkrKykgeyAvL3Rlc3QgZm9yIGV2ZXJ5IGVsZW1lbnRcbiAgICAgICAgICAgICAgICBpZiAocXVlcnlSZXNbaV0uZmlyc3RDaGlsZC5ub2RlVmFsdWUgPT09IGFzZ210TmFtZSkgeyAvL2lmIGVsZW1lbnQncyBhc2dtdCB0aXRsZSBtYXRjaGVzIGFzZ210TmFtZSwgdGhhdCBpcyB0aGUgcmlnaHQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBpbmZvRWwgPSBxdWVyeVJlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvL3JldHVybnMgaWYgbm8gbWF0Y2hlcyDwn5GOXG4gICAgICAgICAgICBpZiAoIXRoaXMuaWdub3JlT2xkQXNnbXRzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgTm8gZWxlbWVudHMgbWF0Y2hlZCAke2FzZ210TmFtZX1gLCB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ySW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0QXNnbXRCeU5hbWVQYXRoRWw6IHRoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5UmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb0VsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAnVGhpcyBlcnJvciBtYXkgYmUgY2F1c2VkIGJ5IG9sZCBhc2dtdHMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbJ05vIG1hdGNoZXMnLCAnTm8gbWF0Y2hlcyddO1xuICAgICAgICB9XG4gICAgICAgIGxldCBibG9ja0VsID0gdGhpcy5pbmZvVG9CbG9ja0VsKGluZm9FbCk7IC8vYmxvY2sgKGhhcyBzdHlsZXMpXG4gICAgICAgIHJldHVybiBbaW5mb0VsLCBibG9ja0VsXTtcbiAgICB9XG4gICAgal9jaGVjayh7IC8vcG9seW1vcnBoaXNtIGFsbG93cyB0aGlzIGZ1bmN0aW9uIHRvIGJlIHNwZWNpYWxpemVkIGFtb25nIGVhY2ggU2Nob29sb2d5UGFnZSBzdWJjbGFzcy4gSG93ZXZlciwgaXQgaXMgY2FsbGVkIGZyb20gdGhpcyBTY2hvb2xvZ3lQYWdlXG4gICAgLy8gQmVsb3cgYXJlIHRoZSBjb252ZW50aW9uYWwgaW5wdXRzXG4gICAgYXNnbXRFbCwgZm9yY2VkU3RhdGUgPSBudWxsLCAvL2lmIG51bGwsIGpfY2hlY2sgdG9nZ2xlcy4gaWYgdHJ1ZS9mYWxzZSwgaXQgZm9yY2VzIGludG8gdGhhdCBzdGF0ZVxuICAgIG9wdGlvbnM6IHsgc3RvcmVJbkNocm9tZSA9IHRydWUsIGFuaW1hdGUgPSBmYWxzZSAvL3Nob3dzIGFuaW1hdGlvbiB3aGVuIGNoZWNraW5nXG4gICAgIH0gfSkgeyB9XG4gICAgLy9jcmVhdGVzIGhpZ2hsaWdodEdyZWVuRWwgd2l0aCBhbmltYXRlL25vIGFuaW1hdGVcbiAgICBjcmVhdGVHcmVlbkhpZ2hsaWdodEVsKHsgcGFnZVR5cGUsIGFuaW1hdGUgPSB0cnVlIH0pIHtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgaGlnaGxpZ2h0R3JlZW4uY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0LWdyZWVuJyk7XG4gICAgICAgIGhpZ2hsaWdodEdyZWVuLmNsYXNzTGlzdC5hZGQoYGhpZ2hsaWdodC1ncmVlbi0ke3BhZ2VUeXBlfWApO1xuICAgICAgICBoaWdobGlnaHRHcmVlbi5pbm5lckhUTUwgPSAvKiBoaWdobGlnaHQgYW5pbWFnZWQgc3ZnICovIGBcbiAgICAgICAgICAgIDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB2ZXJzaW9uPScxLjEnIHByZXNlcnZlQXNwZWN0UmF0aW89J25vbmUnIHZpZXdCb3g9JzAgMCAxMCAxMCdcbiAgICAgICAgICAgICAgICBzdHlsZT0nd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgdHJhbnNmb3JtOiBzY2FsZVgoLTEpJz5cbiAgICAgICAgICAgICAgICA8IS0tIERhcmsgR3JlZW4gQmFja2dyb3VuZCAtLT5cbiAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPSdyZ2IoMTE1LCAyNTIsIDEyNyknIGQ9J00gMTAgMCBMIDEwIDEwIEwgMCAxMCBMIDAgMCBaJyAvPlxuICAgICAgICAgICAgICAgIDwhLS0gU2xhc2ggQmV0d2VlbiBDZW50ZXIgLS0+XG4gICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSdncmVlbicgZD0nTSAwIDAgTCAxMCAxMCBaJz5cbiAgICAgICAgICAgICAgICAkeyAvL2lmIGFuaW1hdGUsIGFkZCBhbiBhbmltYXRpb24gdGFnIGluc2lkZSA8cGF0aD5cbiAgICAgICAgYW5pbWF0ZVxuICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgIGA8IS0tIEFuaW1hdGlvbiBub3RlczogYXQgc3RhcnQsIG5vIG1vdmVtZW50LiBncmFkdWFsbHkgZ2V0cyBmYXN0ZXIgYW5kIGZhc3RlciAtLT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU9J2QnXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXI9JzAuMnMnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRDb3VudD0nMSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcz0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuNyAwLjcgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTCA3LjI5IDcuMjkgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTCA3LjI5IDcuMjkgTCA4LjM5IDguMzkgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMIDAuOCAwLjggTCAxLjYgMS42IEwgMi41IDIuNSBMIDMuNCAzLjQgTCA0LjM1IDQuMzUgTCA1LjMxIDUuMzEgTCA2LjI5IDYuMjkgTCA3LjI5IDcuMjkgTCA4LjM5IDguMzkgTCAxMCAxMCBMJ1xuICAgICAgICAgICAgICAgICAgICAvPmAgOiAnJ31cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSdncmVlbicgZD0nTSAwIDAgTCAxMCAxMCBaJz5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgIGA7XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRHcmVlbjtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBTY2hvb2xvZ3lQYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjb2xsYXBzZU92ZXJkdWUoKSB7XG4gICAgY29uc3Qgb3ZlcmR1ZVdyYXBwZXJQYXRoID0gYGRpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXJgO1xuICAgIGxldCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgcmVhZHkgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXI+ZGl2LnVwY29taW5nLWxpc3QnKTtcbiAgICAgICAgaWYgKHJlYWR5KSB7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnc2V0dGluZ3MnLCAoeyBzZXR0aW5ncyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc2V0dGluZ3Mub3ZlcmR1ZUNvbGxhcHNlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBhc3luYyBmdW5jdGlvbiBzZXQobmV3VmFsKSB7XG4gICAgICAgICAgICBsZXQgb2xkU2V0dGluZ3MgPSBhd2FpdCBnZXQoKTtcbiAgICAgICAgICAgIGxldCBuZXdTZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIG9sZFNldHRpbmdzKTtcbiAgICAgICAgICAgIG5ld1NldHRpbmdzLm92ZXJkdWVDb2xsYXBzZWQgPSBuZXdWYWw7XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IG5ld1NldHRpbmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5pdGlhbFZhbCA9IGF3YWl0IGdldCgpO1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG92ZXJkdWVXcmFwcGVyUGF0aCArICc+aDMnKTtcbiAgICAgICAgY29uc3QgY29sbGFwc2VCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29sbGFwc2VCdG4uc3R5bGUubWFyZ2luTGVmdCA9ICc0cmVtJzsgLy9kaXN0YW5jZSBiZXR3ZWVuIHRleHRcbiAgICAgICAgY29sbGFwc2VCdG4uaW5uZXJUZXh0ID0gJ0hpZGUgT3ZlcmR1ZSBBc3NpZ25tZW50cyc7XG4gICAgICAgIGNvbGxhcHNlQnRuLmNsYXNzTGlzdC5hZGQoJ2pfYnV0dG9uJyk7XG4gICAgICAgIGNvbGxhcHNlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsID0gIShhd2FpdCBnZXQoKSk7IC8vb3Bwb3NpdGUgb2Ygb2xkVmFsXG4gICAgICAgICAgICByZXJlbmRlckNvbGxhcHNlQnRuKG5ld1ZhbCk7XG4gICAgICAgICAgICBzZXQobmV3VmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb2xsYXBzZUJ0bik7XG4gICAgICAgIHJlcmVuZGVyQ29sbGFwc2VCdG4oaW5pdGlhbFZhbCk7IC8vaW5pdGlhbCBjYWxsXG4gICAgICAgIGZ1bmN0aW9uIHJlcmVuZGVyQ29sbGFwc2VCdG4obmV3VmFsKSB7XG4gICAgICAgICAgICBjb25zdCBhc2dtdHNFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3ZlcmR1ZVdyYXBwZXJQYXRoICsgJz5kaXYudXBjb21pbmctbGlzdCcpO1xuICAgICAgICAgICAgYXNnbXRzRWwuY2xhc3NMaXN0LnRvZ2dsZSgnal9jb2xsYXBzZWQnLCBuZXdWYWwpOyAvL2NsYXNzIGlmIG5ld1ZhbFxuICAgICAgICAgICAgY29sbGFwc2VCdG4uaW5uZXJUZXh0ID0gbmV3VmFsID8gJ1Nob3cgT3ZlcmR1ZSBBc3NpZ25tZW50cycgOiAnSGlkZSBPdmVyZHVlIEFzc2lnbm1lbnRzJztcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IGNvbGxhcHNlT3ZlcmR1ZTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IENhbGVuZGFyUGFnZV8xID0gcmVxdWlyZShcIi4vcGFnZXMvQ2FsZW5kYXJQYWdlXCIpO1xuY29uc3QgSG9tZVBhZ2VfMSA9IHJlcXVpcmUoXCIuL3BhZ2VzL0hvbWVQYWdlXCIpO1xuY29uc3QgQ291cnNlUGFnZV8xID0gcmVxdWlyZShcIi4vcGFnZXMvQ291cnNlUGFnZVwiKTtcbi8vVGhpcyBzY3JpcHQgaXMgaW5qZWN0ZWQgaW50byBldmVyeSBwYWdlLlxuLy9GdW5jdGlvbnMgYXJlIGluIHNlcXVlbnRpYWwgb3JkZXJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZGV0ZXJtaW5lU2Nob29sb2d5UGFnZVR5cGUsIGZhbHNlKTsgLy93YWl0IGZvciBET00gZWxlbWVudHMgdG8gbG9hZFxuZnVuY3Rpb24gZXhlY3V0ZUFmdGVyRG9uZUxvYWRpbmcoY2FsbGJhY2ssIC8vZXhlY3V0ZWQgYWZ0ZXJcbmlzTG9hZGluZyA9ICgpID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51cGNvbWluZy1saXN0Pi5yZWZyZXNoLXdyYXBwZXIgaW1nW2FsdD1cIkxvYWRpbmdcIl0nKSAhPSBudWxsIC8vZGVmYXVsdCBpcyBpZiB0aGVyZSBpcyBubyBsb2FkaW5nIHN5bWJvbCBvbiB0aGUgcGFnZVxuKSB7XG4gICAgbGV0IGludGVydmFsSUQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChpc0xvYWRpbmcoKSkge1xuICAgICAgICAgICAgLy8gQ29udGludWUgd2FpdGluZ1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcuLi4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRCk7IC8vc3RvcCBpbnRlcnZhbFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMCk7XG59XG5mdW5jdGlvbiBkZXRlcm1pbmVTY2hvb2xvZ3lQYWdlVHlwZSgpIHtcbiAgICBqUXVlcnkubm9Db25mbGljdCgpOyAvL3NjaG9vbG9neSBhbHNvIGhhcyBpdHMgb3duIGpRdWVyeSwgc28gdXNlIGBqUXVlcnlgIGluc3RlYWQgb2YgYCRgIHRvIGF2b2lkIGNvbmZsaWN0XG4gICAgLy8gY29uc29sZS5sb2coJzEuIEV4dGVuc2lvbiBydW5uaW5nJyk7XG4gICAgLy9DYWxlbmRhclxuICAgIGNvbnN0IGhhc1NjaG9vbG9neVNjcmlwdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBzY3JpcHRbc3JjKj0nc2Nob29sb2d5LmNvbSddYCk7IC8vc2Nob29sb2d5IHBhZ2VcbiAgICBpZiAoaGFzU2Nob29sb2d5U2NyaXB0cykgeyAvL3NjaG9vbG9neSBwYWdlIChkZXRlcm1pbmUgd2hpY2ggb25lKVxuICAgICAgICBjb25zdCBoYXNDYWxlbmRhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmY2FsZW5kYXInKTsgLy9jYWxlbmRhciBwYWdlXG4gICAgICAgIGNvbnN0IHVybEhhc0NhbGVuZGFyID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCdjYWxlbmRhcicpO1xuICAgICAgICBpZiAoaGFzQ2FsZW5kYXIgJiYgdXJsSGFzQ2FsZW5kYXIpIHsgLy90eXBlIDE6IHNjaG9vbG9neSBjYWxlbmRhclxuICAgICAgICAgICAgd2FpdEZvckV2ZW50c0xvYWRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vTm90IGNhbGVuZGFyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGhhc0NvdXJzZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXFwvY291cnNlXFwvKFxcZCspXFwvLyk7XG4gICAgICAgICAgICBpZiAoaGFzQ291cnNlKSB7IC8vdHlwZSAyOiBjb3Vyc2UgbWF0ZXJpYWxzIHBhZ2VcbiAgICAgICAgICAgICAgICBsZXQgY291cnNlSWQgPSBoYXNDb3Vyc2VbMV07XG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFmdGVyRG9uZUxvYWRpbmcoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXcgQ291cnNlUGFnZV8xLmRlZmF1bHQoY291cnNlSWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCdob21lJykpIHsgLy90eXBlIDM6IHNjaG9vbG9neSBob21lIHBhZ2VcbiAgICAgICAgICAgICAgICBleGVjdXRlQWZ0ZXJEb25lTG9hZGluZygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBIb21lUGFnZV8xLmRlZmF1bHQoeyBjb250YWluZXJTZWxlY3RvcnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2LnVwY29taW5nLWV2ZW50cy13cmFwcGVyPmRpdi51cGNvbWluZy1saXN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2Lm92ZXJkdWUtc3VibWlzc2lvbnMtd3JhcHBlcj5kaXYudXBjb21pbmctbGlzdCcsIC8vb3ZlcmR1ZSBhc2dtdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIF0gfSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4gIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXI+ZGl2LnVwY29taW5nLWxpc3QnKSk7IC8vY2hlY2sgaWYgdXBjb21pbmcgbGlzdCBleGlzdHMsIG5vdCBpZiBsb2FkaW5nIGljb24gZG9lcyBub3QgZXhpc3RcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgeyAvL05vbi1zY2hvb2xvZ3ktcmVsYXRlZCBwYWdlXG4gICAgICAgICAgICAgICAgLy9wYXNzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLzxoMT4gQ0FMRU5EQVJcbi8vUmVzaXplIGV2ZW50IGxpc3RlbmVyXG5mdW5jdGlvbiB3YWl0Rm9yRXZlbnRzTG9hZGVkKCkge1xuICAgIGxldCBjaGVja0lmRXZlbnRzTG9hZGVkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgY2FsZW5kYXJFdmVudHNMb2FkZWQgPSBqUXVlcnkoJyNmY2FsZW5kYXI+ZGl2LmZjLWNvbnRlbnQ+ZGl2LmZjLXZpZXc+ZGl2JylbMF0uY2hpbGRyZW4ubGVuZ3RoID49IDM7IC8vbW9yZSB0aGFuIHRocmVlIGFzZ210cyBvbiBjYWxlbmRhciBpbmRpY2F0aW5nIGFzZ210cyBsb2FkZWRcbiAgICAgICAgaWYgKGNhbGVuZGFyRXZlbnRzTG9hZGVkKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGNoZWNrSWZFdmVudHNMb2FkZWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJzMuIEFkZCBjaGVja21hcmtzJyk7XG4gICAgICAgICAgICAvLyBTY2hvb2xvZ3lDYWxlbmRhclBhZ2UoKTtcbiAgICAgICAgICAgIG5ldyBDYWxlbmRhclBhZ2VfMS5kZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3RpbGwgd2FpdGluZyBmb3IgY2FsZW5kYXIgZXZlbnRzIHRvIGxvYWQnKTtcbiAgICAgICAgfVxuICAgIH0sIDIwMCk7XG59XG4vLyAqIENPTkZJR1xuLy8gY29uc3QgaG9tZXdvcmtDaGVja2VyU2Nob29sb2d5Q29uZmlnPXtcbi8vICAgICB2ZXJib3NlOiB0cnVlIC8vd2hldGhlciBvciBub3QgdG8gc2hvdyBjb25zb2xlIG1lc3NhZ2VzXG4vLyB9XG4vLyBcbi8vIDxNb2RpZnkgY29uc29sZS5sb2coKSBhbmQgY29uc29sZS5lcnJvcigpXG4vLyBsZXQgb2dDb25zb2xlTG9nPWNvbnNvbGUubG9nO1xuLy8gY29uc29sZS5sb2c9KC4uLmFyZ3MpPT57XG4vLyAgICAgaWYgKGhvbWV3b3JrQ2hlY2tlclNjaG9vbG9neUNvbmZpZy52ZXJib3NlKVxuLy8gICAgICAgICBvZ0NvbnNvbGVMb2coYOKTomAsIC4uLmFyZ3MpO1xuLy8gfTtcbi8vIGxldCBvZ0NvbnNvbGVFcnJvcj1jb25zb2xlLmVycm9yO1xuLy8gY29uc29sZS5lcnJvcj0oLi4uYXJncyk9Pntcbi8vICAgICBpZiAoaG9tZXdvcmtDaGVja2VyU2Nob29sb2d5Q29uZmlnLnZlcmJvc2UpXG4vLyAgICAgb2dDb25zb2xlRXJyb3IoYOKTomAsIC4uLmFyZ3MpO1xuLy8gfTtcbi8vIC8+XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=