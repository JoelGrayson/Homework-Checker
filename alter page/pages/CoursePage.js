class CoursePage extends SchoologyPage { //materials page (one course)
    constructor(courseID) {
        let containerPath=`#course-events .upcoming-list .upcoming-events .upcoming-list`;
        let courseName=document.querySelector('#center-top>.page-title').innerText; //grabs course title
        courseName=removeSpaces(courseName);

        super({
            pageType: 'course',
            getAssignmentByNamePathEl: `${containerPath}>div[data-start]`, //searches inside assignment
            infoToBlockEl: el=>el,
            checkPrev: {
                courses: courseName,
                time: 'any'
            }
        });
        this.courseID=courseID;
        this.courseName=courseName;

        this.addCheckmarks({
            assignmentsContainer: document.querySelector(containerPath), //all assignments' container
            customMiddleScript: (checkEl, assignmentEl)=>{
                if (assignmentEl.classList.contains('date-header')) //does not add check to .date-header by continue;ing out of loop
                    return 'continue';
            },
            locateElToAppendCheckmarkTo: el=>el.firstChild
        });
    }
    j_check({
        assignmentEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) { //forceState forces the check to be true/false
        let pHighlight=assignmentEl.classList.contains('highlight-green'); //based on classList of assignmentEl
        let newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=assignmentEl.querySelector(`input.j_check_${this.pageType}`);
        let assignmentText=assignmentEl.querySelector('a').innerText;
        
        console.log({newHighlight: newState, pHighlight, checkmarkEl});

        if (newState) { //no highlight green already, so check
            console.log(`Checking ${assignmentText}`);
            //Check
            checkmarkEl.checked=true;
            const highlightGreenEl=this.createHighlightGreenEl({pageType: this.pageType, animate});
            assignmentEl.insertBefore(highlightGreenEl, assignmentEl.firstChild); //insert as first element (before firstElement)
           
            if (storeInChrome) {
                if (this.courseName in this.checkedTasksGlobal) { //already exists, so append
                    this.checkedTasksGlobal[this.courseName].push(assignmentText);
                } else { //not exist, so create course log
                    this.checkedTasksGlobal[this.courseName]=[];
                    this.checkedTasksGlobal[this.courseName].push(assignmentText); //push to newly created class
                }
                this.updateCheckedTasks(this.checkedTasksGlobal);
            }
        } else { //uncheck
            console.log(`Unchecking ${assignmentText}`);
            checkmarkEl.checked=false;
            const highlightGreenEl=assignmentEl.querySelector('.highlight-green'); //removes svg
            assignmentEl.removeChild(highlightGreenEl);
            
            try {
                this.checkedTasksGlobal[this.courseName].pop( //remove checkedTaskGlobal from list
                    this.checkedTasksGlobal[this.courseName].indexOf(assignmentText)
                );
                this.updateCheckedTasks(this.checkedTasksGlobal); //update
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.checkedTasksGlobal[this.courseName].pop(this.checkedTasksGlobal[this.courseName].indexOf(assignmentText));
                    this.updateCheckedTasks(this.checkedTasksGlobal);
                }, 1000);
            }
        }
    }
}

