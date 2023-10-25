// ==UserScript==
// @name         Convert Timestamp
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Convert Timestamp To Human Readable Form
// @author       Rob Reid
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_openInTab
// @run-at       context-menu
// @require      http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

// debugger;

function translateTime() {
    let sel = window.getSelection().toString();
    let zd = new Date(0);
    try {
        if (sel.length == 13) {
            zd.setMilliseconds(Number(sel));
        } else {
            zd.setSeconds(Number(sel));
        }
        alert("UNIX epoch " + sel + " is: " + zd.toISOString());
    } catch (error) {
        alert("Cannot convert " + sel + " to a time");
    }
}

translateTime();