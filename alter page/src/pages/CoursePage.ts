import SchoologyPage from './SchoologyPage';
import { removeSpaces } from '../functions';

export default class CoursePage extends SchoologyPage { //materials page (one course)
    private courseId: string;
    private courseName: string;
    
    constructor(courseId) {
        const containerPath=`#course-events .upcoming-list .upcoming-events .upcoming-list`;
        const courseName=removeSpaces((document.querySelector('#center-top>.page-title') as HTMLElement).innerText); //grabs course title & removes space

        super({
            pageType: 'course',
            getAsgmtByNamePathEl: `${containerPath}>div[data-start]`, //searches inside asgmt
            infoToBlockEl: el=>el,
            limits: {
                courses: courseName,
                time: 'any'
            }
        });
        
        this.courseId=courseId;
        this.courseName=courseName;

        this.addCheckmarks({
            asgmtElContainer: document.querySelector(containerPath), //all asgmts' container
            customMiddleScript: (checkEl, asgmtEl)=>{
                if (asgmtEl.classList.contains('date-header')) //does not add check to .date-header by continue;ing out of loop
                    return 'continue';
            },
            locateElToAppendCheckmarkTo: el=>el.firstChild
        });

        // Revives when checkmarks disappear or are not there. When loading, sometimes the DOM needs a while to add
        setInterval(()=>{
            if (!document.querySelector('.j_check_course')) //checkmarks don't exist anymore
                new CoursePage(courseId); //revive checkmarks
        }, 500);
    }
    j_check({
        asgmtEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) { //forceState forces the check to be true/false
        const pHighlight=<boolean> asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
        const newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const asgmtText=asgmtEl.querySelector('a').innerText;
        
        console.log('<hw>', {newHighlight: newState, pHighlight, checkmarkEl});

        if (newState) { //no highlight green already, so check
            console.log('<hw>', `Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked=true;
            const highlightGreenEl=this.createGreenHighlightEl({pageType: this.pageType, animate});
            asgmtEl.style.position='relative'; //for green rect to be bound to asgmtEl
            asgmtEl.querySelector('h4').style.position='relative'; //so that text above checkmark
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstChild)
 
            if (storeInChrome)
                this.addAsgmt(this.courseName, asgmtText, {createCourseIfNotExist: true });
        } else { //uncheck
            console.log('<hw>', `Unchecking ${asgmtText}`);
            checkmarkEl.checked=false;
            const toRemove=asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);            

            try {
                this.removeAsgmt(this.courseName, asgmtText);
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.removeAsgmt(this.courseName, asgmtText);
                }, 1000);
            }
        }
    }
}

