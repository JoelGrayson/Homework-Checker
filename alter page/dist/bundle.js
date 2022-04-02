(()=>{"use strict";var e={935:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.removeSpaces=void 0,t.removeSpaces=function(e){let t="";for(let s of e)" "!==s&&(t+=s);return t}},667:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const o=s(254),n=s(935);class l extends o.default{constructor(){function e(){let e,t=document.querySelector(".fc-header-title").innerText,[s,o]=t.split(" ");switch(s){case"January":e="01";break;case"February":e="02";break;case"March":e="03";break;case"April":e="04";break;case"May":e="05";break;case"June":e="06";break;case"July":e="07";break;case"August":e="08";break;case"September":e="09";break;case"October":e="10";break;case"November":e="11";break;case"December":e="12";break;default:console.error("Unknown month?",s)}let n=`${o}-${e}`;console.log({dateURL:n});let l=`${window.location.pathname.match(/(.*\/)\d{4}-\d{2}/)[1]}${n}`;window.location.pathname=l}super({pageType:"cal",getAsgmtByNamePathEl:"span.fc-event-title>span",infoToBlockEl:e=>e.parentNode.parentNode.parentNode,limits:{courses:"$all",time:"any"}}),this.addCheckmarks({asgmtElContainer:document.querySelector("div.fc-event>div.fc-event-inner").parentNode.parentNode,customMiddleScript:(e,t)=>{jQuery(e).on("click",(e=>{e.stopPropagation()}))},locateElToAppendCheckmarkTo:e=>e}),document.querySelector("span.fc-button-prev").addEventListener("click",e),document.querySelector("span.fc-button-next").addEventListener("click",e),setInterval((()=>{document.querySelector(".j_check_cal")||new l}),300)}checkAllAsgmtEl(){let e=jQuery("span[class*='day-']");for(let t of e){let e=t.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;null!=e&&this.j_check({asgmtEl:e,forcedState:!0,options:{storeInChrome:!0}})}}checkAllAsgmtElBeforeToday(){let e=jQuery("span[class*='day-']"),t=(new Date).getDate();for(let s of e)if(parseInt(s.className.slice(-2))<t){let e=s.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;null!=e&&this.j_check({asgmtEl:e,forcedState:!0,options:{storeInChrome:!0}})}}j_check({asgmtEl:e,forcedState:t=null,options:{storeInChrome:s=!0,animate:o=!1}}){let l=e.querySelector(".highlight-green");const r=e.querySelector(`input.j_check_${this.pageType}`);let c=e.querySelector(".fc-event-inner>.fc-event-title>span").firstChild.nodeValue;const a=(0,n.removeSpaces)(e.querySelector(".fc-event-inner>.fc-event-title span[class*='realm-title']").innerText);if(null!=t?t:null==l){console.log(`Checking ${c}`),r.checked=!0;const t=this.createGreenHighlightEl({pageType:this.pageType,animate:o});e.insertBefore(t,e.firstChild),s&&(a in this.coursesGlobal||(this.coursesGlobal[a].checked=[]),this.coursesGlobal[a].checked.push(c),this.updateCheckedTasks(this.coursesGlobal))}else console.log(`Unchecking ${c}`),r.checked=!1,e.removeChild(l),this.coursesGlobal[a].checked.pop(this.coursesGlobal[a].checked.indexOf(c)),this.updateCheckedTasks(this.coursesGlobal)}}t.default=l},665:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const o=s(254),n=s(935);class l extends o.default{constructor(e){let t="#course-events .upcoming-list .upcoming-events .upcoming-list",s=document.querySelector("#center-top>.page-title").innerText;s=(0,n.removeSpaces)(s),super({pageType:"course",getAsgmtByNamePathEl:`${t}>div[data-start]`,infoToBlockEl:e=>e,limits:{courses:s,time:"any"}}),this.courseId=e,this.courseName=s,this.addCheckmarks({asgmtElContainer:document.querySelector(t),customMiddleScript:(e,t)=>{if(t.classList.contains("date-header"))return"continue"},locateElToAppendCheckmarkTo:e=>e.firstChild})}j_check({asgmtEl:e,forcedState:t=null,options:{storeInChrome:s=!0,animate:o=!1}}){const n=!!e.querySelector(".highlight-green"),l=null!=t?t:!n,r=e.querySelector(`input.j_check_${this.pageType}`),c=e.querySelector("a").innerText;if(console.log({newHighlight:l,pHighlight:n,checkmarkEl:r}),l){console.log(`Checking ${c}`),r.checked=!0;const t=this.createGreenHighlightEl({pageType:this.pageType,animate:o});e.style.position="relative",e.querySelector("h4").style.position="relative",e.insertBefore(t,e.firstChild),s&&(this.courseName in this.coursesGlobal||(this.coursesGlobal[this.courseName]=[]),this.coursesGlobal[this.courseName].push(c),this.updateCheckedTasks(this.coursesGlobal))}else{console.log(`Unchecking ${c}`),r.checked=!1;const t=e.querySelector(".highlight-green");t.parentNode.removeChild(t);try{this.coursesGlobal[this.courseName].pop(this.coursesGlobal[this.courseName].indexOf(c)),this.updateCheckedTasks(this.coursesGlobal)}catch(e){console.error(e),setTimeout((()=>{this.coursesGlobal[this.courseName].pop(this.coursesGlobal[this.courseName].indexOf(c)),this.updateCheckedTasks(this.coursesGlobal)}),1e3)}}}}t.default=l},192:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0});const o=s(254),n=s(492),l=s(935);class r extends o.default{constructor({containerSelectors:e}){super({pageType:"home",getAsgmtByNamePathEl:e.map((e=>`${e}>div`)),infoToBlockEl:e=>e,limits:{courses:"$all",time:"any"},multipleAsgmtContainers:!0}),(0,n.default)();for(let t of e){let e="h4>span",s="j_check_container";this.addCheckmarks({asgmtElContainer:document.querySelector(t),customMiddleScript:(t,o)=>{if(o.classList.contains("date-header"))return"continue";{let t=document.createElement("span");t.classList.add(s);let n=o.querySelector(e);n.insertBefore(t,n.querySelector("span.upcoming-time"))}},locateElToAppendCheckmarkTo:t=>t.querySelector(`${e} span.${s}`)})}}j_check({asgmtEl:e,forcedState:t=null,options:{storeInChrome:s=!0,animate:o=!1}}){console.log({asgmtEl:e});const n=!!e.querySelector(".highlight-green"),r=null!=t?t:!n,c=e.querySelector(`input.j_check_${this.pageType}`),a=e.querySelector("a").innerText,i=(0,l.removeSpaces)(e.querySelector("h4>span").ariaLabel);if(r){console.log(`Checking '${a}'`),c.checked=!0;const t=this.createGreenHighlightEl({pageType:this.pageType,animate:o}),n=e.querySelector("h4");e.querySelector("h4>span").style.position="relative",n.insertBefore(t,n.firstChild),s&&(i in this.coursesGlobal||(this.coursesGlobal[i].checked=[]),this.coursesGlobal[i].checked.push(a),this.updateCheckedTasks(this.coursesGlobal))}else{console.log(`Unchecking '${a}'`),c.checked=!1;const t=e.querySelector(".highlight-green");t.parentNode.removeChild(t);try{this.coursesGlobal[i].checked.pop(this.coursesGlobal[i].checked.indexOf(a)),this.updateCheckedTasks(this.coursesGlobal)}catch(e){console.error(e),setTimeout((()=>{this.coursesGlobal[i].checked.pop(this.coursesGlobal[i].checked.indexOf(a)),this.updateCheckedTasks(this.coursesGlobal)}),1e3)}}}}t.default=r},254:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=class{constructor({pageType:e,getAsgmtByNamePathEl:t,infoToBlockEl:s,limits:o,ignoreOldAsgmts:n=!0,multipleAsgmtContainers:l=!1}){console.log({pageType:e,getAsgmtByNamePathEl:t,infoToBlockEl:s,limits:o,ignoreOldAsgmts:n,multipleAsgmtContainers:l}),chrome.storage.sync.get("settings",(({settings:e})=>{if("onHover"===e.showCheckmarks){console.log("Only show checkmark on hover");let e=document.createElement("style");e.innerHTML="\n                    .j_check_cal {\n                        visibility: hidden; /* all input checks hidden */\n                    }\n                    .fc-event:hover .j_check_cal { /* input check shown onhover of asgmt */\n                        visibility: visible;\n                    }\n                ",document.head.appendChild(e)}})),this.pageType=e,this.multipleAsgmtContainers=l,this.getAsgmtByNamePathEl=t,this.infoToBlockEl=s,this.ignoreOldAsgmts=n,chrome.runtime.onMessage.addListener(((e,t,s)=>{if(e.hasOwnProperty("run"))switch(e.run){case"reload":location.reload();break;case"check all asgmts":this.checkAllAsgmtEl();break;case"check all asgmts before today":this.checkAllAsgmtElBeforeToday();break;default:console.error("Unknown run message:",e.run)}})),chrome.storage.sync.get("courses",(({courses:e})=>{if(this.coursesGlobal=e,console.log("courses",e),console.log(o),"$all"===o.courses&&"any"===o.time)for(let t of e){let e=t.checked;for(let t of e){let[e,s]=this.getAsgmtByName(t);"No matches"!==e&&this.j_check({asgmtEl:s,options:{storeInChrome:!1}})}}else if("$all"===o.courses&&"future"===this.time);else if("$all"!==o.courses&&"any"===this.time&&(console.log(`Only checking the course: ${this.courses}`),e in this.coursesGlobal)){let e=this.coursesGlobal[this.courses];console.log("Asgmts",e);for(let t of e){let[e,s]=this.getAsgmtByName(t);"No matches"!==e&&this.j_check({asgmtEl:s,options:{storeInChrome:!1}})}}}))}checkAllAsgmtEl(){throw new Error("Method not implemented.")}checkAllAsgmtElBeforeToday(){throw new Error("Method not implemented.")}addCheckmarks({asgmtElContainer:e,customMiddleScript:t,locateElToAppendCheckmarkTo:s}){let o=e.children;for(let e of o){let o=document.createElement("input");o.className=`j_check_${this.pageType}`,o.type="checkbox",o.addEventListener("change",(()=>{this.j_check({asgmtEl:e,options:{storeInChrome:!0,animate:!0}})})),"continue"!==t(o,e)&&s(e).appendChild(o)}}getAsgmtByName(e){let t,s,o;if(console.log(e,this.multipleAsgmtContainers),this.multipleAsgmtContainers){for(let o of this.getAsgmtByNamePathEl)if(t=`${o}:contains('${e.replaceAll("'","\\'")}')`,s=jQuery(t),s.length>0)break}else t=`${this.getAsgmtByNamePathEl}:contains('${e.replaceAll("'","\\'")}')`,s=jQuery(t);if(1===s.length)o=s[0];else{if(!(s.length>=2))return this.ignoreOldAsgmts||console.error(`No elements matched ${e}`,{errorInfo:{getAsgmtByNamePathEl:this.getAsgmtByNamePathEl,query:t,queryRes:s,infoEl:o}},"This error may be caused by old asgmts"),["No matches","No matches"];for(let t=0;t<s.length;t++)if(s[t].firstChild.nodeValue===e){o=s[t];break}}return[o,this.infoToBlockEl(o)]}j_check({asgmtEl:e,forcedState:t=null,options:{storeInChrome:s=!0,animate:o=!1}}){}createGreenHighlightEl({pageType:e,animate:t}){const s=document.createElement("div");return s.classList.add("highlight-green"),s.classList.add(`highlight-green-${e}`),s.innerHTML=`\n            <svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 10 10'\n                style='width: 100%; height: 100%; transform: scaleX(-1)'>\n                \x3c!-- Dark Green Background --\x3e\n                <path fill='rgb(115, 252, 127)' d='M 10 0 L 10 10 L 0 10 L 0 0 Z' />\n                \x3c!-- Slash Between Center --\x3e\n                <path stroke='green' d='M 0 0 L 10 10 Z'>\n                ${t?"\x3c!-- Animation notes: at start, no movement. gradually gets faster and faster --\x3e\n                    <animate\n                        attributeName='d'\n                        dur='0.2s'\n                        repeatCount='1'\n                        values='\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L;\n                            M 0 0 L 0.7 0.7 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L 8.39 8.39 L;\n                            M 0 0 L 0.8 0.8 L 1.6 1.6 L 2.5 2.5 L 3.4 3.4 L 4.35 4.35 L 5.31 5.31 L 6.29 6.29 L 7.29 7.29 L 8.39 8.39 L 10 10 L'\n                    />":""}\n                </path>\n                <path stroke='green' d='M 0 0 L 10 10 Z'>\n                    \n                </path>\n            </svg>\n        `,s}updateCheckedTasks(e){console.log("Updating to ",e),chrome.storage.sync.set({checkedTasks:e})}}},492:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){const e="div.overdue-submissions-wrapper";let t=setInterval((()=>{document.querySelector("div.overdue-submissions-wrapper>div.upcoming-list")&&(async function(){function t(){return new Promise(((e,t)=>{chrome.storage.sync.get("settings",(({settings:t})=>{e(t.overdueCollapsed)}))}))}let s=await t();const o=document.querySelector(e+">h3"),n=document.createElement("button");function l(t){document.querySelector(e+">div.upcoming-list").classList.toggle("j_collapsed",t),n.innerText=t?"Show Overdue Assignments":"Hide Overdue Assignments"}n.style.marginLeft="4rem",n.innerText="Hide Overdue Assignments",n.classList.add("j_button"),n.addEventListener("click",(async()=>{const e=!await t();l(e),async function(e){let s=await t(),o=Object.assign({},s);o.overdueCollapsed=e,chrome.storage.sync.set({settings:o})}(e)})),o.appendChild(n),l(s)}(),clearInterval(t))}))}}},t={};function s(o){var n=t[o];if(void 0!==n)return n.exports;var l=t[o]={exports:{}};return e[o](l,l.exports,s),l.exports}(()=>{const e=s(667),t=s(192),o=s(665);function n(e,t=(()=>null!=document.querySelector('.upcoming-list>.refresh-wrapper img[alt="Loading"]'))){let s=setInterval((()=>{t()?console.log("Loading..."):(clearInterval(s),setTimeout((()=>{e()}),10))}),100)}window.addEventListener("load",(function(){if(jQuery.noConflict(),document.querySelectorAll("script[src*='schoology.com']")){const s=document.querySelector("#fcalendar"),l=window.location.pathname.includes("calendar");if(s&&l)!function(){let t=setInterval((()=>{jQuery("#fcalendar>div.fc-content>div.fc-view>div")[0].children.length>=3?(clearInterval(t),console.log("3. Add checkmarks"),new e.default):console.log("Still waiting for calendar events to load")}),200)}();else{let e=window.location.pathname.match(/\/course\/(\d+)\//);if(e){let t=e[1];n((()=>{new o.default(t)}))}else window.location.pathname.includes("home")&&n((()=>{new t.default({containerSelectors:["div.upcoming-events-wrapper>div.upcoming-list","div.overdue-submissions-wrapper>div.upcoming-list"]})}),(()=>!document.querySelector("div.overdue-submissions-wrapper>div.upcoming-list")))}}}),!1)})()})();