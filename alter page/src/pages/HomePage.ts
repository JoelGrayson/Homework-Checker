import SchoologyPage from './SchoologyPage.js';
import collapseOverdue from './collapseOverdue.js';
import { removeSpaces } from '../functions.js';


export default class HomePage extends SchoologyPage {
    constructor({containerSelectors}) { //array of selectors (overdue and upcoming)
        super({
            pageType: 'home',
            getAsgmtByNamePathEl: containerSelectors.map(s=>`${s}>div`), //gets div (asgmt) inside containerSelector
            infoToBlockEl: el=>el,
            limits: {
                courses: '$all',
                time: 'any'
            },
            multipleAsgmtContainers: true
        });

        collapseOverdue();

        for (let containerSelector of containerSelectors) {
            let selector=`h4>span`;
            let containerClass='j_check_container';
            this.addCheckmarks({
                asgmtElContainer: document.querySelector(containerSelector),
                customMiddleScript: (checkEl, asgmtEl)=>{
                    if (asgmtEl.classList.contains('date-header'))
                        return 'continue';
                    else { //valid assignmment
                        let jCheckContainer=document.createElement('span');
                        jCheckContainer.classList.add(containerClass);
                        let parentNode=asgmtEl.querySelector(selector);
                        parentNode.insertBefore(jCheckContainer, parentNode.querySelector('span.upcoming-time'));
                    }
                },
                locateElToAppendCheckmarkTo: el=>el.querySelector(`${selector} span.${containerClass}`),
            });
        }
    }
    j_check({
        asgmtEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) {
        console.log({asgmtEl})
        const pHighlight=!!asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
        const newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const asgmtText: string=asgmtEl.querySelector('a').innerText;
        const courseText=removeSpaces(asgmtEl.querySelector('h4>span').ariaLabel); //name of course based on aria-label of asgmtEl's <h4>'s <span>'s <div>
        // console.log({courseText, asgmtEl});

        if (newState) { //check
            console.log(`Checking '${asgmtText}'`);

            checkmarkEl.checked=true;
            const highlightGreenEl=this.createGreenHighlightEl({pageType: this.pageType, animate});
            const parent=asgmtEl.querySelector('h4') as HTMLHeadingElement;
            asgmtEl.querySelector('h4>span').style.position='relative'; //so that text above checkmark
            parent.insertBefore(highlightGreenEl, parent.firstChild); //insert as first element (before firstElement)
           
            if (storeInChrome) {
                if (courseText in this.coursesGlobal) { //already exists, so append
                    this.coursesGlobal[courseText].checked.push(asgmtText);
                } else { //not exist, so create course log
                    this.coursesGlobal[courseText].checked=[];
                    this.coursesGlobal[courseText].checked.push(asgmtText); //push to newly created class
                }
                this.updateCheckedTasks(this.coursesGlobal);
            }
        } else { //uncheck
            console.log(`Unchecking '${asgmtText}'`);
            checkmarkEl.checked=false;
            const toRemove=asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            
            try {
                this.coursesGlobal[courseText].checked.pop( //remove checkedTaskGlobal from list
                    this.coursesGlobal[courseText].checked.indexOf(asgmtText)
                );
                this.updateCheckedTasks(this.coursesGlobal); //update
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.coursesGlobal[courseText].checked.pop(this.coursesGlobal[courseText].checked.indexOf(asgmtText));
                    this.updateCheckedTasks(this.coursesGlobal);
                }, 1000);
            }
        }
    }
}