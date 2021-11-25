function checkIfPageIsSchoology() {
    const hasSchoologyScripts=document.querySelectorAll('script[src*="schoology.com"]'); //schoology page
    const hasCalendar=document.querySelector('#fcalendar'); //calendar page
    const urlHasCalendar=window.location.href.includes('calendar');
    return hasSchoologyScripts && hasCalendar && urlHasCalendar;
}
console.log('Extension running');
if (checkIfPageIsSchoology()) { //inject script only if page is schoology
    console.log('Page is schoology');
}