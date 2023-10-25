// ==UserScript==
// @name         Gmail button to delete individual messages
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add icon to delete individual messages
// @author       Rob Reid
// @match        *://mail.google.com/mail*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

/*
Issues:
- I cannot set @match to *://mail.google.com/mail*inbox*.
  With that it doesn't match any messages.
*/

function countTheStars() {
    'use strict';

    const starContainers = document.getElementsByClassName('gK');
    console.log("found " + starContainers.length + " stars");
};

function findDeleteElement(starNode) {
    /*
    from starNode go up 2 levels to "acZ" tr class member.
    Then find div with class cj. That should be the "Delete this message" div.
    */
     //debugger;
    var parent = starNode.parentElement.parentElement
    // var menu = parent.querySelector('div.T-I.J-J5')
    // want to pick td with class = "gH acX bAm". In the debugger that is listed as "td.gH.acX.bAm".
    // var dtm = parent.querySelector('.cj');
    var dtm = parent.querySelector('.J-N');
    // var dtm = parent.querySelector('div[role="menu"]');
    // menu.click
    console.log("found node cj with contents: " + dtm);
}

function addCommentDiv(node) {
    if (Array.from(node.children).some((c) => c.getAttribute('name') == "trashcan"))
        return;

    var div = document.createElement('div');
    var span = document.createElement('span');
    span.textContent = "I added this!";
    div.setAttribute("name", "trashcan");
    div.appendChild(span);
    node.appendChild(div);

    findDeleteElement(node);
}

updateKeyElements("gK", addCommentDiv);


function updateKeyElements (
    selectorClass,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = document.getElementsByClassName(selectorClass);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorClass);
    // getElementsByClassName doesn't return an actual array.
    targetNodes = Array.from(targetNodes).filter(node => node.classList == selectorClass);
    console.log("found " + targetNodes.length + " nodes");

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */

        // console.log("processing these nodes: " + JSON.stringify(targetNodes, undefined, 2));
        // Array.from(targetNodes).forEach ( function () {
        targetNodes.forEach ( function (node) {
            // debugger;
            var alreadyFound = node.getAttribute ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (node);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    node.setAttribute ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = updateKeyElements.controlObj  ||  {};
    var controlKey      = selectorClass.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    updateKeyElements (    selectorClass,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    updateKeyElements.controlObj   = controlObj;
}