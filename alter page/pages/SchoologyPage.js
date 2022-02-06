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
                            this.j_check(blockEl, false);
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
                            this.j_check(blockEl, false);
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
                this.j_check(assignmentEl);
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

    j_check() {} //polymorphism allows this function to be specialized among each SchoologyPage subclass

    updateCheckedTasks(checkedTasksGlobal) { //updates chrome's storage with checked tasks parameter
        console.log('Updating to ', checkedTasksGlobal);
        chrome.storage.sync.set({checkedTasks: checkedTasksGlobal});
    }
    static checkedTasksGlobal; //holds the checkedTasks variable globally in the class
}
