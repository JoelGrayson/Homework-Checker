chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({
        checkedTasks: {} //object with keys of courseNames and values of list of strings of assignments already checked, all other assignments remain unchecked
    });
});

/*
{
    "$class": ["checked assignment 1", "assignment 2"],
    "english": ["read macbeth", "study for grammar quiz"]
}
*/