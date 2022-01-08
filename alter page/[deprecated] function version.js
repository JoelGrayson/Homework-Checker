//CALENDAR PAGE

function SchoologyCalendarPage() { //adds checkmarks to every calendar event
    function addCheckmarks() {
        const assignmentsContainer=document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode;
        let children=assignmentsContainer.children;
        for (let i=0; i<children.length; i++) {
            let assignmentEl=children[i];
            let checkEl=document.createElement('input');
            checkEl.className='j_check_cal';
            checkEl.type='checkbox';
            // checkEl.checked
            checkEl.addEventListener('change', ()=>{
                j_check(assignmentEl)
            });
            jQuery(checkEl).on('click', e=>{ //prevent assignment dialog from opening when clicking checkmark
                e.stopPropagation();
            });
            assignmentEl.appendChild(checkEl);
        }
    }
    addCheckmarks();

    //CHECK Assignments Already Completed
    let checkedTasksGlobal;
    chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
        checkedTasksGlobal=checkedTasks;
        log('checkedTasks', checkedTasks);
        for (let course in checkedTasksGlobal) {
            let assignments=checkedTasksGlobal[course];
            for (let i=0; i<assignments.length; i++) {
                let [infoEl, blockEl]=getAssignmentByName(assignments[i]);
                j_check(blockEl, false);
            }
        }
    });

    function j_check(assignmentEl, storeInChrome=true) { //checks/unchecks passed in element
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior assignments from storage. is true all other times
        let pHighlight=assignmentEl.querySelector('.highlight-green'); //based on item inside assignment
        const checkmarkEl=assignmentEl.querySelector('input.j_check_cal');
        let assignmentText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of assignment (firstChild), not including inside grandchildren like innerText()
        let courseText=assignmentEl.querySelector('.fc-event-inner>.fc-event-title span.realm-title-course').innerText;

        if (pHighlight==null) { //no highlight green already
            log(`Checking ${assignmentText}`);
            //Check
            checkmarkEl.checked=true;
            let highlightGreen=document.createElement('div');
            highlightGreen.classList.add('highlight-green');
            highlightGreen.classList.add('highlight-green-cal');
            
            assignmentEl.insertBefore(highlightGreen, assignmentEl.firstChild);
           
            if (storeInChrome) {
                if (courseText in checkedTasksGlobal) { //already exists, so append
                    checkedTasksGlobal[courseText].push(assignmentText);
                } else { //not exist, so create course log
                    checkedTasksGlobal[courseText]=[];
                    checkedTasksGlobal[courseText].push(assignmentText); //push to newly created class
                }
                updateCheckedTasks(checkedTasksGlobal);
            }
        } else {
            log(`Unchecking ${assignmentText}`);
            //Uncheck
            checkmarkEl.checked=false;
            assignmentEl.removeChild(pHighlight);
            
            // checkedTasksGlobal.pop(checkedTasksGlobal.indexOf(assignmentText));
            checkedTasksGlobal[courseText].pop(checkedTasksGlobal[courseText].indexOf(assignmentText));
            updateCheckedTasks(checkedTasksGlobal);
        }
    }

    
    function getAssignmentByName(assignmentName) { //assignment names stored in database
        let infoEl;
        let queryRes=jQuery(`span.fc-event-title>span:contains('${assignmentName}')`); //has info (course & event), identifier
        //jQuery's :contains() will match elements where assignmentName is a substring of the assignment. else if below handles overlaps
        
        if (queryRes.length===1) //only one matching elements 👍
            infoEl=queryRes[0];
        else if (queryRes.length>=2) { //2+ conflicting matches 🤏 (needs processing to find right element)
            for (let i=0; i<queryRes.length; i++) { //test for every element
                if (queryRes[i].firstChild.nodeValue===assignmentName) { //if element's assignment title matches assignmentName, that is the right element
                    infoEl=queryRes[i];
                    break;
                }
            }
        } else { //returns if no matches 👎
            console.error(`No elements matched ${assignmentName}`);
            return 'No matches';
        }
        let blockEl=infoEl.parentNode.parentNode.parentNode; //block (has styles)
        return [infoEl, blockEl];
    }
}


// MATERIALS PAGE

function materialsPage(courseId) {
    function addCheckmarks() {
        const assignmentsContainer=document.querySelector('div.upcoming-list>div.upcoming-events>div.upcoming-list');
        let children=assignmentsContainer.children;
        for (let i=0; i<children.length; i++) {
            let assignmentEl=children[i];
            if (assignmentEl.classList.contains('date-header'))
                continue; //does not add check to date header

            let checkEl=document.createElement('input');
            checkEl.classList.add('j_check_materials');
            checkEl.type='checkbox';
            // checkEl.checked
            checkEl.addEventListener('change', ()=>{
                j_check(assignmentEl);
            });
            assignmentEl.firstChild.appendChild(checkEl);
        }
    }
    addCheckmarks();

    let checkedTasksGlobal;
    chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
        checkedTasksGlobal=checkedTasks;
        log('checkedTasks', checkedTasksGlobal);
        if (courseName in checkedTasksGlobal) { //checked tasks in course
            for (let i=0; i<checkedTasksGlobal[courseName].length; i++) {
                let assignmentName=checkedTasksGlobal[courseName][i];
                let assignmentEl=getAssignmentByName(assignmentName)
                j_check(assignmentEl, false);
            }
        }
    });
    
    function getAssignmentByName(assignmentName) {
        let assignmentEl=jQuery(`div.upcoming-list>div.upcoming-events>div.upcoming-list>div:contains(${assignmentName})`);
        if (assignmentEl) //return if element
            return assignmentEl[0];
        else //if no existing assignment by name, return null
            return null;
    }

    function j_check(assignmentEl, storeInChrome=true) {
        let pHighlight=assignmentEl.classList.contains('highlight-green'); //based on classList of assignmentEl
        const checkmarkEl=assignmentEl.querySelector('input.j_check_materials');
        let assignmentText=assignmentEl.querySelector('a').innerText;
        
        if (!pHighlight) { //no highlight green already, so check
            log(`Checking ${assignmentText}`);
            //Check
            checkmarkEl.checked=true;
            assignmentEl.classList.add('highlight-green');
           
            if (storeInChrome) {
                if (courseName in checkedTasksGlobal) { //already exists, so append
                    checkedTasksGlobal[courseName].push(assignmentText);
                } else { //not exist, so create course log
                    checkedTasksGlobal[courseName]=[];
                    checkedTasksGlobal[courseName].push(assignmentText); //push to newly created class
                }
                updateCheckedTasks(checkedTasksGlobal);
            }
        } else { //uncheck
            log(`Unchecking ${assignmentText}`);
            //Uncheck
            checkmarkEl.checked=false;
            assignmentEl.classList.remove('highlight-green');
            
            try {
                checkedTasksGlobal[courseName].pop(checkedTasksGlobal[courseName].indexOf(assignmentText));
                updateCheckedTasks(checkedTasksGlobal);
            } catch (err) {
                log(err);
                setTimeout(()=>{
                    checkedTasksGlobal[courseName].pop(checkedTasksGlobal[courseName].indexOf(assignmentText));
                    updateCheckedTasks(checkedTasksGlobal);
                }, 1000);
            }
        }
    }
}

function homePage() {
    
}