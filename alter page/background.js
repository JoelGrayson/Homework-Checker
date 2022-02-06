chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({
        settings: {
            showCheckmarks: 'always', //'onHover' | 'always'
            betaEnabled: false, //shows beta features
            overdueCollapsed: false, //when true, overdue section is collapsed
        },
        checkedTasks: {} //object with keys of courseNames and values of list of strings of assignments already checked, all other assignments remain unchecked
    });
});
chrome.runtime.onUpdateAvailable.addListener(details=>{ //update extension and let know updated
    console.log({details});
    chrome.tabs.create({ //create new tab
        url: 'onboarding/updated.html'
    });
    chrome.runtime.reload();
});

setInterval(()=>{
    chrome.storage.sync.get('settings', settings=>{
        console.log(settings);
    });
}, 1000);

/*
chrome.storage:
{
    settings: {
        showCheckmarks: 'onHover' | 'always'
    },
    checkedTasks: {
        '$classWithNoSpaces': ['checked assignment 1', 'assignment 2'], //no spaces because removeSpaces()
        'englishII': ['read macbeth', 'study for grammar quiz']
    }
}
*/