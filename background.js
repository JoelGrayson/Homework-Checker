chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({
        checkedTasks: [] //list of strings of assignments already checked, all other assignments remain unchecked
    });
    setInterval(()=>{
        chrome.storage.sync.get('checkedTasks', ({checkedTasks})=>{
            console.log('checkedTasks', checkedTasks);
        });
    }, 1000)
});