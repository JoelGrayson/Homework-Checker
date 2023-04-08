import SchoologyPage from './SchoologyPage';
import hideOverdue from './hide-buttons/hideOverdue';
import hideRecentlyCompleted from './hide-buttons/hideRecentlyCompleted';

const containerSelectors=[
    '#overdue-submissions>div.upcoming-list', //overdue asgmts
    '.upcoming-submissions-wrapper>div.upcoming-list', //upcoming asgmts
    '#upcoming-events>div.upcoming-list', //upcoming events
];

export default class HomePage extends SchoologyPage {
    constructor() { //array of selectors (overdue and upcoming)
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

        if (!document.querySelector('.j_collapse-button')) { //only add button if not already existing
            hideOverdue();
            hideRecentlyCompleted();
        }

        for (const containerSelector of containerSelectors) {
            const selector=`h4>span`;
            const containerClass='j_check_container';
            this.addCheckmarks({
                asgmtElContainer: document.querySelector(containerSelector),
                customMiddleScript: (checkEl, asgmtEl)=>{
                    if (asgmtEl.classList.contains('date-header')) return 'continue';
                    
                    // Valid assignmment
                    const jCheckContainer=document.createElement('span');
                    jCheckContainer.classList.add(containerClass);
                    const parentNode=asgmtEl.querySelector(selector);
                    if (parentNode) //sometimes, the selector selects non-assignments
                        parentNode.insertBefore(jCheckContainer, parentNode.querySelector('span.upcoming-time'));
                    else //tell SchoologyPage to skip this element
                        return 'continue';
                },
                locateElToAppendCheckmarkTo: el=>el.querySelector(`${selector} span.${containerClass}`),
            });
        }
    
        // Revives when checkmarks disappear or are not there. When loading, sometimes the DOM needs a while to add
        setInterval(()=>{
            if (!document.querySelector('.j_check_home')) //checkmarks don't exist anymore
                new HomePage; //revive checkmarks
        }, 300);
    }

    j_check({
        asgmtEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }) {
        console.log('<hw>', {asgmtEl});
        const pHighlight=!!asgmtEl.querySelector('.highlight-green'); //based on classList of asgmtEl
        const newState=forcedState ?? !pHighlight; //opposite when checking

        const checkmarkEl=asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        
        const tempAnchor=asgmtEl.querySelector('a') as HTMLAnchorElement;
        const asgmtText: string=tempAnchor.innerText;
        const courseName=(asgmtEl.querySelector('h4>span').ariaLabel); //name of course based on aria-label of asgmtEl's <h4>'s <span>'s <div>
            // differs from courseName on calendar, so use space-less version for comparison

        if (newState) { //check
            console.log('<hw>', `Checking '${asgmtText}'`);

            checkmarkEl.checked=true;
            const highlightGreenEl=this.createGreenHighlightEl({pageType: this.pageType, animate});
            const parent=asgmtEl.querySelector('h4') as HTMLHeadingElement;
            asgmtEl.querySelector('h4>span').style.position='relative'; //so that text above checkmark
            parent.insertBefore(highlightGreenEl, parent.firstChild); //insert as first element (before firstElement)
           
            if (storeInChrome)
                this.addAsgmt(courseName, asgmtText, {createCourseIfNotExist: true});
        } else { //uncheck
            console.log('<hw>', `Unchecking '${asgmtText}'`);
            checkmarkEl.checked=false;
            const toRemove=asgmtEl.querySelector('.highlight-green');
            toRemove.parentNode.removeChild(toRemove);
            
            try {
                this.removeAsgmt(courseName, asgmtText);
            } catch (err) {
                console.error(err);
                setTimeout(()=>{ //do same thing a second later
                    this.removeAsgmt(courseName, asgmtText);
                }, 1000);
            }
        }
    }
}
