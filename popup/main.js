const onlyShowOnHoverEl=document.getElementById('onlyShowOnHover');
const overdueCollapsed=document.getElementById('overdueCollapsed');
const showCheckmarksValues={ //enum of valid values
    always: 'always',
    onHover: 'onHover'
};

const betaEnabledEl=document.getElementById('betaEnabled');

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

    if (data.settings.betaEnabled) { //if betaEnabled
        betaEnabledEl.checked=true;
        enableBeta();        
    } else {
        betaEnabledEl.checked=false;
    }
})();

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

let betaEnabledEventListeners=[];

function enableBeta() {
    // Reveal elements
    let betaEls=document.getElementsByClassName('beta');
    for (let i=0; i<betaEls.length; i++)
        betaEls[i].style.display='block';
    
    // Add event listeners to beta elements
    //check all assignments
    document.getElementById('checkAll').addEventListener('click', ()=>{
        sendMessage({run: 'check all assignments'});
    })
    //check all assignments before today
    document.getElementById('checkAllBeforeToday').addEventListener('click', ()=>{
        sendMessage({run: 'check all assignments before today'});
    })
}

betaEnabledEl.addEventListener('change', async ()=>{
    let currentStatus=betaEnabledEl.checked;
    if (currentStatus)
        enableBeta();
    let data=await chrome.storage.sync.get();
    data.settings.betaEnabled=currentStatus;
    chrome.storage.sync.set(data);
    if (!currentStatus) {
        setTimeout(()=>{ //after some time for chrome.sync to work
            location.reload(); //reload for new DOM render
        }, 500);
    }
})


//Uncheck all (reset) Button
document.getElementById('resetBtn').addEventListener('click', async e=>{
    let data=await chrome.storage.sync.get(); //current settings
    data.checkedTasks={}; //makes checkedTasks empty but keeps settings
    chrome.storage.sync.set(data);
    sendMessage({run: 'reload'}); //reload page for changes to show
});


//Functionality
function sendMessage(msg) {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
        let activeTab=tabs[0];
        chrome.tabs.sendMessage(activeTab.id, msg);
    });
}