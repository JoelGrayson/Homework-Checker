import SchoologyPage from './SchoologyPage';

export default class CalendarPage extends SchoologyPage {
    constructor() {
        super({
            pageType: 'cal',
            getAsgmtByNamePathEl: 'span.fc-event-title>span',
            infoToBlockEl: el=>(el.parentNode.parentNode.parentNode as HTMLElement),
            limits: {
                courses: '$all',
                time: 'any'
            }
        });

        this.addCheckmarks({
            asgmtElContainer: document.querySelector('div.fc-event>div.fc-event-inner').parentNode.parentNode,
            customMiddleScript: (checkEl, asgmtEl)=>{
                jQuery(checkEl).on('click', e=>{ //prevent asgmt dialog from opening when clicking checkmark
                    e.stopPropagation();
                });
            },
            locateElToAppendCheckmarkTo: el=>el
        });

        //When changing months, reload page
        document.querySelector('span.fc-button-prev').addEventListener('click', reloadToCorrectMonthURL); //previous month button
        document.querySelector('span.fc-button-next').addEventListener('click', reloadToCorrectMonthURL); //next month button
    
        function reloadToCorrectMonthURL() { //looks at `December 2021` or whatever the date is in text, converts to URL, and reloads page to that URL
            const tempEl=document.querySelector('.fc-header-title')// as HTMLElement;
            let elText=tempEl['innerText'];
            let [monthName, year]=elText.split(' ');
            let month;

            switch (monthName) {
                case 'January': month='01'; break;
                case 'February': month='02'; break;
                case 'March': month='03'; break;
                case 'April': month='04'; break;
                case 'May': month='05'; break;
                case 'June': month='06'; break;
                case 'July': month='07'; break;
                case 'August': month='08'; break;
                case 'September': month='09'; break;
                case 'October': month='10'; break;
                case 'November': month='11'; break;
                case 'December': month='12'; break;
                default: console.error('Unknown month?', monthName)
            }
            
            const dateURL=`${year}-${month}`;

            console.log({dateURL})

            const oldPathname=window.location.pathname.match(/(.*\/)\d{4}-\d{2}/)[1]; //removes last ####-## part of URL
            const newPathname=`${oldPathname}${dateURL}`;
            window.location.pathname=newPathname;
        }

        //Revives when checkmarks disappear due to asgmts re-render (such as when window resized or added a personal asgmt)
        setInterval(()=>{
            if (!document.querySelector('.j_check_cal')) //checkmarks don't exist anymore
                new CalendarPage(); //revive checkmarks
                //alternative: window.location.reload()
        }, 300);
    }

    checkAllAsgmts() {
        const elementsByDate=jQuery(`span[class*='day-']`);
        for (let el of elementsByDate) {
            let asgmtEl=el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
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
        for (let el of elementsByDate) {
            const dayOfEl=parseInt(el.className.slice(-2))
            const beforeToday=dayOfEl<today;

            if (beforeToday) { //before today
                const asgmtEl=el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
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
    }) { //checks/unchecks passed in element
        //storeInChrome indicates whether or not to send request to store in chrome. is false when extension initializing & checking off prior asgmts from storage. is true all other times
        const pHighlight=asgmtEl.querySelector('.highlight-green'); //based on item inside asgmt
        const checkmarkEl=asgmtEl.querySelector(`input.j_check_${this.pageType}`);
        const asgmtText=asgmtEl.querySelector('.fc-event-inner>.fc-event-title>span').firstChild.nodeValue; //only value of asgmt (firstChild), not including inside grandchildren like innerText()
        const courseName=asgmtEl.querySelector(`.fc-event-inner>.fc-event-title span[class*='realm-title']`).innerText; /* most child span can have class of realm-title-user or realm-title-course based on whether or not it is a personal event */
        const newState=forcedState ?? pHighlight==null; //if user forced state, override newHighlight

        if (newState) { //no highlight green already
            console.log(`Checking ${asgmtText}`);
            //Check
            checkmarkEl.checked=true;
            const highlightGreenEl=this.createGreenHighlightEl({pageType: this.pageType, animate});
            asgmtEl.insertBefore(highlightGreenEl, asgmtEl.firstChild); //insert as first element (before firstElement)
            
            if (storeInChrome)
                this.addAsgmt(courseName, asgmtText, {createCourseIfNotExist: true });
        } else {
            console.log(`Unchecking ${asgmtText}`);
            //Uncheck
            checkmarkEl.checked=false;
            asgmtEl.removeChild(pHighlight);
            
            // coursesGlobal.pop(coursesGlobal.indexOf(asgmtText));
            this.removeAsgmt(courseName, asgmtText);
        }
    }
}
