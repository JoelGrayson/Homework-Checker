//Toggles Require Elements to be updated when chrome storage data arrives, so elemnents below
const onlyShowOnHoverEl=document.getElementById('onlyShowOnHover');
const overdueCollapsed=document.getElementById('overdueCollapsed');
const showCheckmarksValues={ //enum of valid values
    always: 'always',
    onHover: 'onHover'
};

//*|| Import data from chrome storage
(async ()=>{ //Assigns switches the proper checked/unchecked values (fetches from chrome storage and reflects changes on switches on/off)
    let data=await chrome.storage.sync.get();
    switch (data.settings.showCheckmarks) {
        case showCheckmarksValues.always:
            onlyShowOnHoverEl.checked=false;
            break;
        case showCheckmarksValues.onHover:
            onlyShowOnHoverEl.checked=true;
            break;
        default:
            throw new Error('Unknown chrome.storage.settings.showCheckmarks value:'+JSON.stringify(data.settings.showCheckmarks)); //JSON.stringify just in case it is an object
    }
    
    overdueCollapsed.checked=data.settings.overdueCollapsed;
    console.log(data.settings.overdueCollapsed)

})();

//*|| Toggle EventListeners
onlyShowOnHoverEl.addEventListener('change', async ()=>{
    let data=await chrome.storage.sync.get(); //get current settings
    data.settings.showCheckmarks=(onlyShowOnHoverEl.checked?showCheckmarksValues.onHover:showCheckmarksValues.always);
    chrome.storage.sync.set(data);

    sendMessage({run: 'reload'}); //reloads when checking
});

overdueCollapsed.addEventListener('change', async ()=>{
    let data=await chrome.storage.sync.get(); //get current settings
    data.settings.overdueCollapsed=!!overdueCollapsed.checked;
    chrome.storage.sync.set(data);

    sendMessage({run: 'reload'}); //reloads when checking
});

//*|| Button EventListeners
//Check all asgmts
document.getElementById('checkAll').addEventListener('click', ()=>{
    sendMessage({run: 'check all asgmts'});
});

//Uncheck all (reset) Button
document.getElementById('resetBtn').addEventListener('click', async e=>{
    let data=await chrome.storage.sync.get(); //current settings
    data.courses={}; //makes courses empty but keeps settings
    chrome.storage.sync.set(data);
    sendMessage({run: 'reload'}); //reload page for changes to show
});

//check all asgmts before today
document.getElementById('checkAllBeforeToday').addEventListener('click', ()=>{
    sendMessage({run: 'check all asgmts before today'});
});



//*|| Functionality
function sendMessage(msg) {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
        let activeTab=tabs[0];
        chrome.tabs.sendMessage(activeTab.id, msg);
    });
}