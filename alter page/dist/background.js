/// <reference types="chrome"/>
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        settings: {
            showCheckmarks: 'always',
            betaEnabled: false,
            overdueCollapsed: false
        },
        courses: [] //array of courses with checked asgmts
    });
    setInterval(function () {
        chrome.storage.sync.get('courses', function (data) {
            console.log(data.courses);
        });
    }, 3000);
});
chrome.runtime.onUpdateAvailable.addListener(function (details) {
    console.log({ details: details });
    chrome.tabs.create({
        url: 'onboarding/updated.html'
    });
    chrome.runtime.reload();
});
/*
Schema:
{
    settings: {...},
    courses: [
        { //course
            name: 'English II: ENG II - B1',
            noSpacesName: 'EnglishII:ENGII-B1', //for different calendar & home course names
            checked: ['read macbeth', 'study for grammar quiz'], //asgmts
        }
    ]
}
*/ 
