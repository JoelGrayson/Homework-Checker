class CoursePage extends SchoologyPage { //materials page (one course)
    constructor(courseID) {
        let containerPath=`#course-events .upcoming-list .upcoming-events .upcoming-list`;
        let courseName=document.querySelector('#center-top>.page-title').innerText; //grabs course title
        courseName=removeSpaces(courseName);

        super({
            pageType: 'course',
            getAsgmtByNamePathEl: `${containerPath}>div[data-start]`, //searches inside asgmt
            infoToBlockEl: el=>el,
            checkPrev: {
                courses: courseName,
                time: 'any'
            }
        });
        this.courseID=courseID;
        this.courseName=courseName;

        this.addCheckmarks({
            asgmtElContainer: document.querySelector(containerPath), //all asgmts' container
            customMiddleScript: (checkEl, asgmtEl)=>{
                if (asgmtEl.classList.contains('date-header')) //does not add check to .date-header by continue;ing out of loop
                    return 'continue';
            },
            locateElToAppendCheckmarkTo: el=>el.firstChild
        });
    }
    j_check({
        asgmtEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) { //forceState forces the check to be true/false
        const pHighlight=!!asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
        const newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const asgmtText=asgmtEl.querySelector('a').innerText;
        
        console.log({newHighlight: newState, pHighlight, checkmarkEl});

        if (newState) { //no highlight green already, so check
            console.log(`Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked=true;
            const highlightGreenEl=this.createHighlightGreenEl({pageType: this.pageType, animate});
            asgmtEl.style.position='relative'; //for green rect to be bound to asgmtEl
            asgmtEl.querySelector('h4').style.position='relative'; //so that text above checkmark
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstChild)
 
            if (storeInChrome) {
                if (this.courseName in this.checkedTasksGlobal) { //already exists, so append
                    this.checkedTasksGlobal[this.courseName].push(asgmtText);
                } else { //not exist, so create course log
                    this.checkedTasksGlobal[this.courseName]=[];
                    this.checkedTasksGlobal[this.courseName].push(asgmtText); //push to newly created class
                }
                this.updateCheckedTasks(this.checkedTasksGlobal);
            }
        } else { //uncheck
            console.log(`Unchecking ${asgmtText}`);
            checkmarkEl.checked=false;
            const toRemove=asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);            

            try {
                this.checkedTasksGlobal[this.courseName].pop( //remove checkedTaskGlobal from list
                    this.checkedTasksGlobal[this.courseName].indexOf(asgmtText)
                );
                this.updateCheckedTasks(this.checkedTasksGlobal); //update
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.checkedTasksGlobal[this.courseName].pop(this.checkedTasksGlobal[this.courseName].indexOf(asgmtText));
                    this.updateCheckedTasks(this.checkedTasksGlobal);
                }, 1000);
            }
        }
    }
}

