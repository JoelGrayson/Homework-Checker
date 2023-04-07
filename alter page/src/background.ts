/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({
        settings: {
            showCheckmarks: 'always', //'onHover' | 'always'
            betaEnabled: false, //shows beta features
            overdueCollapsed: false, //when true, overdue section is collapsed
        },
        courses: [] //array of courses with checked asgmts
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


chrome.runtime.onUpdateAvailable.addListener(details=>{ //update extension and let know updated
    console.log('<hw>', {details});
    chrome.tabs.create({ //create new tab
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