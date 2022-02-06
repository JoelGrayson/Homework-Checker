class HomePage extends SchoologyPage {
    constructor({containerSelectors}) { //array of selectors (overdue and upcoming)
        super({
            pageType: 'home',
            getAssignmentByNamePathEl: containerSelectors.map(s=>`${s}>div`), //gets div (assignment) inside containerSelector
            infoToBlockEl: el=>el,
            checkPrev: {
                courses: '$all',
                time: 'any'
            },
            multipleAssignmentContainers: true
        });

        collapseOverdue();

        for (let containerSelector of containerSelectors) {
            let selector=`h4>span`;
            let containerClass='j_check_container';
            this.addCheckmarks({
                assignmentsContainer: document.querySelector(containerSelector),
                customMiddleScript: (checkEl, assignmentEl)=>{
                    if (assignmentEl.classList.contains('date-header'))
                        return 'continue';
                    else { //valid assignmment
                        let jCheckContainer=document.createElement('span');
                        jCheckContainer.classList.add(containerClass);
                        let parentNode=assignmentEl.querySelector(selector);
                        parentNode.insertBefore(jCheckContainer, parentNode.querySelector('span.upcoming-time'));
                    }
                },
                locateElToAppendCheckmarkTo: el=>el.querySelector(`${selector} span.${containerClass}`),
            });
        }
    }
    j_check({
        assignmentEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) {
        console.log({assignmentEl})
        const pHighlight=!!assignmentEl.querySelector('.highlight-green'); //based on classList of assignmentEl
        const newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=assignmentEl.querySelector(`input.j_check_${this.pageType}`);
        const assignmentText=assignmentEl.querySelector('a').innerText;
        let courseText=assignmentEl.querySelector('h4>span').ariaLabel; //name of course based on aria-label of assignmentEl's <h4>'s <span>'s <div>
        courseText=removeSpaces(courseText);
        // console.log({courseText, assignmentEl});

        if (newState) { //check
            console.log(`Checking '${assignmentText}'`);

            checkmarkEl.checked=true;
            const highlightGreenEl=this.createHighlightGreenEl({pageType: this.pageType, animate});
            const parent=assignmentEl.querySelector('h4');
            parent.insertBefore(highlightGreenEl, parent.firstChild); //insert as first element (before firstElement)
            assignmentEl.querySelector('h4>span').style.position='relative'; //so that text above checkmark
           
            if (storeInChrome) {
                if (courseText in this.checkedTasksGlobal) { //already exists, so append
                    this.checkedTasksGlobal[courseText].push(assignmentText);
                } else { //not exist, so create course log
                    this.checkedTasksGlobal[courseText]=[];
                    this.checkedTasksGlobal[courseText].push(assignmentText); //push to newly created class
                }
                this.updateCheckedTasks(this.checkedTasksGlobal);
            }
        } else { //uncheck
            console.log(`Unchecking '${assignmentText}'`);
            checkmarkEl.checked=false;
            const toRemove=assignmentEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            
            try {
                this.checkedTasksGlobal[courseText].pop( //remove checkedTaskGlobal from list
                    this.checkedTasksGlobal[courseText].indexOf(assignmentText)
                );
                this.updateCheckedTasks(this.checkedTasksGlobal); //update
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.checkedTasksGlobal[courseText].pop(this.checkedTasksGlobal[courseText].indexOf(assignmentText));
                    this.updateCheckedTasks(this.checkedTasksGlobal);
                }, 1000);
            }
        }
    }
}