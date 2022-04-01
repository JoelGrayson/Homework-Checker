"use strict";
/// <reference types="jquery"/>
/// <reference types="chrome"/>
exports.__esModule = true;
var SchoologyPage = /** @class */ (function () {
    function SchoologyPage(_a) {
        var pageType = _a.pageType, getAsgmtByNamePathEl = _a.getAsgmtByNamePathEl, infoToBlockEl = _a.infoToBlockEl, limits = _a.limits, ignoreOldAsgmts = _a.ignoreOldAsgmts, _b = _a.multipleAsgmtContainers, multipleAsgmtContainers = _b === void 0 ? false : _b;
        var _this = this;
        console.log({ pageType: pageType, getAsgmtByNamePathEl: getAsgmtByNamePathEl, infoToBlockEl: infoToBlockEl, limits: limits, ignoreOldAsgmts: ignoreOldAsgmts, multipleAsgmtContainers: multipleAsgmtContainers });
        chrome.storage.sync.get('settings', function (_a) {
            var settings = _a.settings;
            if (settings.showCheckmarks === 'onHover') {
                console.log('Only show checkmark on hover');
                //Load style if onlyShowCheckmarkOnHover
                var styleEl = document.createElement('style');
                styleEl.innerHTML = "\n                    .j_check_cal {\n                        visibility: hidden; /* all input checks hidden */\n                    }\n                    .fc-event:hover .j_check_cal { /* input check shown onhover of asgmt */\n                        visibility: visible;\n                    }\n                ";
                document.head.appendChild(styleEl);
            }
        });
        this.pageType = pageType; //indicates css class for checkbox
        this.multipleAsgmtContainers = multipleAsgmtContainers;
        this.getAsgmtByNamePathEl = getAsgmtByNamePathEl; //from where to search :contains() of an asgmt by name
        this.infoToBlockEl = infoToBlockEl;
        this.ignoreOldAsgmts = ignoreOldAsgmts !== null && ignoreOldAsgmts !== void 0 ? ignoreOldAsgmts : true; //true by default. overridden by user input
        /*{
            courses, //'$all' | String of course name
            time //'any' | 'future'
        }*/
        //listens for `run $cmd` message from popup.js
        chrome.runtime.onMessage.addListener(function (msg, sender, response) {
            if (msg.hasOwnProperty('run')) {
                switch (msg.run) {
                    case 'reload':
                        location.reload();
                        break;
                    case 'check all asgmts':
                        _this.checkAllAsgmtEl();
                        break;
                    case 'check all asgmts before today':
                        _this.checkAllAsgmtElBeforeToday();
                        break;
                    default:
                        console.error('Unknown run message:', msg.run);
                }
            }
        });
        //Sets this.coursesGlobal to chrome storage
        chrome.storage.sync.get('courses', function (_a) {
            var courses = _a.courses;
            _this.coursesGlobal = courses;
            console.log('courses', courses);
            console.log(limits); //time & course limits when getting asgmts
            if (limits.courses === '$all' && limits.time === 'any') { //calendar or home page
                for (var _i = 0, courses_1 = courses; _i < courses_1.length; _i++) {
                    var course = courses_1[_i];
                    var checked = course.checked; //asgmts
                    for (var _b = 0, checked_1 = checked; _b < checked_1.length; _b++) {
                        var asgmtEl = checked_1[_b];
                        var _c = _this.getAsgmtByName(asgmtEl), infoEl = _c[0], blockEl = _c[1];
                        if (infoEl !== 'No matches')
                            _this.j_check({
                                asgmtEl: blockEl,
                                options: {
                                    storeInChrome: false
                                }
                            });
                    }
                }
            }
            else if (limits.courses === '$all' && _this.time === 'future') { //not being used, potential if not prev asgmts
            }
            else if (limits.courses !== '$all' && _this.time === 'any') { //course page (all asgmts of course)
                console.log("Only checking the course: ".concat(_this.courses));
                if (courses in _this.coursesGlobal) { //if checked asgmts of that course
                    var asgmts = _this.coursesGlobal[_this.courses];
                    console.log('Asgmts', asgmts);
                    for (var _d = 0, asgmts_1 = asgmts; _d < asgmts_1.length; _d++) {
                        var asgmtEl = asgmts_1[_d];
                        var _e = _this.getAsgmtByName(asgmtEl), infoEl = _e[0], blockEl = _e[1];
                        if (infoEl !== 'No matches')
                            _this.j_check({
                                asgmtEl: blockEl,
                                options: {
                                    storeInChrome: false
                                }
                            });
                    }
                }
            }
        });
    }
    SchoologyPage.prototype.checkAllAsgmtEl = function () {
        throw new Error("Method not implemented.");
    };
    SchoologyPage.prototype.checkAllAsgmtElBeforeToday = function () {
        throw new Error("Method not implemented.");
    };
    SchoologyPage.prototype.addCheckmarks = function (_a) {
        var _this = this;
        var //called in subclass' constructor, adds checkmarks to each asgmt for clicking; checks those checkmarks based on chrome storage
        asgmtElContainer = _a.asgmtElContainer, //where the asgmts are located
        customMiddleScript = _a.customMiddleScript, //anonymous func executed in the middle
        locateElToAppendCheckmarkTo = _a.locateElToAppendCheckmarkTo //determines how to add children els ie el=>el.parentNode
        ;
        var children = asgmtElContainer.children;
        var _loop_1 = function (asgmtEl) {
            var checkEl = document.createElement('input');
            checkEl.className = "j_check_".concat(this_1.pageType);
            checkEl.type = 'checkbox';
            checkEl.addEventListener('change', function () {
                //animate because user clicking
                _this.j_check({
                    asgmtEl: asgmtEl,
                    options: {
                        storeInChrome: true,
                        animate: true //shows animation when checking
                    }
                });
            });
            var toRun = customMiddleScript(checkEl, asgmtEl); //returns string to evaluate (rarely used)
            if (toRun === 'continue')
                return "continue";
            locateElToAppendCheckmarkTo(asgmtEl).appendChild(checkEl);
        };
        var this_1 = this;
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var asgmtEl = children_1[_i];
            _loop_1(asgmtEl);
        }
    };
    SchoologyPage.prototype.getAsgmtByName = function (asgmtName) {
        var query, queryRes;
        console.log(asgmtName, this.multipleAsgmtContainers);
        if (this.multipleAsgmtContainers) { //multiple asgmt containers to check
            for (var _i = 0, _a = this.getAsgmtByNamePathEl; _i < _a.length; _i++) {
                var getAsgmtByNamePathEl = _a[_i];
                query = "".concat(getAsgmtByNamePathEl, ":contains('").concat(asgmtName.replaceAll("'", "\\'") /* escape quote marks */, "')");
                queryRes = jQuery(query);
                if (queryRes.length > 0) //keeps going thru asgmtContainers until queryRes is an asgmt
                    break;
                else
                    continue;
            }
        }
        else {
            query = "".concat(this.getAsgmtByNamePathEl, ":contains('").concat(asgmtName.replaceAll("'", "\\'") /* escape quote marks */, "')");
            queryRes = jQuery(query); //has info (course & event), identifier
            //jQuery's :contains() will match elements where asgmtName is a substring of the asgmt. else if below handles overlaps
        }
        var infoEl;
        if (queryRes.length === 1) //only one matching elements 👍
            infoEl = queryRes[0];
        else if (queryRes.length >= 2) { //2+ conflicting matches 🤏 so so  (needs processing to find right element)
            for (var i = 0; i < queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue === asgmtName) { //if element's asgmt title matches asgmtName, that is the right element
                    infoEl = queryRes[i];
                    break;
                }
            }
        }
        else { //returns if no matches 👎
            if (!this.ignoreOldAsgmts) {
                console.error("No elements matched ".concat(asgmtName), {
                    errorInfo: {
                        getAsgmtByNamePathEl: this.getAsgmtByNamePathEl,
                        query: query,
                        queryRes: queryRes,
                        infoEl: infoEl
                    }
                }, 'This error may be caused by old asgmts');
            }
            return ['No matches', 'No matches'];
        }
        var blockEl = this.infoToBlockEl(infoEl); //block (has styles)
        return [infoEl, blockEl];
    };
    SchoologyPage.prototype.j_check = function (_a) {
        var //polymorphism allows this function to be specialized among each SchoologyPage subclass. However, it is called from this SchoologyPage
        // Below are the conventional inputs
        asgmtEl = _a.asgmtEl, _b = _a.forcedState, forcedState = _b === void 0 ? null : _b, //if null, j_check toggles. if true/false, it forces into that state
        _c = _a.options, _d = _c.storeInChrome, storeInChrome = _d === void 0 ? true : _d, _e = _c.animate //shows animation when checking
        , animate = _e === void 0 ? false : _e //shows animation when checking
        ;
    };
    SchoologyPage.prototype.createGreenHighlightEl = function (_a) {
        var //creates highlightGreenEl with animate/no animate
        pageType = _a.pageType, animate = _a.animate //: Boolean
        ;
        var highlightGreen = document.createElement('div');
        highlightGreen.classList.add('highlight-green');
        highlightGreen.classList.add("highlight-green-".concat(pageType));
        highlightGreen.innerHTML = /* highlight animaged svg */ "\n            <svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 10 10'\n                style='width: 100%; height: 100%; transform: scaleX(-1)'>\n                <!-- Dark Green Background -->\n                <path fill='rgb(115, 252, 127)' d='M 10 0 L 10 10 L 0 10 L 0 0 Z' />\n                <!-- Slash Between Center -->\n                <path stroke='green' d='M 0 0 L 10 10 Z'>\n                ".concat(//if animate, add an animation tag inside <path>
        animate
            ?
                "<!-- Animation notes: at start, no movement. gradually gets faster and faster -->\n                    <animate\n                        attributeName='d'\n                        dur='0.2s'\n                        repeatCount='1'\n                        values='\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L 0.7 0.7 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L 8.39 8.39 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L 8.39 8.39 L 10 10 L'\n                    />" : '', "\n                </path>\n                <path stroke='green' d='M 0 0 L 10 10 Z'>\n                    \n                </path>\n            </svg>\n        ");
        return highlightGreen;
    };
    SchoologyPage.prototype.updateCheckedTasks = function (coursesGlobal) {
        console.log('Updating to ', coursesGlobal);
        chrome.storage.sync.set({ checkedTasks: coursesGlobal });
    };
    return SchoologyPage;
}());
exports["default"] = SchoologyPage;
