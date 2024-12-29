/// <reference types="chrome"/>

const VERSION='6.1';

chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.get('settings')
        .then(({ settings })=>{
            const defaultSettings={
                showCheckmarks: 'always', //'onHover' | 'always'
                betaEnabled: false, //shows beta features
                overdueHidden: false, //when true, overdue assignments list is collapsed
                recentlyCompletedHidden: false
            };

            for (const key in defaultSettings) //set 
                if (settings[key]===undefined)
                    settings[key]=defaultSettings[key];

            chrome.storage.sync.set({
                version: VERSION, //for debugging and backwards compatibility perhaps in the future
                settings
            });
        });
    
    chrome.storage.sync.get('courses')
        .then(({ courses })=>{
            if (!Array.isArray(courses)) {
                chrome.storage.sync.set({
                    courses: []
                });
            }
        });

    inspectData();

    function inspectData() {
        setInterval(()=>{ //see data
            chrome.storage.sync.get(null, (data)=>{
                console.log('<hw>', data);
            })
        }, 3000);
    }
});

//also onMessage in SchoologyPage.js
chrome.runtime.onMessage.addListener((message, sender, sendRes)=>{
    console.log('<hw>', {message, sender})
    const data=JSON.parse(message.data);
    if (message.run==='update chrome storage') {
        chrome.storage.sync.set(data, ()=>{
            console.log('<hw>', 'Updated successfully key-value:', data);
            return true;
        });
    }
    return true;
});


// chrome.runtime.onUpdateAvailable.addListener(details=>{ //update extension and let know updated
//     console.log('<hw>', {details});
//     chrome.tabs.create({ //create new tab
//         url: 'onboarding/updated.html'
//     });
//     chrome.runtime.reload();
// });


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