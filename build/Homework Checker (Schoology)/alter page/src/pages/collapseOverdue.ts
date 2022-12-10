export default function collapseOverdue() { //sets up
    const overdueWrapperPath=`div.overdue-submissions-wrapper`;

    let intervalId=setInterval(()=>{
        let ready=!!document.querySelector('div.overdue-submissions-wrapper>div.upcoming-list');
        if (ready) {
            init();
            clearInterval(intervalId);
        }
    })

    async function init() {
        function get() {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get('settings', ({settings})=>{
                    resolve(settings.overdueCollapsed);
                })
            })
        }
        async function set(newVal) {
            let oldSettings: any=await get();
            let newSettings={...oldSettings};
            newSettings.overdueCollapsed=newVal;
            chrome.storage.sync.set({
                settings: newSettings
            });
        }
    
        const initialVal=await get();
    
        const container=document.querySelector(overdueWrapperPath+'>h3') as HTMLHeadingElement;
        const collapseBtn=document.createElement('button');
            collapseBtn.style.marginLeft='4rem'; //distance between text
            collapseBtn.innerText='Hide Overdue Assignments';
            collapseBtn.classList.add('j_button');
            collapseBtn.classList.add('j_collapse-button');
            collapseBtn.addEventListener('click', async ()=>{
                const newVal=!(await get()); //opposite of oldVal
                rerenderCollapseBtn(newVal);
                set(newVal);
            });
        container.appendChild(collapseBtn);
    
        rerenderCollapseBtn(initialVal); //initial call
    
        function rerenderCollapseBtn(newVal) {
            const asgmtsEl=document.querySelector(overdueWrapperPath+'>div.upcoming-list');
            asgmtsEl.classList.toggle('j_collapsed', newVal); //class if newVal
            collapseBtn.innerText=newVal?'Show Overdue Assignments':'Hide Overdue Assignments';
        }
    }
}
