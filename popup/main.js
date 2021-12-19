//Check the click if true or not
(async ()=>{
    let data=await chrome.storage.sync.get();
    document.getElementById('onlyShowOnHover').checked=(data.settings.showCheckmarks==='always')
})()


document.getElementById('onlyShowOnHover').addEventListener('click', async e=>{
    let data=await chrome.storage.sync.get(); //get current settings
    data.settings.showCheckmarks='onHover';
    chrome.storage.sync.set(data);

    sendMessage({run: 'reload'});
});


document.getElementById('resetBtn').addEventListener('click', async e=>{
    let data=await chrome.storage.sync.get(); //current settings
    data.checkedTasks=[]; //makes list empty
    chrome.storage.sync.set(data);

    sendMessage({'run': 'reload'});
});


function sendMessage(msg) {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
        let activeTab=tabs[0];
        chrome.tabs.sendMessage(activeTab.id, msg);
    });
}