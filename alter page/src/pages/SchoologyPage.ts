/// <reference types="jquery"/>
/// <reference types="chrome"/>

import { removeSpaces } from '../functions';

interface Course {
    name: string;
    noSpacesName: string;
    checked: string[]; //checked assignments
}
type Assignment=[HTMLElement | 'No matches', HTMLElement | 'No matches']; //tuple of infoEl and blockEl


interface PageOptions {
    pageType: string;
    getAsgmtByNamePathEl: string | string[];
    infoToBlockEl: (infoEl: HTMLElement)=>HTMLElement;
    limits: {
        courses: string, //'$all' or course name
        time: 'any' | 'future'
    };
    ignoreOldAsgmts?: boolean;
    multipleAsgmtContainers?: boolean;
}
export default abstract class SchoologyPage {
    pageType: string; //public by default
    multipleAsgmtContainers: boolean;
    getAsgmtByNamePathEl: string | string[];
    infoToBlockEl: (infoEl: HTMLElement)=>HTMLElement; //how to get to infoEl from blockEl
    ignoreOldAsgmts: boolean;
    private time: string;
    courses: string; //abstract class; template for each page
    coursesGlobal: Course[];

    constructor({ pageType, getAsgmtByNamePathEl, infoToBlockEl, limits, ignoreOldAsgmts=true, multipleAsgmtContainers=false }: PageOptions) {
        console.log('<hw>', {pageType, getAsgmtByNamePathEl, infoToBlockEl, limits, ignoreOldAsgmts, multipleAsgmtContainers})
        
        chrome.storage.sync.get('settings', ({settings})=>{ //settings change appearance
            if (settings.showCheckmarks==='onHover') {
                console.log('<hw>', 'Only show checkmark on hover');
                
                //Load style if onlyShowCheckmarkOnHover
                let styleEl=document.createElement('style');
                styleEl.innerHTML=`
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

        this.pageType=pageType; //indicates css class for checkbox
        this.multipleAsgmtContainers=multipleAsgmtContainers;

        this.getAsgmtByNamePathEl=getAsgmtByNamePathEl; //from where to search :contains() of an asgmt by name
        this.infoToBlockEl=infoToBlockEl;
        this.ignoreOldAsgmts=ignoreOldAsgmts;

        /*{
            courses, //'$all' | String of course name
            time //'any' | 'future'
        }*/

        //listens for `run $cmd` message from popup.js
        chrome.runtime.onMessage.addListener((msg, sender, response)=>{ //also onMessage in background.js
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
                        console.error('Unknown run message:', msg.run)
                }
            }
            return true;
        });
        //Sets this.coursesGlobal to chrome storage
        chrome.storage.sync.get('courses', ({courses})=>{
            this.coursesGlobal=courses;
            console.log('<hw>', 'courses', courses);
            console.log('<hw>', limits); //time & course limits when getting asgmts
            
            if (limits.courses==='$all' && limits.time==='any') { //calendar or home page
                for (let course of courses) { //TODO: change schema
                    let checked=course.checked; //asgmts
                    for (let asgmtEl of checked) {
                        let [infoEl, blockEl]=this.getAsgmtByName(asgmtEl);
                        if (infoEl!=='No matches')
                            this.j_check({
                                asgmtEl: blockEl,
                                options: { //don't store when initially checking (because checks are from previous state)
                                    storeInChrome: false,
                                }
                            });
                    }
                }
            } else if (limits.courses==='$all' && limits.time==='future') { //not being used, potential if not prev asgmts

            } else if (limits.courses!=='$all' && limits.time==='any') { //course page (all asgmts of course)
                const courseName=limits.courses; //single course string
                console.log('<hw>', `Only checking asgmts of the course: ${courseName}`);
                const course=this.getCourse(courseName); //if course is undefined, it has not been created yet because there are no checked tasks
                console.log('<hw>', 'm1', {course})
                if (course!=undefined) { //if the course exists
                    for (let asgmt of course.checked) {
                        console.log('<hw>', 'm2', {asgmt});
                        const [infoEl, blockEl]=this.getAsgmtByName(asgmt);
                        if (infoEl!=='No matches' && blockEl!=='No matches')
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
    getCourse(name: string, options={ noSpacesName: true }): Course {
        if (options.noSpacesName)
            return this.coursesGlobal.find(course=>removeSpaces(course.name)===removeSpaces(name)); //compare space-less names
        return this.coursesGlobal.find(course=>course.name===name);
    }
    createCourse(course: string, options={save: true}) {
        console.log('<hw>', 'Creating course', course)
        this.coursesGlobal.push({
            name: course,
            noSpacesName: removeSpaces(course),
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
        delete this.coursesGlobal[
            this.coursesGlobal.findIndex(course=>course.name===name) //get index
        ];
        this.updateCourses().then(()=>{
            return name;
        });
    }
    /**
     * @param course course name
     * @param asgmt assignment name
     */
    addAsgmt(course: string, asgmt: string, options: { createCourseIfNotExist?: boolean, noSpacesName?: boolean }) {
        options.createCourseIfNotExist??=false;
        options.noSpacesName??=true;

        if (options.createCourseIfNotExist && this.getCourse(course)===undefined) //create course if not exists
            this.createCourse(course, { save: false });
        

        console.log('<hw>', {noSpacesName: options.noSpacesName});
        this.getCourse(course, {noSpacesName: options.noSpacesName}).checked.push(asgmt);
        this.updateCourses();
    }
    removeAsgmt(courseName, asgmt) {
        this.getCourse(courseName).checked=this.getCourse(courseName).checked.filter(item=>(
            item!==asgmt
        ));
        this.updateCourses().then(()=>{
            return asgmt;
        });
    }
    /**
     * Updates chrome's storage with checked tasks parameter
     * @returns Promise boolean succeeded?
     * */
    updateCourses(newCourses?: Course[]): Promise<boolean> {
        newCourses=newCourses ?? this.coursesGlobal; //default is this.coursesGlobal

        const data=JSON.stringify({courses: newCourses});
        return new Promise((resolve, reject)=>{
            chrome.runtime.sendMessage(
                {
                    run: 'update chrome storage',
                    data
                },
                response=>{
                    return resolve(response); //succeeded or not
                }
            );
        })
    }
    //* >

    
    
    
    addCheckmarks({ //called in subclass' constructor, adds checkmarks to each asgmt for clicking; checks those checkmarks based on chrome storage
        asgmtElContainer, //where the asgmts are located
        customMiddleScript, //anonymous func executed in the middle
        locateElToAppendCheckmarkTo //determines how to add children els ie el=>el.parentNode
    }) {
        let children=asgmtElContainer.children;
        for (let asgmtEl of children) {
            let checkEl=document.createElement('input');
            checkEl.className=`j_check_${this.pageType}`;
            checkEl.type='checkbox';
            checkEl.addEventListener('change', ()=>{
                //animate because user clicking
                this.j_check({
                    asgmtEl,
                    options: {
                        storeInChrome: true,
                        animate: true //shows animation when checking
                    }
                });
            });
            let toRun=customMiddleScript(checkEl, asgmtEl); //returns string to evaluate (rarely used)
            if (toRun==='continue')
                continue;
            
            locateElToAppendCheckmarkTo(asgmtEl).appendChild(checkEl);
        }
    }

    getAsgmtByName(asgmtName): Assignment { //returns DOMElement based on given string
        let query, queryRes;

        console.log('<hw>', asgmtName, this.multipleAsgmtContainers)
        
        if (this.multipleAsgmtContainers) { //multiple asgmt containers to check
            for (let getAsgmtByNamePathEl of this.getAsgmtByNamePathEl) { 
                query=`${getAsgmtByNamePathEl}:contains('${   asgmtName.replaceAll(`'`, `\\'`) /* escape quote marks */  }')`;
                queryRes=jQuery(query);
                if (queryRes.length>0) //keeps going thru asgmtContainers until queryRes is an asgmt
                    break;
                else
                    continue;
            }
        } else {
            query=`${this.getAsgmtByNamePathEl}:contains('${   asgmtName.replaceAll(`'`, `\\'`) /* escape quote marks */  }')`;
            queryRes=jQuery(query); //has info (course & event), identifier
            //jQuery's :contains() will match elements where asgmtName is a substring of the asgmt. else if below handles overlaps
        }
        
        
        let infoEl;
        if (queryRes.length===1) //only one matching elements 👍
            infoEl=queryRes[0];
        else if (queryRes.length>=2) { //2+ conflicting matches 🤏 so so  (needs processing to find right element)
            for (let i=0; i<queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue===asgmtName) { //if element's asgmt title matches asgmtName, that is the right element
                    infoEl=queryRes[i];
                    break;
                }
            }
        } else { //returns if no matches 👎
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
        
        let blockEl=this.infoToBlockEl(infoEl); //block (has styles)
        return [infoEl, blockEl];
    }

    j_check({ //polymorphism allows this function to be specialized among each SchoologyPage subclass. However, it is called from this SchoologyPage
        // Below are the conventional inputs
        asgmtEl,
        forcedState=null, //if null, j_check toggles. if true/false, it forces into that state
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }): void {}

    //creates highlightGreenEl with animate/no animate
    createGreenHighlightEl({ pageType, animate=true }: {pageType: string, animate?: boolean}): HTMLElement {
        const highlightGreen=document.createElement('div');
        highlightGreen.classList.add('highlight-green');
        highlightGreen.classList.add(`highlight-green-${pageType}`);
        highlightGreen.innerHTML=/* highlight animaged svg */`
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
                    />`:''
                }
                </path>
            </svg>
        `;
        return highlightGreen;
    }
}
