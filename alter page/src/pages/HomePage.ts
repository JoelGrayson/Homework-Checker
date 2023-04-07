import SchoologyPage from './SchoologyPage';
import collapseOverdue from './collapseOverdue';

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

        if (!document.querySelector('.j_collapse-button')) //only add button if not already existing
            collapseOverdue();

        for (let containerSelector of containerSelectors) {
            let selector=`h4>span`;
            let containerClass='j_check_container';
            this.addCheckmarks({
                asgmtElContainer: document.querySelector(containerSelector),
                customMiddleScript: (checkEl, asgmtEl)=>{
                    if (asgmtEl.classList.contains('date-header')) return 'continue';
                    // Valid assignmment
                    let jCheckContainer=document.createElement('span');
                    jCheckContainer.classList.add(containerClass);
                    let parentNode=asgmtEl.querySelector(selector);
                    // ERROR: parentNode is none
                    console.log('<hw>', {parentNode});
                    parentNode.insertBefore(jCheckContainer, parentNode.querySelector('span.upcoming-time'));
                },
                locateElToAppendCheckmarkTo: el=>el.querySelector(`${selector} span.${containerClass}`),
            });
        }
    
        // Revives when checkmarks disappear or are not there. When loading, sometimes the DOM needs a while to add
        setInterval(()=>{
            if (!document.querySelector('.j_check_home')) //checkmarks don't exist anymore
                new HomePage({containerSelectors}); //revive checkmarks
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
