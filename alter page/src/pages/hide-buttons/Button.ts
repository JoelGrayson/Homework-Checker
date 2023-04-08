type selector=string;

export default class HideButton {
    buttonEl: HTMLButtonElement;
    buttonInjectedAt: selector;
    elementToHide: selector;
    settingsProperty: string; //name of the settings property that stores whether or not the element is hidden

    constructor(props: { elementToHide: selector; buttonInjectedAt: selector; settingsProperty: string }) {
        this.elementToHide=props.elementToHide;
        this.buttonInjectedAt=props.buttonInjectedAt;
        this.settingsProperty=props.settingsProperty;

        this.injectWhenReady()
            .then(async ()=>{
                const initialVal=await this.getCollapsedSetting();
                this.renderBtn();
                this.renderAssignments(initialVal); //initial call
            });
    }
    
    async injectWhenReady() {
        return new Promise<void>((resolve, reject)=>{
            const intervalId=setInterval(()=>{
                const ready=!!document.querySelector(this.elementToHide);
                if (ready) {
                    clearInterval(intervalId);
                    resolve();
                }
            });
        });
    }

    getCollapsedSetting() {
        return new Promise((resolve)=>{
            chrome.storage.sync.get('settings', ({settings})=>{
                resolve(settings[this.settingsProperty]);
            });
        });
    }

    async setCollapsedSetting(newVal) {
        const settings=await chrome.storage.sync.get('settings');
        settings[this.settingsProperty]=newVal;
        chrome.storage.sync.set({ settings });
    }
    
    renderBtn() {
        if (this.buttonEl) return console.log('<hw>', 'Tried to re-render twice'); //do not re-render twice

        const container=document.querySelector(this.buttonInjectedAt) as HTMLHeadingElement;
            const collapseBtn=document.createElement('button');
            collapseBtn.innerText='Hide';
            collapseBtn.classList.add('j_button');
            collapseBtn.classList.add('j_collapse-button');
            collapseBtn.addEventListener('click', async ()=>{
                const newVal=!(await this.getCollapsedSetting()); //opposite of oldVal
                this.renderAssignments(newVal);
                this.setCollapsedSetting(newVal);
            });
            this.buttonEl=collapseBtn;
        container.appendChild(collapseBtn);
    }
    
    renderAssignments(newVal) { //whether or not the assignments list is shown
        const asgmtsEl=document.querySelector(this.elementToHide);
        asgmtsEl.classList.toggle('j_collapsed', newVal); //class if newVal
        this.buttonEl.innerText=newVal ? 'Show' : 'Hide';
    }
}
