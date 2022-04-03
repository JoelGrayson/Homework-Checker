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
        const containerPath = `#course-events .upcoming-list .upcoming-events .upcoming-list`;
        const courseName = (0, functions_1.removeSpaces)(document.querySelector('#center-top>.page-title').innerText); //grabs course title & removes space
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
            else if (limits.courses === '$all' && limits.time === 'future') { //not being used, potential if not prev asgmts
            }
            else if (limits.courses !== '$all' && limits.time === 'any') { //course page (all asgmts of course)
                const courseName = limits.courses; //single course string
                console.log(`Only checking asgmts of the course: ${courseName}`);
                const course = this.getCourse(courseName); //if course is undefined, it has not been created yet because there are no checked tasks
                console.log('m1', { course });
                if (course != undefined) { //if the course exists
                    for (let asgmt of course.checked) {
                        console.log('m2', { asgmt });
                        const [infoEl, blockEl] = this.getAsgmtByName(asgmt);
                        if (infoEl !== 'No matches' && blockEl !== 'No matches')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQSwyRkFBMkY7QUFDM0YsK0JBQStCO0FBQy9CLGtFQUFrRTtBQUNsRTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGtFQUFrRTtBQUNsRTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCLGlCQUFpQix1RkFBdUY7QUFDeEc7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0hBQWdIO0FBQ2hIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ob21ld29yay1jaGVja2VyLWFsdGVyLXBhZ2UvLi9zcmMvZnVuY3Rpb25zLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9DYWxlbmRhclBhZ2UudHMiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL3BhZ2VzL0NvdXJzZVBhZ2UudHMiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlLy4vc3JjL3BhZ2VzL0hvbWVQYWdlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9TY2hvb2xvZ3lQYWdlLnRzIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9wYWdlcy9jb2xsYXBzZU92ZXJkdWUudHMiLCJ3ZWJwYWNrOi8vaG9tZXdvcmstY2hlY2tlci1hbHRlci1wYWdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2hvbWV3b3JrLWNoZWNrZXItYWx0ZXItcGFnZS8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZW1vdmVTcGFjZXMgPSB2b2lkIDA7XG5mdW5jdGlvbiByZW1vdmVTcGFjZXMoaW5wdXQpIHtcbiAgICAvLyBEaWZmZXJlbnQgc3BhY2luZyBiZWxvdzpcbiAgICAvLyBcIkFsZ2VicmEgSUkgKEgpOiBBTEdFQlJBIElJIEggLSBHXCJcbiAgICAvLyBcIkFsZ2VicmEgSUkgKEgpIDogQUxHRUJSQSBJSSBIIC0gRyBcIlxuICAgIGxldCBzdHIgPSAnJztcbiAgICBmb3IgKGxldCBjaGFyYWN0ZXIgb2YgaW5wdXQpXG4gICAgICAgIGlmIChjaGFyYWN0ZXIgIT09ICcgJylcbiAgICAgICAgICAgIHN0ciArPSBjaGFyYWN0ZXI7XG4gICAgcmV0dXJuIHN0cjtcbn1cbmV4cG9ydHMucmVtb3ZlU3BhY2VzID0gcmVtb3ZlU3BhY2VzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBTY2hvb2xvZ3lQYWdlXzEgPSByZXF1aXJlKFwiLi9TY2hvb2xvZ3lQYWdlXCIpO1xuY2xhc3MgQ2FsZW5kYXJQYWdlIGV4dGVuZHMgU2Nob29sb2d5UGFnZV8xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBwYWdlVHlwZTogJ2NhbCcsXG4gICAgICAgICAgICBnZXRBc2dtdEJ5TmFtZVBhdGhFbDogJ3NwYW4uZmMtZXZlbnQtdGl0bGU+c3BhbicsXG4gICAgICAgICAgICBpbmZvVG9CbG9ja0VsOiBlbCA9PiBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgICAgIGNvdXJzZXM6ICckYWxsJyxcbiAgICAgICAgICAgICAgICB0aW1lOiAnYW55J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGRDaGVja21hcmtzKHtcbiAgICAgICAgICAgIGFzZ210RWxDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5mYy1ldmVudD5kaXYuZmMtZXZlbnQtaW5uZXInKS5wYXJlbnROb2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICBjdXN0b21NaWRkbGVTY3JpcHQ6IChjaGVja0VsLCBhc2dtdEVsKSA9PiB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KGNoZWNrRWwpLm9uKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvY2F0ZUVsVG9BcHBlbmRDaGVja21hcmtUbzogZWwgPT4gZWxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vV2hlbiBjaGFuZ2luZyBtb250aHMsIHJlbG9hZCBwYWdlXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4uZmMtYnV0dG9uLXByZXYnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlbG9hZFRvQ29ycmVjdE1vbnRoVVJMKTsgLy9wcmV2aW91cyBtb250aCBidXR0b25cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3Bhbi5mYy1idXR0b24tbmV4dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVsb2FkVG9Db3JyZWN0TW9udGhVUkwpOyAvL25leHQgbW9udGggYnV0dG9uXG4gICAgICAgIGZ1bmN0aW9uIHJlbG9hZFRvQ29ycmVjdE1vbnRoVVJMKCkge1xuICAgICAgICAgICAgY29uc3QgdGVtcEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZjLWhlYWRlci10aXRsZScpOyAvLyBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGxldCBlbFRleHQgPSB0ZW1wRWxbJ2lubmVyVGV4dCddO1xuICAgICAgICAgICAgbGV0IFttb250aE5hbWUsIHllYXJdID0gZWxUZXh0LnNwbGl0KCcgJyk7XG4gICAgICAgICAgICBsZXQgbW9udGg7XG4gICAgICAgICAgICBzd2l0Y2ggKG1vbnRoTmFtZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0phbnVhcnknOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwMSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0ZlYnJ1YXJ5JzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDInO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdNYXJjaCc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzAzJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQXByaWwnOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwNCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ01heSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA1JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnSnVuZSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA2JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnSnVseSc6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzA3JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQXVndXN0JzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMDgnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdTZXB0ZW1iZXInOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcwOSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ09jdG9iZXInOlxuICAgICAgICAgICAgICAgICAgICBtb250aCA9ICcxMCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ05vdmVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAnMTEnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdEZWNlbWJlcic6XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gJzEyJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogY29uc29sZS5lcnJvcignVW5rbm93biBtb250aD8nLCBtb250aE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGF0ZVVSTCA9IGAke3llYXJ9LSR7bW9udGh9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHsgZGF0ZVVSTCB9KTtcbiAgICAgICAgICAgIGNvbnN0IG9sZFBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC8oLipcXC8pXFxkezR9LVxcZHsyfS8pWzFdOyAvL3JlbW92ZXMgbGFzdCAjIyMjLSMjIHBhcnQgb2YgVVJMXG4gICAgICAgICAgICBjb25zdCBuZXdQYXRobmFtZSA9IGAke29sZFBhdGhuYW1lfSR7ZGF0ZVVSTH1gO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID0gbmV3UGF0aG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgLy9SZXZpdmVzIHdoZW4gY2hlY2ttYXJrcyBkaXNhcHBlYXIgZHVlIHRvIGFzZ210cyByZS1yZW5kZXIgKHN1Y2ggYXMgd2hlbiB3aW5kb3cgcmVzaXplZCBvciBhZGRlZCBhIHBlcnNvbmFsIGFzZ210KVxuICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qX2NoZWNrX2NhbCcpKSAvL2NoZWNrbWFya3MgZG9uJ3QgZXhpc3QgYW55bW9yZVxuICAgICAgICAgICAgICAgIG5ldyBDYWxlbmRhclBhZ2UoKTsgLy9yZXZpdmUgY2hlY2ttYXJrc1xuICAgICAgICAgICAgLy9hbHRlcm5hdGl2ZTogd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIH0sIDMwMCk7XG4gICAgfVxuICAgIGNoZWNrQWxsQXNnbXRzKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50c0J5RGF0ZSA9IGpRdWVyeShgc3BhbltjbGFzcyo9J2RheS0nXWApO1xuICAgICAgICBmb3IgKGxldCBlbCBvZiBlbGVtZW50c0J5RGF0ZSkge1xuICAgICAgICAgICAgbGV0IGFzZ210RWwgPSBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIGlmIChhc2dtdEVsICE9IG51bGwpXG4gICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgYXNnbXRFbCxcbiAgICAgICAgICAgICAgICAgICAgZm9yY2VkU3RhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAvL2ZvcmNlZFN0YXRlIGlzIHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0FsbEFzZ210c0JlZm9yZVRvZGF5KCkge1xuICAgICAgICBjb25zdCBlbGVtZW50c0J5RGF0ZSA9IGpRdWVyeShgc3BhbltjbGFzcyo9J2RheS0nXWApO1xuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCkuZ2V0RGF0ZSgpO1xuICAgICAgICBmb3IgKGxldCBlbCBvZiBlbGVtZW50c0J5RGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZGF5T2ZFbCA9IHBhcnNlSW50KGVsLmNsYXNzTmFtZS5zbGljZSgtMikpO1xuICAgICAgICAgICAgY29uc3QgYmVmb3JlVG9kYXkgPSBkYXlPZkVsIDwgdG9kYXk7XG4gICAgICAgICAgICBpZiAoYmVmb3JlVG9kYXkpIHsgLy9iZWZvcmUgdG9kYXlcbiAgICAgICAgICAgICAgICBjb25zdCBhc2dtdEVsID0gZWwucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGFzZ210RWwgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzZ210RWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZWRTdGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUluQ2hyb21lOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGpfY2hlY2soeyBhc2dtdEVsLCBmb3JjZWRTdGF0ZSA9IG51bGwsIG9wdGlvbnM6IHsgc3RvcmVJbkNocm9tZSA9IHRydWUsIGFuaW1hdGUgPSBmYWxzZSAvL3Nob3dzIGFuaW1hdGlvbiB3aGVuIGNoZWNraW5nXG4gICAgIH0gfSkge1xuICAgICAgICAvL3N0b3JlSW5DaHJvbWUgaW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHRvIHNlbmQgcmVxdWVzdCB0byBzdG9yZSBpbiBjaHJvbWUuIGlzIGZhbHNlIHdoZW4gZXh0ZW5zaW9uIGluaXRpYWxpemluZyAmIGNoZWNraW5nIG9mZiBwcmlvciBhc2dtdHMgZnJvbSBzdG9yYWdlLiBpcyB0cnVlIGFsbCBvdGhlciB0aW1lc1xuICAgICAgICBjb25zdCBwSGlnaGxpZ2h0ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LWdyZWVuJyk7IC8vYmFzZWQgb24gaXRlbSBpbnNpZGUgYXNnbXRcbiAgICAgICAgY29uc3QgY2hlY2ttYXJrRWwgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0LmpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWApO1xuICAgICAgICBjb25zdCBhc2dtdFRleHQgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5mYy1ldmVudC1pbm5lcj4uZmMtZXZlbnQtdGl0bGU+c3BhbicpLmZpcnN0Q2hpbGQubm9kZVZhbHVlOyAvL29ubHkgdmFsdWUgb2YgYXNnbXQgKGZpcnN0Q2hpbGQpLCBub3QgaW5jbHVkaW5nIGluc2lkZSBncmFuZGNoaWxkcmVuIGxpa2UgaW5uZXJUZXh0KClcbiAgICAgICAgY29uc3QgY291cnNlTmFtZSA9IGFzZ210RWwucXVlcnlTZWxlY3RvcihgLmZjLWV2ZW50LWlubmVyPi5mYy1ldmVudC10aXRsZSBzcGFuW2NsYXNzKj0ncmVhbG0tdGl0bGUnXWApLmlubmVyVGV4dDsgLyogbW9zdCBjaGlsZCBzcGFuIGNhbiBoYXZlIGNsYXNzIG9mIHJlYWxtLXRpdGxlLXVzZXIgb3IgcmVhbG0tdGl0bGUtY291cnNlIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IGl0IGlzIGEgcGVyc29uYWwgZXZlbnQgKi9cbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBmb3JjZWRTdGF0ZSAhPT0gbnVsbCAmJiBmb3JjZWRTdGF0ZSAhPT0gdm9pZCAwID8gZm9yY2VkU3RhdGUgOiBwSGlnaGxpZ2h0ID09IG51bGw7IC8vaWYgdXNlciBmb3JjZWQgc3RhdGUsIG92ZXJyaWRlIG5ld0hpZ2hsaWdodFxuICAgICAgICBpZiAobmV3U3RhdGUpIHsgLy9ubyBoaWdobGlnaHQgZ3JlZW4gYWxyZWFkeVxuICAgICAgICAgICAgY29uc29sZS5sb2coYENoZWNraW5nICR7YXNnbXRUZXh0fWApO1xuICAgICAgICAgICAgLy9DaGVja1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoaWdobGlnaHRHcmVlbkVsID0gdGhpcy5jcmVhdGVHcmVlbkhpZ2hsaWdodEVsKHsgcGFnZVR5cGU6IHRoaXMucGFnZVR5cGUsIGFuaW1hdGUgfSk7XG4gICAgICAgICAgICBhc2dtdEVsLmluc2VydEJlZm9yZShoaWdobGlnaHRHcmVlbkVsLCBhc2dtdEVsLmZpcnN0Q2hpbGQpOyAvL2luc2VydCBhcyBmaXJzdCBlbGVtZW50IChiZWZvcmUgZmlyc3RFbGVtZW50KVxuICAgICAgICAgICAgaWYgKHN0b3JlSW5DaHJvbWUpXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdFRleHQsIHsgY3JlYXRlQ291cnNlSWZOb3RFeGlzdDogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmNoZWNraW5nICR7YXNnbXRUZXh0fWApO1xuICAgICAgICAgICAgLy9VbmNoZWNrXG4gICAgICAgICAgICBjaGVja21hcmtFbC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBhc2dtdEVsLnJlbW92ZUNoaWxkKHBIaWdobGlnaHQpO1xuICAgICAgICAgICAgLy8gY291cnNlc0dsb2JhbC5wb3AoY291cnNlc0dsb2JhbC5pbmRleE9mKGFzZ210VGV4dCkpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdFRleHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ2FsZW5kYXJQYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBTY2hvb2xvZ3lQYWdlXzEgPSByZXF1aXJlKFwiLi9TY2hvb2xvZ3lQYWdlXCIpO1xuY29uc3QgZnVuY3Rpb25zXzEgPSByZXF1aXJlKFwiLi4vZnVuY3Rpb25zXCIpO1xuY2xhc3MgQ291cnNlUGFnZSBleHRlbmRzIFNjaG9vbG9neVBhZ2VfMS5kZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihjb3Vyc2VJZCkge1xuICAgICAgICBjb25zdCBjb250YWluZXJQYXRoID0gYCNjb3Vyc2UtZXZlbnRzIC51cGNvbWluZy1saXN0IC51cGNvbWluZy1ldmVudHMgLnVwY29taW5nLWxpc3RgO1xuICAgICAgICBjb25zdCBjb3Vyc2VOYW1lID0gKDAsIGZ1bmN0aW9uc18xLnJlbW92ZVNwYWNlcykoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NlbnRlci10b3A+LnBhZ2UtdGl0bGUnKS5pbm5lclRleHQpOyAvL2dyYWJzIGNvdXJzZSB0aXRsZSAmIHJlbW92ZXMgc3BhY2VcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgcGFnZVR5cGU6ICdjb3Vyc2UnLFxuICAgICAgICAgICAgZ2V0QXNnbXRCeU5hbWVQYXRoRWw6IGAke2NvbnRhaW5lclBhdGh9PmRpdltkYXRhLXN0YXJ0XWAsXG4gICAgICAgICAgICBpbmZvVG9CbG9ja0VsOiBlbCA9PiBlbCxcbiAgICAgICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgICAgIGNvdXJzZXM6IGNvdXJzZU5hbWUsXG4gICAgICAgICAgICAgICAgdGltZTogJ2FueSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY291cnNlSWQgPSBjb3Vyc2VJZDtcbiAgICAgICAgdGhpcy5jb3Vyc2VOYW1lID0gY291cnNlTmFtZTtcbiAgICAgICAgdGhpcy5hZGRDaGVja21hcmtzKHtcbiAgICAgICAgICAgIGFzZ210RWxDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyUGF0aCksXG4gICAgICAgICAgICBjdXN0b21NaWRkbGVTY3JpcHQ6IChjaGVja0VsLCBhc2dtdEVsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGFzZ210RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlLWhlYWRlcicpKSAvL2RvZXMgbm90IGFkZCBjaGVjayB0byAuZGF0ZS1oZWFkZXIgYnkgY29udGludWU7aW5nIG91dCBvZiBsb29wXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnY29udGludWUnO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvY2F0ZUVsVG9BcHBlbmRDaGVja21hcmtUbzogZWwgPT4gZWwuZmlyc3RDaGlsZFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgal9jaGVjayh7IGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgb3B0aW9uczogeyBzdG9yZUluQ2hyb21lID0gdHJ1ZSwgYW5pbWF0ZSA9IGZhbHNlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgfSB9KSB7XG4gICAgICAgIGNvbnN0IHBIaWdobGlnaHQgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTsgLy9iYXNlZCBvbiBjbGFzc0xpc3Qgb2YgYXNnbXRFbFxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGZvcmNlZFN0YXRlICE9PSBudWxsICYmIGZvcmNlZFN0YXRlICE9PSB2b2lkIDAgPyBmb3JjZWRTdGF0ZSA6ICFwSGlnaGxpZ2h0OyAvL29wcG9zaXRlIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgY29uc3QgY2hlY2ttYXJrRWwgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0LmpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWApO1xuICAgICAgICBjb25zdCBhc2dtdFRleHQgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKS5pbm5lclRleHQ7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgbmV3SGlnaGxpZ2h0OiBuZXdTdGF0ZSwgcEhpZ2hsaWdodCwgY2hlY2ttYXJrRWwgfSk7XG4gICAgICAgIGlmIChuZXdTdGF0ZSkgeyAvL25vIGhpZ2hsaWdodCBncmVlbiBhbHJlYWR5LCBzbyBjaGVja1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENoZWNraW5nICR7YXNnbXRUZXh0fWApO1xuICAgICAgICAgICAgLy9DaGVja1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBoaWdobGlnaHRHcmVlbkVsID0gdGhpcy5jcmVhdGVHcmVlbkhpZ2hsaWdodEVsKHsgcGFnZVR5cGU6IHRoaXMucGFnZVR5cGUsIGFuaW1hdGUgfSk7XG4gICAgICAgICAgICBhc2dtdEVsLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJzsgLy9mb3IgZ3JlZW4gcmVjdCB0byBiZSBib3VuZCB0byBhc2dtdEVsXG4gICAgICAgICAgICBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJ2g0Jykuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnOyAvL3NvIHRoYXQgdGV4dCBhYm92ZSBjaGVja21hcmtcbiAgICAgICAgICAgIGFzZ210RWwuaW5zZXJ0QmVmb3JlKGhpZ2hsaWdodEdyZWVuRWwsIGFzZ210RWwuZmlyc3RDaGlsZCk7IC8vaW5zZXJ0IGFzIGZpcnN0IGVsZW1lbnQgKGJlZm9yZSBmaXJzdENoaWxkKVxuICAgICAgICAgICAgaWYgKHN0b3JlSW5DaHJvbWUpXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRBc2dtdCh0aGlzLmNvdXJzZU5hbWUsIGFzZ210VGV4dCwgeyBjcmVhdGVDb3Vyc2VJZk5vdEV4aXN0OiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvL3VuY2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmNoZWNraW5nICR7YXNnbXRUZXh0fWApO1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgdG9SZW1vdmUgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTtcbiAgICAgICAgICAgIHRvUmVtb3ZlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodG9SZW1vdmUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFzZ210KHRoaXMuY291cnNlTmFtZSwgYXNnbXRUZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXNnbXQodGhpcy5jb3Vyc2VOYW1lLCBhc2dtdFRleHQpO1xuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ291cnNlUGFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgU2Nob29sb2d5UGFnZV8xID0gcmVxdWlyZShcIi4vU2Nob29sb2d5UGFnZVwiKTtcbmNvbnN0IGNvbGxhcHNlT3ZlcmR1ZV8xID0gcmVxdWlyZShcIi4vY29sbGFwc2VPdmVyZHVlXCIpO1xuY2xhc3MgSG9tZVBhZ2UgZXh0ZW5kcyBTY2hvb2xvZ3lQYWdlXzEuZGVmYXVsdCB7XG4gICAgY29uc3RydWN0b3IoeyBjb250YWluZXJTZWxlY3RvcnMgfSkge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBwYWdlVHlwZTogJ2hvbWUnLFxuICAgICAgICAgICAgZ2V0QXNnbXRCeU5hbWVQYXRoRWw6IGNvbnRhaW5lclNlbGVjdG9ycy5tYXAocyA9PiBgJHtzfT5kaXZgKSxcbiAgICAgICAgICAgIGluZm9Ub0Jsb2NrRWw6IGVsID0+IGVsLFxuICAgICAgICAgICAgbGltaXRzOiB7XG4gICAgICAgICAgICAgICAgY291cnNlczogJyRhbGwnLFxuICAgICAgICAgICAgICAgIHRpbWU6ICdhbnknXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbXVsdGlwbGVBc2dtdENvbnRhaW5lcnM6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgICgwLCBjb2xsYXBzZU92ZXJkdWVfMS5kZWZhdWx0KSgpO1xuICAgICAgICBmb3IgKGxldCBjb250YWluZXJTZWxlY3RvciBvZiBjb250YWluZXJTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IGBoND5zcGFuYDtcbiAgICAgICAgICAgIGxldCBjb250YWluZXJDbGFzcyA9ICdqX2NoZWNrX2NvbnRhaW5lcic7XG4gICAgICAgICAgICB0aGlzLmFkZENoZWNrbWFya3Moe1xuICAgICAgICAgICAgICAgIGFzZ210RWxDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpLFxuICAgICAgICAgICAgICAgIGN1c3RvbU1pZGRsZVNjcmlwdDogKGNoZWNrRWwsIGFzZ210RWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzZ210RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlLWhlYWRlcicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdjb250aW51ZSc7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgeyAvL3ZhbGlkIGFzc2lnbm1tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgakNoZWNrQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgakNoZWNrQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoY29udGFpbmVyQ2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudE5vZGUgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoakNoZWNrQ29udGFpbmVyLCBwYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4udXBjb21pbmctdGltZScpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvOiBlbCA9PiBlbC5xdWVyeVNlbGVjdG9yKGAke3NlbGVjdG9yfSBzcGFuLiR7Y29udGFpbmVyQ2xhc3N9YCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBqX2NoZWNrKHsgYXNnbXRFbCwgZm9yY2VkU3RhdGUgPSBudWxsLCBvcHRpb25zOiB7IHN0b3JlSW5DaHJvbWUgPSB0cnVlLCBhbmltYXRlID0gZmFsc2UgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICB9IH0pIHtcbiAgICAgICAgY29uc29sZS5sb2coeyBhc2dtdEVsIH0pO1xuICAgICAgICBjb25zdCBwSGlnaGxpZ2h0ID0gISFhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTsgLy9iYXNlZCBvbiBjbGFzc0xpc3Qgb2YgYXNnbXRFbFxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGZvcmNlZFN0YXRlICE9PSBudWxsICYmIGZvcmNlZFN0YXRlICE9PSB2b2lkIDAgPyBmb3JjZWRTdGF0ZSA6ICFwSGlnaGxpZ2h0OyAvL29wcG9zaXRlIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgY29uc3QgY2hlY2ttYXJrRWwgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0LmpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWApO1xuICAgICAgICBjb25zdCB0ZW1wQW5jaG9yID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdhJyk7XG4gICAgICAgIGNvbnN0IGFzZ210VGV4dCA9IHRlbXBBbmNob3IuaW5uZXJUZXh0O1xuICAgICAgICBjb25zdCBjb3Vyc2VOYW1lID0gKGFzZ210RWwucXVlcnlTZWxlY3RvcignaDQ+c3BhbicpLmFyaWFMYWJlbCk7IC8vbmFtZSBvZiBjb3Vyc2UgYmFzZWQgb24gYXJpYS1sYWJlbCBvZiBhc2dtdEVsJ3MgPGg0PidzIDxzcGFuPidzIDxkaXY+XG4gICAgICAgIC8vIGRpZmZlcnMgZnJvbSBjb3Vyc2VOYW1lIG9uIGNhbGVuZGFyLCBzbyB1c2Ugc3BhY2UtbGVzcyB2ZXJzaW9uIGZvciBjb21wYXJpc29uXG4gICAgICAgIGlmIChuZXdTdGF0ZSkgeyAvL2NoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgJyR7YXNnbXRUZXh0fSdgKTtcbiAgICAgICAgICAgIGNoZWNrbWFya0VsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0R3JlZW5FbCA9IHRoaXMuY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlOiB0aGlzLnBhZ2VUeXBlLCBhbmltYXRlIH0pO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoNCcpO1xuICAgICAgICAgICAgYXNnbXRFbC5xdWVyeVNlbGVjdG9yKCdoND5zcGFuJykuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnOyAvL3NvIHRoYXQgdGV4dCBhYm92ZSBjaGVja21hcmtcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaGlnaGxpZ2h0R3JlZW5FbCwgcGFyZW50LmZpcnN0Q2hpbGQpOyAvL2luc2VydCBhcyBmaXJzdCBlbGVtZW50IChiZWZvcmUgZmlyc3RFbGVtZW50KVxuICAgICAgICAgICAgaWYgKHN0b3JlSW5DaHJvbWUpXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdFRleHQsIHsgY3JlYXRlQ291cnNlSWZOb3RFeGlzdDogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy91bmNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5jaGVja2luZyAnJHthc2dtdFRleHR9J2ApO1xuICAgICAgICAgICAgY2hlY2ttYXJrRWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgdG9SZW1vdmUgPSBhc2dtdEVsLnF1ZXJ5U2VsZWN0b3IoJy5oaWdobGlnaHQtZ3JlZW4nKTtcbiAgICAgICAgICAgIHRvUmVtb3ZlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodG9SZW1vdmUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFzZ210KGNvdXJzZU5hbWUsIGFzZ210VGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFzZ210KGNvdXJzZU5hbWUsIGFzZ210VGV4dCk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBIb21lUGFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJqcXVlcnlcIi8+XG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cImNocm9tZVwiLz5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGZ1bmN0aW9uc18xID0gcmVxdWlyZShcIi4uL2Z1bmN0aW9uc1wiKTtcbmNsYXNzIFNjaG9vbG9neVBhZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHsgcGFnZVR5cGUsIGdldEFzZ210QnlOYW1lUGF0aEVsLCBpbmZvVG9CbG9ja0VsLCBsaW1pdHMsIGlnbm9yZU9sZEFzZ210cyA9IHRydWUsIG11bHRpcGxlQXNnbXRDb250YWluZXJzID0gZmFsc2UgfSkge1xuICAgICAgICBjb25zb2xlLmxvZyh7IHBhZ2VUeXBlLCBnZXRBc2dtdEJ5TmFtZVBhdGhFbCwgaW5mb1RvQmxvY2tFbCwgbGltaXRzLCBpZ25vcmVPbGRBc2dtdHMsIG11bHRpcGxlQXNnbXRDb250YWluZXJzIH0pO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnc2V0dGluZ3MnLCAoeyBzZXR0aW5ncyB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2hvd0NoZWNrbWFya3MgPT09ICdvbkhvdmVyJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPbmx5IHNob3cgY2hlY2ttYXJrIG9uIGhvdmVyJyk7XG4gICAgICAgICAgICAgICAgLy9Mb2FkIHN0eWxlIGlmIG9ubHlTaG93Q2hlY2ttYXJrT25Ib3ZlclxuICAgICAgICAgICAgICAgIGxldCBzdHlsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgICAgICBzdHlsZUVsLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICAgICAgLmpfY2hlY2tfY2FsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjsgLyogYWxsIGlucHV0IGNoZWNrcyBoaWRkZW4gKi9cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuZmMtZXZlbnQ6aG92ZXIgLmpfY2hlY2tfY2FsIHsgLyogaW5wdXQgY2hlY2sgc2hvd24gb25ob3ZlciBvZiBhc2dtdCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFnZVR5cGUgPSBwYWdlVHlwZTsgLy9pbmRpY2F0ZXMgY3NzIGNsYXNzIGZvciBjaGVja2JveFxuICAgICAgICB0aGlzLm11bHRpcGxlQXNnbXRDb250YWluZXJzID0gbXVsdGlwbGVBc2dtdENvbnRhaW5lcnM7XG4gICAgICAgIHRoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWwgPSBnZXRBc2dtdEJ5TmFtZVBhdGhFbDsgLy9mcm9tIHdoZXJlIHRvIHNlYXJjaCA6Y29udGFpbnMoKSBvZiBhbiBhc2dtdCBieSBuYW1lXG4gICAgICAgIHRoaXMuaW5mb1RvQmxvY2tFbCA9IGluZm9Ub0Jsb2NrRWw7XG4gICAgICAgIHRoaXMuaWdub3JlT2xkQXNnbXRzID0gaWdub3JlT2xkQXNnbXRzO1xuICAgICAgICAvKntcbiAgICAgICAgICAgIGNvdXJzZXMsIC8vJyRhbGwnIHwgU3RyaW5nIG9mIGNvdXJzZSBuYW1lXG4gICAgICAgICAgICB0aW1lIC8vJ2FueScgfCAnZnV0dXJlJ1xuICAgICAgICB9Ki9cbiAgICAgICAgLy9saXN0ZW5zIGZvciBgcnVuICRjbWRgIG1lc3NhZ2UgZnJvbSBwb3B1cC5qc1xuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1zZywgc2VuZGVyLCByZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG1zZy5oYXNPd25Qcm9wZXJ0eSgncnVuJykpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1zZy5ydW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVsb2FkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrIGFsbCBhc2dtdHMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0FsbEFzZ210cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrIGFsbCBhc2dtdHMgYmVmb3JlIHRvZGF5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tBbGxBc2dtdHNCZWZvcmVUb2RheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmtub3duIHJ1biBtZXNzYWdlOicsIG1zZy5ydW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9TZXRzIHRoaXMuY291cnNlc0dsb2JhbCB0byBjaHJvbWUgc3RvcmFnZVxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnY291cnNlcycsICh7IGNvdXJzZXMgfSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsID0gY291cnNlcztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3Vyc2VzJywgY291cnNlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsaW1pdHMpOyAvL3RpbWUgJiBjb3Vyc2UgbGltaXRzIHdoZW4gZ2V0dGluZyBhc2dtdHNcbiAgICAgICAgICAgIGlmIChsaW1pdHMuY291cnNlcyA9PT0gJyRhbGwnICYmIGxpbWl0cy50aW1lID09PSAnYW55JykgeyAvL2NhbGVuZGFyIG9yIGhvbWUgcGFnZVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNvdXJzZSBvZiBjb3Vyc2VzKSB7IC8vVE9ETzogY2hhbmdlIHNjaGVtYVxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tlZCA9IGNvdXJzZS5jaGVja2VkOyAvL2FzZ210c1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhc2dtdEVsIG9mIGNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5mb0VsLCBibG9ja0VsXSA9IHRoaXMuZ2V0QXNnbXRCeU5hbWUoYXNnbXRFbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mb0VsICE9PSAnTm8gbWF0Y2hlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNnbXRFbDogYmxvY2tFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxpbWl0cy5jb3Vyc2VzID09PSAnJGFsbCcgJiYgbGltaXRzLnRpbWUgPT09ICdmdXR1cmUnKSB7IC8vbm90IGJlaW5nIHVzZWQsIHBvdGVudGlhbCBpZiBub3QgcHJldiBhc2dtdHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxpbWl0cy5jb3Vyc2VzICE9PSAnJGFsbCcgJiYgbGltaXRzLnRpbWUgPT09ICdhbnknKSB7IC8vY291cnNlIHBhZ2UgKGFsbCBhc2dtdHMgb2YgY291cnNlKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvdXJzZU5hbWUgPSBsaW1pdHMuY291cnNlczsgLy9zaW5nbGUgY291cnNlIHN0cmluZ1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbmx5IGNoZWNraW5nIGFzZ210cyBvZiB0aGUgY291cnNlOiAke2NvdXJzZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY291cnNlID0gdGhpcy5nZXRDb3Vyc2UoY291cnNlTmFtZSk7IC8vaWYgY291cnNlIGlzIHVuZGVmaW5lZCwgaXQgaGFzIG5vdCBiZWVuIGNyZWF0ZWQgeWV0IGJlY2F1c2UgdGhlcmUgYXJlIG5vIGNoZWNrZWQgdGFza3NcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbTEnLCB7IGNvdXJzZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAoY291cnNlICE9IHVuZGVmaW5lZCkgeyAvL2lmIHRoZSBjb3Vyc2UgZXhpc3RzXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGFzZ210IG9mIGNvdXJzZS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbTInLCB7IGFzZ210IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW2luZm9FbCwgYmxvY2tFbF0gPSB0aGlzLmdldEFzZ210QnlOYW1lKGFzZ210KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvRWwgIT09ICdObyBtYXRjaGVzJyAmJiBibG9ja0VsICE9PSAnTm8gbWF0Y2hlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qX2NoZWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNnbXRFbDogYmxvY2tFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmVJbkNocm9tZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2hlY2tBbGxBc2dtdHMoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBjaGVja0FsbEFzZ210c0JlZm9yZVRvZGF5KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgLy8qIDxtZXRob2RzIHRvIGludGVyYWN0IHdpdGggdGhpcy5jb3Vyc2VHbG9iYWxcbiAgICBnZXRDb3Vyc2UobmFtZSwgb3B0aW9ucyA9IHsgbm9TcGFjZXNOYW1lOiB0cnVlIH0pIHtcbiAgICAgICAgaWYgKG9wdGlvbnMubm9TcGFjZXNOYW1lKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY291cnNlc0dsb2JhbC5maW5kKGNvdXJzZSA9PiAoMCwgZnVuY3Rpb25zXzEucmVtb3ZlU3BhY2VzKShjb3Vyc2UubmFtZSkgPT09ICgwLCBmdW5jdGlvbnNfMS5yZW1vdmVTcGFjZXMpKG5hbWUpKTsgLy9jb21wYXJlIHNwYWNlLWxlc3MgbmFtZXNcbiAgICAgICAgcmV0dXJuIHRoaXMuY291cnNlc0dsb2JhbC5maW5kKGNvdXJzZSA9PiBjb3Vyc2UubmFtZSA9PT0gbmFtZSk7XG4gICAgfVxuICAgIGNyZWF0ZUNvdXJzZShjb3Vyc2UsIG9wdGlvbnMgPSB7IHNhdmU6IHRydWUgfSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgY291cnNlJywgY291cnNlKTtcbiAgICAgICAgdGhpcy5jb3Vyc2VzR2xvYmFsLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogY291cnNlLFxuICAgICAgICAgICAgbm9TcGFjZXNOYW1lOiAoMCwgZnVuY3Rpb25zXzEucmVtb3ZlU3BhY2VzKShjb3Vyc2UpLFxuICAgICAgICAgICAgY2hlY2tlZDogW11cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcHRpb25zLnNhdmUpIC8vc2F2ZSB1bmxlc3Mgc3BlY2lmaWVkIHRvIG5vdCBzYXZlXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNvdXJzZXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGNvdXJzZSBuYW1lXG4gICAgICogQHJldHVybnMgY291cnNlIG5hbWVcbiAgICAqL1xuICAgIGRlbGV0ZUNvdXJzZShuYW1lKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvdXJzZXNHbG9iYWxbdGhpcy5jb3Vyc2VzR2xvYmFsLmZpbmRJbmRleChjb3Vyc2UgPT4gY291cnNlLm5hbWUgPT09IG5hbWUpIC8vZ2V0IGluZGV4XG4gICAgICAgIF07XG4gICAgICAgIHRoaXMudXBkYXRlQ291cnNlcygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gY291cnNlIGNvdXJzZSBuYW1lXG4gICAgICogQHBhcmFtIGFzZ210IGFzc2lnbm1lbnQgbmFtZVxuICAgICAqL1xuICAgIGFkZEFzZ210KGNvdXJzZSwgYXNnbXQsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgKF9hID0gb3B0aW9ucy5jcmVhdGVDb3Vyc2VJZk5vdEV4aXN0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAob3B0aW9ucy5jcmVhdGVDb3Vyc2VJZk5vdEV4aXN0ID0gZmFsc2UpO1xuICAgICAgICAoX2IgPSBvcHRpb25zLm5vU3BhY2VzTmFtZSkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogKG9wdGlvbnMubm9TcGFjZXNOYW1lID0gdHJ1ZSk7XG4gICAgICAgIGlmIChvcHRpb25zLmNyZWF0ZUNvdXJzZUlmTm90RXhpc3QgJiYgdGhpcy5nZXRDb3Vyc2UoY291cnNlKSA9PT0gdW5kZWZpbmVkKSAvL2NyZWF0ZSBjb3Vyc2UgaWYgbm90IGV4aXN0c1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb3Vyc2UoY291cnNlLCB7IHNhdmU6IGZhbHNlIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyh7IG5vU3BhY2VzTmFtZTogb3B0aW9ucy5ub1NwYWNlc05hbWUgfSk7XG4gICAgICAgIHRoaXMuZ2V0Q291cnNlKGNvdXJzZSwgeyBub1NwYWNlc05hbWU6IG9wdGlvbnMubm9TcGFjZXNOYW1lIH0pLmNoZWNrZWQucHVzaChhc2dtdCk7XG4gICAgICAgIHRoaXMudXBkYXRlQ291cnNlcygpO1xuICAgIH1cbiAgICByZW1vdmVBc2dtdChjb3Vyc2VOYW1lLCBhc2dtdCkge1xuICAgICAgICB0aGlzLmdldENvdXJzZShjb3Vyc2VOYW1lKS5jaGVja2VkID0gdGhpcy5nZXRDb3Vyc2UoY291cnNlTmFtZSkuY2hlY2tlZC5maWx0ZXIoaXRlbSA9PiAoaXRlbSAhPT0gYXNnbXQpKTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3Vyc2VzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXNnbXQ7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGNocm9tZSdzIHN0b3JhZ2Ugd2l0aCBjaGVja2VkIHRhc2tzIHBhcmFtZXRlclxuICAgICAqIEByZXR1cm5zIFByb21pc2UgYm9vbGVhbiBzdWNjZWVkZWQ/XG4gICAgICogKi9cbiAgICB1cGRhdGVDb3Vyc2VzKG5ld0NvdXJzZXMpIHtcbiAgICAgICAgbmV3Q291cnNlcyA9IG5ld0NvdXJzZXMgIT09IG51bGwgJiYgbmV3Q291cnNlcyAhPT0gdm9pZCAwID8gbmV3Q291cnNlcyA6IHRoaXMuY291cnNlc0dsb2JhbDsgLy9kZWZhdWx0IGlzIHRoaXMuY291cnNlc0dsb2JhbFxuICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5zdHJpbmdpZnkoeyBjb3Vyc2VzOiBuZXdDb3Vyc2VzIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHJ1bjogJ3VwZGF0ZSBjaHJvbWUgc3RvcmFnZScsXG4gICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgfSwgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTsgLy9zdWNjZWVkZWQgb3Igbm90XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vKiA+XG4gICAgYWRkQ2hlY2ttYXJrcyh7IC8vY2FsbGVkIGluIHN1YmNsYXNzJyBjb25zdHJ1Y3RvciwgYWRkcyBjaGVja21hcmtzIHRvIGVhY2ggYXNnbXQgZm9yIGNsaWNraW5nOyBjaGVja3MgdGhvc2UgY2hlY2ttYXJrcyBiYXNlZCBvbiBjaHJvbWUgc3RvcmFnZVxuICAgIGFzZ210RWxDb250YWluZXIsIC8vd2hlcmUgdGhlIGFzZ210cyBhcmUgbG9jYXRlZFxuICAgIGN1c3RvbU1pZGRsZVNjcmlwdCwgLy9hbm9ueW1vdXMgZnVuYyBleGVjdXRlZCBpbiB0aGUgbWlkZGxlXG4gICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvIC8vZGV0ZXJtaW5lcyBob3cgdG8gYWRkIGNoaWxkcmVuIGVscyBpZSBlbD0+ZWwucGFyZW50Tm9kZVxuICAgICB9KSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGFzZ210RWxDb250YWluZXIuY2hpbGRyZW47XG4gICAgICAgIGZvciAobGV0IGFzZ210RWwgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGxldCBjaGVja0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGNoZWNrRWwuY2xhc3NOYW1lID0gYGpfY2hlY2tfJHt0aGlzLnBhZ2VUeXBlfWA7XG4gICAgICAgICAgICBjaGVja0VsLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICAgICAgY2hlY2tFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9hbmltYXRlIGJlY2F1c2UgdXNlciBjbGlja2luZ1xuICAgICAgICAgICAgICAgIHRoaXMual9jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgIGFzZ210RWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSW5DaHJvbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlOiB0cnVlIC8vc2hvd3MgYW5pbWF0aW9uIHdoZW4gY2hlY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgdG9SdW4gPSBjdXN0b21NaWRkbGVTY3JpcHQoY2hlY2tFbCwgYXNnbXRFbCk7IC8vcmV0dXJucyBzdHJpbmcgdG8gZXZhbHVhdGUgKHJhcmVseSB1c2VkKVxuICAgICAgICAgICAgaWYgKHRvUnVuID09PSAnY29udGludWUnKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgbG9jYXRlRWxUb0FwcGVuZENoZWNrbWFya1RvKGFzZ210RWwpLmFwcGVuZENoaWxkKGNoZWNrRWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldEFzZ210QnlOYW1lKGFzZ210TmFtZSkge1xuICAgICAgICBsZXQgcXVlcnksIHF1ZXJ5UmVzO1xuICAgICAgICBjb25zb2xlLmxvZyhhc2dtdE5hbWUsIHRoaXMubXVsdGlwbGVBc2dtdENvbnRhaW5lcnMpO1xuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZUFzZ210Q29udGFpbmVycykgeyAvL211bHRpcGxlIGFzZ210IGNvbnRhaW5lcnMgdG8gY2hlY2tcbiAgICAgICAgICAgIGZvciAobGV0IGdldEFzZ210QnlOYW1lUGF0aEVsIG9mIHRoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWwpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IGAke2dldEFzZ210QnlOYW1lUGF0aEVsfTpjb250YWlucygnJHthc2dtdE5hbWUucmVwbGFjZUFsbChgJ2AsIGBcXFxcJ2ApIC8qIGVzY2FwZSBxdW90ZSBtYXJrcyAqL30nKWA7XG4gICAgICAgICAgICAgICAgcXVlcnlSZXMgPSBqUXVlcnkocXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChxdWVyeVJlcy5sZW5ndGggPiAwKSAvL2tlZXBzIGdvaW5nIHRocnUgYXNnbXRDb250YWluZXJzIHVudGlsIHF1ZXJ5UmVzIGlzIGFuIGFzZ210XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBxdWVyeSA9IGAke3RoaXMuZ2V0QXNnbXRCeU5hbWVQYXRoRWx9OmNvbnRhaW5zKCcke2FzZ210TmFtZS5yZXBsYWNlQWxsKGAnYCwgYFxcXFwnYCkgLyogZXNjYXBlIHF1b3RlIG1hcmtzICovfScpYDtcbiAgICAgICAgICAgIHF1ZXJ5UmVzID0galF1ZXJ5KHF1ZXJ5KTsgLy9oYXMgaW5mbyAoY291cnNlICYgZXZlbnQpLCBpZGVudGlmaWVyXG4gICAgICAgICAgICAvL2pRdWVyeSdzIDpjb250YWlucygpIHdpbGwgbWF0Y2ggZWxlbWVudHMgd2hlcmUgYXNnbXROYW1lIGlzIGEgc3Vic3RyaW5nIG9mIHRoZSBhc2dtdC4gZWxzZSBpZiBiZWxvdyBoYW5kbGVzIG92ZXJsYXBzXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZm9FbDtcbiAgICAgICAgaWYgKHF1ZXJ5UmVzLmxlbmd0aCA9PT0gMSkgLy9vbmx5IG9uZSBtYXRjaGluZyBlbGVtZW50cyDwn5GNXG4gICAgICAgICAgICBpbmZvRWwgPSBxdWVyeVJlc1swXTtcbiAgICAgICAgZWxzZSBpZiAocXVlcnlSZXMubGVuZ3RoID49IDIpIHsgLy8yKyBjb25mbGljdGluZyBtYXRjaGVzIPCfpI8gc28gc28gIChuZWVkcyBwcm9jZXNzaW5nIHRvIGZpbmQgcmlnaHQgZWxlbWVudClcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlSZXMubGVuZ3RoOyBpKyspIHsgLy90ZXN0IGZvciBldmVyeSBlbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5UmVzW2ldLmZpcnN0Q2hpbGQubm9kZVZhbHVlID09PSBhc2dtdE5hbWUpIHsgLy9pZiBlbGVtZW50J3MgYXNnbXQgdGl0bGUgbWF0Y2hlcyBhc2dtdE5hbWUsIHRoYXQgaXMgdGhlIHJpZ2h0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgaW5mb0VsID0gcXVlcnlSZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy9yZXR1cm5zIGlmIG5vIG1hdGNoZXMg8J+RjlxuICAgICAgICAgICAgaWYgKCF0aGlzLmlnbm9yZU9sZEFzZ210cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE5vIGVsZW1lbnRzIG1hdGNoZWQgJHthc2dtdE5hbWV9YCwge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEFzZ210QnlOYW1lUGF0aEVsOiB0aGlzLmdldEFzZ210QnlOYW1lUGF0aEVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVJlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9FbFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgJ1RoaXMgZXJyb3IgbWF5IGJlIGNhdXNlZCBieSBvbGQgYXNnbXRzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gWydObyBtYXRjaGVzJywgJ05vIG1hdGNoZXMnXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYmxvY2tFbCA9IHRoaXMuaW5mb1RvQmxvY2tFbChpbmZvRWwpOyAvL2Jsb2NrIChoYXMgc3R5bGVzKVxuICAgICAgICByZXR1cm4gW2luZm9FbCwgYmxvY2tFbF07XG4gICAgfVxuICAgIGpfY2hlY2soeyAvL3BvbHltb3JwaGlzbSBhbGxvd3MgdGhpcyBmdW5jdGlvbiB0byBiZSBzcGVjaWFsaXplZCBhbW9uZyBlYWNoIFNjaG9vbG9neVBhZ2Ugc3ViY2xhc3MuIEhvd2V2ZXIsIGl0IGlzIGNhbGxlZCBmcm9tIHRoaXMgU2Nob29sb2d5UGFnZVxuICAgIC8vIEJlbG93IGFyZSB0aGUgY29udmVudGlvbmFsIGlucHV0c1xuICAgIGFzZ210RWwsIGZvcmNlZFN0YXRlID0gbnVsbCwgLy9pZiBudWxsLCBqX2NoZWNrIHRvZ2dsZXMuIGlmIHRydWUvZmFsc2UsIGl0IGZvcmNlcyBpbnRvIHRoYXQgc3RhdGVcbiAgICBvcHRpb25zOiB7IHN0b3JlSW5DaHJvbWUgPSB0cnVlLCBhbmltYXRlID0gZmFsc2UgLy9zaG93cyBhbmltYXRpb24gd2hlbiBjaGVja2luZ1xuICAgICB9IH0pIHsgfVxuICAgIC8vY3JlYXRlcyBoaWdobGlnaHRHcmVlbkVsIHdpdGggYW5pbWF0ZS9ubyBhbmltYXRlXG4gICAgY3JlYXRlR3JlZW5IaWdobGlnaHRFbCh7IHBhZ2VUeXBlLCBhbmltYXRlID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodEdyZWVuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGhpZ2hsaWdodEdyZWVuLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodC1ncmVlbicpO1xuICAgICAgICBoaWdobGlnaHRHcmVlbi5jbGFzc0xpc3QuYWRkKGBoaWdobGlnaHQtZ3JlZW4tJHtwYWdlVHlwZX1gKTtcbiAgICAgICAgaGlnaGxpZ2h0R3JlZW4uaW5uZXJIVE1MID0gLyogaGlnaGxpZ2h0IGFuaW1hZ2VkIHN2ZyAqLyBgXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgdmVyc2lvbj0nMS4xJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSdub25lJyB2aWV3Qm94PScwIDAgMTAgMTAnXG4gICAgICAgICAgICAgICAgc3R5bGU9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7IHRyYW5zZm9ybTogc2NhbGVYKC0xKSc+XG4gICAgICAgICAgICAgICAgPCEtLSBEYXJrIEdyZWVuIEJhY2tncm91bmQgLS0+XG4gICAgICAgICAgICAgICAgPHBhdGggZmlsbD0ncmdiKDExNSwgMjUyLCAxMjcpJyBkPSdNIDEwIDAgTCAxMCAxMCBMIDAgMTAgTCAwIDAgWicgLz5cbiAgICAgICAgICAgICAgICA8IS0tIFNsYXNoIEJldHdlZW4gQ2VudGVyIC0tPlxuICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0nZ3JlZW4nIGQ9J00gMCAwIEwgMTAgMTAgWic+XG4gICAgICAgICAgICAgICAgJHsgLy9pZiBhbmltYXRlLCBhZGQgYW4gYW5pbWF0aW9uIHRhZyBpbnNpZGUgPHBhdGg+XG4gICAgICAgIGFuaW1hdGVcbiAgICAgICAgICAgID9cbiAgICAgICAgICAgICAgICBgPCEtLSBBbmltYXRpb24gbm90ZXM6IGF0IHN0YXJ0LCBubyBtb3ZlbWVudC4gZ3JhZHVhbGx5IGdldHMgZmFzdGVyIGFuZCBmYXN0ZXIgLS0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVOYW1lPSdkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyPScwLjJzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0Q291bnQ9JzEnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNIDAgMCBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjcgMC43IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE0gMCAwIEwgMC44IDAuOCBMIDEuNiAxLjYgTCAyLjUgMi41IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEwgNy4yOSA3LjI5IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEwgNy4yOSA3LjI5IEwgOC4zOSA4LjM5IEw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTSAwIDAgTCAwLjggMC44IEwgMS42IDEuNiBMIDIuNSAyLjUgTCAzLjQgMy40IEwgNC4zNSA0LjM1IEwgNS4zMSA1LjMxIEwgNi4yOSA2LjI5IEwgNy4yOSA3LjI5IEwgOC4zOSA4LjM5IEwgMTAgMTAgTCdcbiAgICAgICAgICAgICAgICAgICAgLz5gIDogJyd9XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0nZ3JlZW4nIGQ9J00gMCAwIEwgMTAgMTAgWic+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBgO1xuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0R3JlZW47XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU2Nob29sb2d5UGFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gY29sbGFwc2VPdmVyZHVlKCkge1xuICAgIGNvbnN0IG92ZXJkdWVXcmFwcGVyUGF0aCA9IGBkaXYub3ZlcmR1ZS1zdWJtaXNzaW9ucy13cmFwcGVyYDtcbiAgICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IHJlYWR5ID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYub3ZlcmR1ZS1zdWJtaXNzaW9ucy13cmFwcGVyPmRpdi51cGNvbWluZy1saXN0Jyk7XG4gICAgICAgIGlmIChyZWFkeSkge1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NldHRpbmdzJywgKHsgc2V0dGluZ3MgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNldHRpbmdzLm92ZXJkdWVDb2xsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gc2V0KG5ld1ZhbCkge1xuICAgICAgICAgICAgbGV0IG9sZFNldHRpbmdzID0gYXdhaXQgZ2V0KCk7XG4gICAgICAgICAgICBsZXQgbmV3U2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBvbGRTZXR0aW5ncyk7XG4gICAgICAgICAgICBuZXdTZXR0aW5ncy5vdmVyZHVlQ29sbGFwc2VkID0gbmV3VmFsO1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe1xuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBuZXdTZXR0aW5nc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluaXRpYWxWYWwgPSBhd2FpdCBnZXQoKTtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvdmVyZHVlV3JhcHBlclBhdGggKyAnPmgzJyk7XG4gICAgICAgIGNvbnN0IGNvbGxhcHNlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbGxhcHNlQnRuLnN0eWxlLm1hcmdpbkxlZnQgPSAnNHJlbSc7IC8vZGlzdGFuY2UgYmV0d2VlbiB0ZXh0XG4gICAgICAgIGNvbGxhcHNlQnRuLmlubmVyVGV4dCA9ICdIaWRlIE92ZXJkdWUgQXNzaWdubWVudHMnO1xuICAgICAgICBjb2xsYXBzZUJ0bi5jbGFzc0xpc3QuYWRkKCdqX2J1dHRvbicpO1xuICAgICAgICBjb2xsYXBzZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbCA9ICEoYXdhaXQgZ2V0KCkpOyAvL29wcG9zaXRlIG9mIG9sZFZhbFxuICAgICAgICAgICAgcmVyZW5kZXJDb2xsYXBzZUJ0bihuZXdWYWwpO1xuICAgICAgICAgICAgc2V0KG5ld1ZhbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29sbGFwc2VCdG4pO1xuICAgICAgICByZXJlbmRlckNvbGxhcHNlQnRuKGluaXRpYWxWYWwpOyAvL2luaXRpYWwgY2FsbFxuICAgICAgICBmdW5jdGlvbiByZXJlbmRlckNvbGxhcHNlQnRuKG5ld1ZhbCkge1xuICAgICAgICAgICAgY29uc3QgYXNnbXRzRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG92ZXJkdWVXcmFwcGVyUGF0aCArICc+ZGl2LnVwY29taW5nLWxpc3QnKTtcbiAgICAgICAgICAgIGFzZ210c0VsLmNsYXNzTGlzdC50b2dnbGUoJ2pfY29sbGFwc2VkJywgbmV3VmFsKTsgLy9jbGFzcyBpZiBuZXdWYWxcbiAgICAgICAgICAgIGNvbGxhcHNlQnRuLmlubmVyVGV4dCA9IG5ld1ZhbCA/ICdTaG93IE92ZXJkdWUgQXNzaWdubWVudHMnIDogJ0hpZGUgT3ZlcmR1ZSBBc3NpZ25tZW50cyc7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBjb2xsYXBzZU92ZXJkdWU7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBDYWxlbmRhclBhZ2VfMSA9IHJlcXVpcmUoXCIuL3BhZ2VzL0NhbGVuZGFyUGFnZVwiKTtcbmNvbnN0IEhvbWVQYWdlXzEgPSByZXF1aXJlKFwiLi9wYWdlcy9Ib21lUGFnZVwiKTtcbmNvbnN0IENvdXJzZVBhZ2VfMSA9IHJlcXVpcmUoXCIuL3BhZ2VzL0NvdXJzZVBhZ2VcIik7XG4vL1RoaXMgc2NyaXB0IGlzIGluamVjdGVkIGludG8gZXZlcnkgcGFnZS5cbi8vRnVuY3Rpb25zIGFyZSBpbiBzZXF1ZW50aWFsIG9yZGVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGRldGVybWluZVNjaG9vbG9neVBhZ2VUeXBlLCBmYWxzZSk7IC8vd2FpdCBmb3IgRE9NIGVsZW1lbnRzIHRvIGxvYWRcbmZ1bmN0aW9uIGV4ZWN1dGVBZnRlckRvbmVMb2FkaW5nKGNhbGxiYWNrLCAvL2V4ZWN1dGVkIGFmdGVyXG5pc0xvYWRpbmcgPSAoKSA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudXBjb21pbmctbGlzdD4ucmVmcmVzaC13cmFwcGVyIGltZ1thbHQ9XCJMb2FkaW5nXCJdJykgIT0gbnVsbCAvL2RlZmF1bHQgaXMgaWYgdGhlcmUgaXMgbm8gbG9hZGluZyBzeW1ib2wgb24gdGhlIHBhZ2Vcbikge1xuICAgIGxldCBpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoaXNMb2FkaW5nKCkpIHtcbiAgICAgICAgICAgIC8vIENvbnRpbnVlIHdhaXRpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nLi4uJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpOyAvL3N0b3AgaW50ZXJ2YWxcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDApO1xufVxuZnVuY3Rpb24gZGV0ZXJtaW5lU2Nob29sb2d5UGFnZVR5cGUoKSB7XG4gICAgalF1ZXJ5Lm5vQ29uZmxpY3QoKTsgLy9zY2hvb2xvZ3kgYWxzbyBoYXMgaXRzIG93biBqUXVlcnksIHNvIHVzZSBgalF1ZXJ5YCBpbnN0ZWFkIG9mIGAkYCB0byBhdm9pZCBjb25mbGljdFxuICAgIC8vIGNvbnNvbGUubG9nKCcxLiBFeHRlbnNpb24gcnVubmluZycpO1xuICAgIC8vQ2FsZW5kYXJcbiAgICBjb25zdCBoYXNTY2hvb2xvZ3lTY3JpcHRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgc2NyaXB0W3NyYyo9J3NjaG9vbG9neS5jb20nXWApOyAvL3NjaG9vbG9neSBwYWdlXG4gICAgaWYgKGhhc1NjaG9vbG9neVNjcmlwdHMpIHsgLy9zY2hvb2xvZ3kgcGFnZSAoZGV0ZXJtaW5lIHdoaWNoIG9uZSlcbiAgICAgICAgY29uc3QgaGFzQ2FsZW5kYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmNhbGVuZGFyJyk7IC8vY2FsZW5kYXIgcGFnZVxuICAgICAgICBjb25zdCB1cmxIYXNDYWxlbmRhciA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnY2FsZW5kYXInKTtcbiAgICAgICAgaWYgKGhhc0NhbGVuZGFyICYmIHVybEhhc0NhbGVuZGFyKSB7IC8vdHlwZSAxOiBzY2hvb2xvZ3kgY2FsZW5kYXJcbiAgICAgICAgICAgIHdhaXRGb3JFdmVudHNMb2FkZWQoKTtcbiAgICAgICAgfVxuICAgICAgICAvL05vdCBjYWxlbmRhclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBoYXNDb3Vyc2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL1xcL2NvdXJzZVxcLyhcXGQrKVxcLy8pO1xuICAgICAgICAgICAgaWYgKGhhc0NvdXJzZSkgeyAvL3R5cGUgMjogY291cnNlIG1hdGVyaWFscyBwYWdlXG4gICAgICAgICAgICAgICAgbGV0IGNvdXJzZUlkID0gaGFzQ291cnNlWzFdO1xuICAgICAgICAgICAgICAgIGV4ZWN1dGVBZnRlckRvbmVMb2FkaW5nKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvdXJzZVBhZ2VfMS5kZWZhdWx0KGNvdXJzZUlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnaG9tZScpKSB7IC8vdHlwZSAzOiBzY2hvb2xvZ3kgaG9tZSBwYWdlXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFmdGVyRG9uZUxvYWRpbmcoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXcgSG9tZVBhZ2VfMS5kZWZhdWx0KHsgY29udGFpbmVyU2VsZWN0b3JzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpdi51cGNvbWluZy1ldmVudHMtd3JhcHBlcj5kaXYudXBjb21pbmctbGlzdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpdi5vdmVyZHVlLXN1Ym1pc3Npb25zLXdyYXBwZXI+ZGl2LnVwY29taW5nLWxpc3QnLCAvL292ZXJkdWUgYXNnbXRzXG4gICAgICAgICAgICAgICAgICAgICAgICBdIH0pO1xuICAgICAgICAgICAgICAgIH0sICgpID0+ICFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYub3ZlcmR1ZS1zdWJtaXNzaW9ucy13cmFwcGVyPmRpdi51cGNvbWluZy1saXN0JykpOyAvL2NoZWNrIGlmIHVwY29taW5nIGxpc3QgZXhpc3RzLCBub3QgaWYgbG9hZGluZyBpY29uIGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHsgLy9Ob24tc2Nob29sb2d5LXJlbGF0ZWQgcGFnZVxuICAgICAgICAgICAgICAgIC8vcGFzc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLy88aDE+IENBTEVOREFSXG4vL1Jlc2l6ZSBldmVudCBsaXN0ZW5lclxuZnVuY3Rpb24gd2FpdEZvckV2ZW50c0xvYWRlZCgpIHtcbiAgICBsZXQgY2hlY2tJZkV2ZW50c0xvYWRlZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IGNhbGVuZGFyRXZlbnRzTG9hZGVkID0galF1ZXJ5KCcjZmNhbGVuZGFyPmRpdi5mYy1jb250ZW50PmRpdi5mYy12aWV3PmRpdicpWzBdLmNoaWxkcmVuLmxlbmd0aCA+PSAzOyAvL21vcmUgdGhhbiB0aHJlZSBhc2dtdHMgb24gY2FsZW5kYXIgaW5kaWNhdGluZyBhc2dtdHMgbG9hZGVkXG4gICAgICAgIGlmIChjYWxlbmRhckV2ZW50c0xvYWRlZCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjaGVja0lmRXZlbnRzTG9hZGVkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCczLiBBZGQgY2hlY2ttYXJrcycpO1xuICAgICAgICAgICAgLy8gU2Nob29sb2d5Q2FsZW5kYXJQYWdlKCk7XG4gICAgICAgICAgICBuZXcgQ2FsZW5kYXJQYWdlXzEuZGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0aWxsIHdhaXRpbmcgZm9yIGNhbGVuZGFyIGV2ZW50cyB0byBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCAyMDApO1xufVxuLy8gKiBDT05GSUdcbi8vIGNvbnN0IGhvbWV3b3JrQ2hlY2tlclNjaG9vbG9neUNvbmZpZz17XG4vLyAgICAgdmVyYm9zZTogdHJ1ZSAvL3doZXRoZXIgb3Igbm90IHRvIHNob3cgY29uc29sZSBtZXNzYWdlc1xuLy8gfVxuLy8gXG4vLyA8TW9kaWZ5IGNvbnNvbGUubG9nKCkgYW5kIGNvbnNvbGUuZXJyb3IoKVxuLy8gbGV0IG9nQ29uc29sZUxvZz1jb25zb2xlLmxvZztcbi8vIGNvbnNvbGUubG9nPSguLi5hcmdzKT0+e1xuLy8gICAgIGlmIChob21ld29ya0NoZWNrZXJTY2hvb2xvZ3lDb25maWcudmVyYm9zZSlcbi8vICAgICAgICAgb2dDb25zb2xlTG9nKGDik6JgLCAuLi5hcmdzKTtcbi8vIH07XG4vLyBsZXQgb2dDb25zb2xlRXJyb3I9Y29uc29sZS5lcnJvcjtcbi8vIGNvbnNvbGUuZXJyb3I9KC4uLmFyZ3MpPT57XG4vLyAgICAgaWYgKGhvbWV3b3JrQ2hlY2tlclNjaG9vbG9neUNvbmZpZy52ZXJib3NlKVxuLy8gICAgIG9nQ29uc29sZUVycm9yKGDik6JgLCAuLi5hcmdzKTtcbi8vIH07XG4vLyAvPlxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9