// Show user's edits and allow to edit them further
// linter: ngspicejs-lint
// global: window, document, GHOST
"use strict";

var SC = window.SC || {};

SC.edits = function (aCallback) {
    // show edits
    var e = SC.elementsWithId(), all = [];

    e.edits_save.onclick = function () {
        // Save changes
        var r = {};
        all.forEach((qa) => {
            var q = GHOST.normalize(qa.q.value, undefined, GHOST.character.basic.slang, false, GHOST.character.basic.shortcuts).join(' ');
            var a = qa.a.value.trim().split(';').filter((s) => s !== '');
            if (a.length > 0 && q !== '') {
                r[q] = a;
            } else {
                delete r[q];
            }
        });
        SC.user.data = r;
        SC.saveUser();
        e.edits.close();
        if (aCallback) {
            aCallback();
        }
    };

    e.edits_cancel.onclick = function () {
        // Close editor
        e.edits.close();
    };

    function one(aQuestion, aAnswers) {
        // render one qa pair
        var div = document.createElement('div');
        div.className = 'edits_qa';
        div.innerHTML = `
            <div class="option" style="margin-bottom: 0;">
                <div class="label_short">Q</div>
                <input class="q" type="text" style="flex: 1;">
            </div>
            <div class="option">
                <div class="label_short">A</div>
                <input class="a" type="text" style="flex: 1;">
            </div>`;
        var q = div.getElementsByClassName('q')[0];
        var a = div.getElementsByClassName('a')[0];
        q.value = aQuestion;
        a.value = aAnswers.join(';');
        e.edits_container.appendChild(div);
        all.push({q,a});
    }

    // render all qa pairs
    e.edits_container.textContent = '';
    for (let q in SC.user.data) {
        if (SC.user.data.hasOwnProperty(q)) {
            one(q, SC.user.data[q]);
        }
    }
    // note if no edits
    if (all.length <= 0) {
        e.edits_container.textContent = "You don't have any edits yet. In chat window tap on the ghost's answer and type something else to change ghost's answer for your question.";
    }

    // show dialog
    e.edits.showModal();
};
