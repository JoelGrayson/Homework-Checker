class SchoologyPage { //abstract class; template for each page
    constructor({pageType, getAssignmentByNamePathEl, infoToBlockEl, checkPrev, ignoreOldAssignments, multipleAssignmentContainers=false}) {
        console.log({pageType, getAssignmentByNamePathEl, infoToBlockEl, checkPrev, ignoreOldAssignments, multipleAssignmentContainers})
        
        chrome.storage.sync.get('settings', ({settings})=>{
            if (settings.showCheckmarks==='onHover') {
                console.log('Only show checkmark on hover');
                
                //Load style if onlyShowCheckmarkOnHover
                let styleEl=document.createElement('style');
                styleEl.innerHTML=`
                    .j_check_cal {
                        visibility: hidden; /* all input checks hidden */
                    }
                    .fc-event:hover .j_check_cal { /* input check shown onhover of assignment */
                        visibility: visible;
                    }
                `;
                document.head.appendChild(styleEl);
            }
        });

        this.pageType=pageType; //indicates css class for checkbox
        this.multipleAssignmentContainers=multipleAssignmentContainers;

        this.getAssignmentByNamePathEl=getAssignmentByNamePathEl; //from where to search :contains() of an assignment by name
        this.infoToBlockEl=infoToBlockEl;
        this.checkPrev=checkPrev;
        this.ignoreOldAssignments=ignoreOldAssignments ?? true; //true by default. overridden by user input

        /*{
            courses, //'$all' | String of course name
            time //'any' | 'future'
        }*/

        //listens for `run $cmd` message from popup.js
        chrome.runtime.onMessage.addListener((msg, sender, response)=>{ 
            if (msg.hasOwnProperty('run')) {
                switch (msg.run) {
                    case 'reload':
                        location.reload();
                        break;
                    case 'check all assignments':
                        this.checkAllAssignments();
                        break;
                    case 'check all assignments before today':
                        this.checkAllAssignmentsBeforeToday();
                        break;
                    default:
                        console.error('Unknown run message:', msg.run)
                }
            }
        });
        //Sets this.checkedTasksGlobal to chrome storage
        this.checkedTasksGlobal;
        chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
            this.checkedTasksGlobal=checkedTasks;
            console.log('checkedTasks', checkedTasks);
            //checks previous assignments
            console.log(this.checkPrev)
            let courses=this.checkPrev.courses;
            let time=this.checkPrev.time;
            if (courses==='$all' && time==='any') { //calendar or home page
                for (let course in this.checkedTasksGlobal) {
                    let assignments=this.checkedTasksGlobal[course];
                    for (let assignmentEl of assignments) {
                        let [infoEl, blockEl]=this.getAssignmentByName(assignmentEl);
                        if (infoEl!=='No matches')
                            this.j_check({
                                assignmentEl: blockEl,
                                options: { //don't store when initially checking (because checks are from previous state)
                                    storeInChrome: false,
                                }
                            });
                    }
                }
            } else if (courses==='$all' && time==='future') { //not being used, potential if not prev assignments

            } else if (courses!=='$all' && time==='any') { //course page (all assignments of course)
                console.log(`Only checking the course: ${courses}`)
                if (this.checkPrev.courses in this.checkedTasksGlobal) { //if checked assignments of that course
                    let assignments=this.checkedTasksGlobal[courses];
                    console.log('Assignments', assignments);
                    for (let assignmentEl of assignments) {
                        let [infoEl, blockEl]=this.getAssignmentByName(assignmentEl);
                        if (infoEl!=='No matches')
                            this.j_check({
                                assignmentEl: blockEl,
                                options: {
                                    storeInChrome: false,
                                }
                            })
                    }
                }
            }
        });
    }
    addCheckmarks({ //called in subclass' constructor, adds checkmarks to each assignment for clicking; checks those checkmarks based on chrome storage
        assignmentsContainer, //where the assignments are located
        customMiddleScript, //anonymous func executed in the middle
        locateElToAppendCheckmarkTo //determines how to add children els ie el=>el.parentNode
    }) {
        let children=assignmentsContainer.children;
        for (let assignmentEl of children) {
            let checkEl=document.createElement('input');
            checkEl.className=`j_check_${this.pageType}`;
            checkEl.type='checkbox';
            checkEl.addEventListener('change', ()=>{
                //animate because user clicking
                this.j_check({
                    assignmentEl,
                    options: {
                        storeInChrome: true,
                        animate: true //shows animation when checking
                    }
                });
            });
            let toRun=customMiddleScript(checkEl, assignmentEl); //returns string to evaluate (rarely used)
            if (toRun==='continue')
                continue;
            
            locateElToAppendCheckmarkTo(assignmentEl).appendChild(checkEl);
        }
    }

    getAssignmentByName(assignmentName) { //returns DOMElement based on given string
        let query, queryRes;

        console.log(assignmentName, this.multipleAssignmentContainers)
        
        if (this.multipleAssignmentContainers) { //multiple assignment containers to check
            for (let getAssignmentByNamePathEl of this.getAssignmentByNamePathEl) { 
                query=`${getAssignmentByNamePathEl}:contains('${   assignmentName.replaceAll(`'`, `\\'`) /* escape quote marks */  }')`;
                queryRes=jQuery(query);
                if (queryRes.length>0) //keeps going thru assignmentContainers until queryRes is an assignment
                    break;
                else
                    continue;
            }
        } else {
            query=`${this.getAssignmentByNamePathEl}:contains('${   assignmentName.replaceAll(`'`, `\\'`) /* escape quote marks */  }')`;
            queryRes=jQuery(query); //has info (course & event), identifier
            //jQuery's :contains() will match elements where assignmentName is a substring of the assignment. else if below handles overlaps
        }
        
        
        let infoEl;
        if (queryRes.length===1) //only one matching elements 👍
            infoEl=queryRes[0];
        else if (queryRes.length>=2) { //2+ conflicting matches 🤏 so so  (needs processing to find right element)
            for (let i=0; i<queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue===assignmentName) { //if element's assignment title matches assignmentName, that is the right element
                    infoEl=queryRes[i];
                    break;
                }
            }
        } else { //returns if no matches 👎
            if (!this.ignoreOldAssignments) {
                console.error(`No elements matched ${assignmentName}`, {
                    errorInfo: {
                        getAssignmentByNamePathEl: this.getAssignmentByNamePathEl,
                        query,
                        queryRes,
                        infoEl
                    }
                }, 'This error may be caused by old assignments');
            }
            return ['No matches', 'No matches'];
        }
        
        let blockEl=this.infoToBlockEl(infoEl); //block (has styles)
        return [infoEl, blockEl];
    }

    j_check({ //polymorphism allows this function to be specialized among each SchoologyPage subclass. However, it is called from this SchoologyPage
        // Below are the conventional inputs
        assignmentEl,
        forcedState=null, //if null, j_check toggles. if true/false, it forces into that state
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) {}

    createHighlightGreenEl({ //creates highlightGreenEl with animate/no animate
        pageType,
        animate //: Boolean
    }) {
        const highlightGreen=document.createElement('div');
        highlightGreen.classList.add('highlight-green');
        highlightGreen.classList.add(`highlight-green-${pageType}`);
        if (animate) {
            highlightGreen.innerHTML=`
                <svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 10 10'
                    style='width: 100%; height: 100%; transform: scaleX(-1)'>
                    <!-- Dark Green Background -->
                    <path fill='rgb(115, 252, 127)' d='M 10 0 L 10 10 L 0 10 L 0 0 Z' />
                    <!-- Slash Between Center -->
                    <path stroke='green' d='M 0 0 L 10 10 Z'>
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
                        />
                        <!-- Animation notes: at start, no movement. gradually gets faster and faster -->
                    </path>
                </svg>
            `;
        } else {
            highlightGreen.innerHTML=`
                <svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 10 10'
                    style='width: 100%; height: 100%; transform: scaleX(-1)'>
                    <!-- Dark Green Background -->
                    <path fill='rgb(115, 252, 127)' d='M 10 0 L 10 10 L 0 10 L 0 0 Z' />
                    <!-- Slash Between Center -->
                    <path stroke='green' d='M 0 0 L 10 10 Z'/>
                </svg>
            `;
        }
        return highlightGreen;
    }

    updateCheckedTasks(checkedTasksGlobal) { //updates chrome's storage with checked tasks parameter
        console.log('Updating to ', checkedTasksGlobal);
        chrome.storage.sync.set({checkedTasks: checkedTasksGlobal});
    }
    static checkedTasksGlobal; //holds the checkedTasks variable globally in the class
}
