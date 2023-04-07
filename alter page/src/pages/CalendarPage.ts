import SchoologyPage from './SchoologyPage';

export default class CalendarPage extends SchoologyPage {
    constructor() {
        super({
            pageType: 'cal',
            getAsgmtByNamePathEl: 'span.fc-event-title>span',
            infoToBlockEl: el=>(el.parentNode!.parentNode!.parentNode as HTMLElement),
            limits: {
                courses: '$all',
                time: 'any'
            }
        });

        this.addCheckmarks({
            asgmtElContainer: (document.querySelector('div.fc-event>div.fc-event-inner') as HTMLDivElement).parentNode!.parentNode,
            customMiddleScript: (checkEl, asgmtEl)=>{
                jQuery(checkEl).on('click', e=>e.stopPropagation()); //prevent asgmt dialog from opening when clicking checkmark
            },
            locateElToAppendCheckmarkTo: el=>el
        });

        //When changing months, reload page

        //Revives when checkmarks disappear due to asgmts re-render (such as when window resized or added a personal asgmt)
        setInterval(()=>{
            if (!document.querySelector('.j_check_cal')) //checkmarks don't exist anymore
                new CalendarPage; //revive checkmarks
                //alternative: window.location.reload()
        }, 300);
    }

    checkAllAsgmts() {
        const elementsByDate=jQuery(`span[class*='day-']`);
        for (const el of elementsByDate) {
            const asgmtEl=el.parentNode!.parentNode!.parentNode!.parentNode!.parentNode!.parentNode as HTMLElement;
            if (asgmtEl!=null)
                this.j_check({
                    asgmtEl,
                    forcedState: true,
                    options: {
                        storeInChrome: true
                    }
                }); //forcedState is true
        }
    }

    checkAllAsgmtsBeforeToday() {
        const elementsByDate=jQuery(`span[class*='day-']`);
        const today=new Date().getDate();
        for (const el of elementsByDate) {
            const dayOfEl=parseInt(el.className.slice(-2))
            const beforeToday=dayOfEl<today;

            if (beforeToday) { //before today
                const asgmtEl=el.parentNode!.parentNode!.parentNode!.parentNode!.parentNode!.parentNode as HTMLElement;
                if (asgmtEl!=null)
                    this.j_check({ //forcedState is true
                        asgmtEl,
                        forcedState: true,
                        options: {
                            storeInChrome: true
                        }
                    });
            }
        }
    }
    j_check({
        asgmtEl,
        forcedState=null,
        options: {
            storeInChrome=true,
            animate=false //shows animation when checking
        }
    }: {
        asgmtEl: HTMLElement;
        forcedState?: boolean | null;
        options: {
            storeInChrome?: boolean;
            animate?: boolean;
        }
    }) { //checks/unchecks passed in element
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior asgmts from storage. is true all other times
        const pHighlight=asgmtEl.querySelector('.highlight-green'); //based on item inside asgmt
        const checkmarkEl=asgmtEl.querySelector(`input.j_check_${this.pageType}`) as HTMLInputElement;
        const asgmtText=(asgmtEl.querySelector('.fc-event-inner>.fc-event-title>span') as HTMLSpanElement).firstChild!.nodeValue; //only value of asgmt (firstChild), not including inside grandchildren like innerText()
        const courseName=(asgmtEl.querySelector(`.fc-event-inner>.fc-event-title span[class*='realm-title']`) as HTMLSpanElement).innerText; /* most child span can have class of realm-title-user or realm-title-course based on whether or not it is a personal event */
        const newState=forcedState ?? pHighlight==null; //if user forced state, override newHighlight

        if (newState) { //no highlight green already
            console.log('<hw>', `Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked=true;
            const highlightGreenEl=this.createGreenHighlightEl({pageType: this.pageType, animate});
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstElement)
            
            if (storeInChrome)
                this.addAsgmt(courseName, asgmtText, {createCourseIfNotExist: true });
        } else {
            console.log('<hw>', `Unchecking ${asgmtText}`);
            //Uncheck
            checkmarkEl.checked=false;
            asgmtEl.removeChild(pHighlight);
            
            // coursesGlobal.pop(coursesGlobal.indexOf(asgmtText));
            this.removeAsgmt(courseName, asgmtText);
        }
    }
}
