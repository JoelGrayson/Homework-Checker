const onlyShowOnHoverEl=document.getElementById('onlyShowOnHover');

(async ()=>{ //Check the click if true or not
    let data=await chrome.storage.sync.get();
    if (data.settings.showCheckmarks==='always')
        onlyShowOnHoverEl.checked=false;
    else if (data.settings.showCheckmarks==='onHover')
        onlyShowOnHoverEl.checked=true;
    else
        throw new Error('Unknown chrome.storage.settings.showCheckmarks value:', data.settings.showCheckmarks);
})();

onlyShowOnHoverEl.addEventListener('change', async e=>{
    let data=await chrome.storage.sync.get(); //get current settings
    data.settings.showCheckmarks=(onlyShowOnHoverEl.checked?'onHover':'always');
    chrome.storage.sync.set(data);

    sendMessage({run: 'reload'});
});


//check all assignments
document.getElementById('checkAll').addEventListener('click', ()=>{
    sendMessage({run: 'check all assignments'});
})
//check all assignments before today
document.getElementById('checkAllBeforeToday').addEventListener('click', ()=>{
    sendMessage({run: 'check all assignments before today'});
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