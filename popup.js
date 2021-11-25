document.getElementById('resetBtn').addEventListener('click', e=>{
    chrome.storage.sync.set({checkedTasks: []}); //makes list empty
    chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
        let activeTab=tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {'run': 'reload'});
    });
});