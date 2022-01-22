chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({
        settings: {
            showCheckmarks: 'always', //'onHover' | 'always'
            betaEnabled: false //shows beta features
        },
        checkedTasks: {} //object with keys of courseNames and values of list of strings of assignments already checked, all other assignments remain unchecked
    });
});

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