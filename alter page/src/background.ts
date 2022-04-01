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
    setInterval(()=>{ //see data
        chrome.storage.sync.get('courses', (data)=>{
            console.log(data.courses);
        })
    }, 3000);
});

chrome.runtime.onUpdateAvailable.addListener(details=>{ //update extension and let know updated
    console.log({details});
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