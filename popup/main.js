const onlyShowOnHoverEl=document.getElementById('onlyShowOnHover');
const betaEnabledEl=document.getElementById('betaEnabled');

(async ()=>{ //Check the click if true or not
    let data=await chrome.storage.sync.get();
    switch (data.settings.showCheckmarks) {
        case 'always':
            onlyShowOnHoverEl.checked=false;
            break;
        case 'hover':
            onlyShowOnHoverEl.checked=true;
            break;
        default:
            throw new Error('Unknown chrome.storage.settings.showCheckmarks value:', data.settings.showCheckmarks);
    }

    if (data.settings.betaEnabled) { //if betaEnabled
        betaEnabledEl.checked=true;
        enableBeta();        
    } else {
        betaEnabledEl.checked=false;
    }
})();

onlyShowOnHoverEl.addEventListener('change', async ()=>{
    let data=await chrome.storage.sync.get(); //get current settings
    data.settings.showCheckmarks=(onlyShowOnHoverEl.checked?'onHover':'always');
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
    location.reload(); //reload for new DOM render
})


//Reset Button
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