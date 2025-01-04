// Callbacks for main page
"use strict";
// globals: GHOST, window, document, requestAnimationFrame, setTimeout, Android, DOMParser

var SC = window.SC || {}

// User's character
SC.user = SC.storage.readObject('GHOST_USER', GHOST.createCharacter('Ghost', 'user'));
SC.user.id = 'user';
SC.user.params['$ghosticon;'] = SC.user.params['$ghosticon;'] || 'image/ghost32.png';
SC.user.params['$usericon;'] = SC.user.params['$usericon;'] || 'image/user32.png';

// All used characters combined
SC.characters = [
    GHOST.character.basic,
    GHOST.character.ghost,
    GHOST.character.relationship,
    GHOST.character.ga,
    GHOST.character.android,
    SC.user
];

// Conversation log
SC.log = SC.storage.readObject('GHOST_LOG', []);
SC.maxLogSize = 100;

SC.saveLog = function () {
    // save conversation to local storage
    SC.storage.writeObject('GHOST_LOG', SC.log.slice(-SC.maxLogSize)); // slice is shallow
};

SC.saveUser = function () {
    // save conversation to local storage
    GHOST.indexRebuild(SC.user);
    SC.storage.writeObject('GHOST_USER', SC.user);
};

SC.edit = function (event) {
    // edit single answer
    var bubble = event.target;
    console.log('edit', bubble)

    // make bubble editable
    bubble.contentEditable = true;
    bubble.style.outline = 0;
    bubble.focus();
    window.getSelection().selectAllChildren(bubble);

    function save() {
        // save edited question
        var i,
            q = GHOST.normalize(bubble.dataQuestion, false).join(' '),
            a = bubble.textContent;
        console.info('save', q, '-->', a);
        // add QA to user
        if (!SC.user.data.hasOwnProperty(q)) {
            SC.user.data[q] = [];
        }
        if (SC.user.data[q].indexOf(a) < 0) {
            SC.user.data[q].push(a);
        }
        // save user
        SC.saveUser();
        // change answer in log too
        for (i = 0; i < SC.log.length; i++) {
            if (SC.log[i].q === q || SC.log[i].q === bubble.dataQuestion) {
                SC.log[i].a = a;
            }
        }
        // save log
        SC.saveLog();
        // focus question input and make bubble not editable
        bubble.contentEditable = false;
    }

    // when user leaves edited bubble save it and focus question input
    bubble.onblur = save;

    bubble.addEventListener('keypress', function (event) {
        // enter will save changes and focus question input
        if (event.keyCode === 13) {
            event.preventDefault();
            save();
        }
    }, true);
};

// Certain GA answers have special token that is replaced with picture
SC.pictures = {
    '$picture;': '<img src="image/ghost128.png" title="This is me"/>',
    '$picturedealwithit;': '<img src="image/deal_with_it.png" title="I am dealing with it!"/>'
};

SC.renderOne = function (aClass, aText, aFast, aQuestionForEdit) {
    // render one question or answer
    var block, avatar1, bubble, avatar2, edit;
    // block
    block = document.createElement('div');
    block.classList.add('block');
    block.classList.add(aClass);
    if (!aFast) {
        block.style.opacity = '0';
        block.style.transition = 'opacity 0.5s linear 0.1s';
    }
    // avatar1
    avatar1 = document.createElement('div');
    avatar1.classList.add('avatar');
    avatar1.classList.add(aClass === 'question' ? 'none' : 'ghost');
    // custom ghost icon
    if (aClass !== 'question') {
        avatar1.style.backgroundImage = 'url(' + SC.user.params['$ghosticon;'] + ')';
        avatar1.style.backgroundSize = 'contain';
    }
    // bubble
    bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = aText;
    if (aClass === 'answer') {
        if (SC.pictures.hasOwnProperty(aText)) {
            if (SC.user.params['$ghosticon;'] !== 'image/ghost32.png') {
                bubble.innerHTML = '<img style="width: 60vw; height: auto;" src="' + SC.user.params['$ghosticon;'] + '" title="Myself" />';
            } else {
                bubble.innerHTML = SC.pictures[aText];
            }
        } else {
            bubble.dataQuestion = aQuestionForEdit;
            if (aQuestionForEdit) {
                bubble.addEventListener('click', SC.edit);
            }
        }
    }
    // edit
    edit = document.createElement('div');
    edit.classList.add('edit');
    edit.textContent = 'edit';
    // avatar2
    avatar2 = document.createElement('div');
    avatar2.classList.add('avatar');
    avatar2.classList.add(aClass === 'question' ? 'user' : 'none');
    // custom user icon
    if (aClass === 'question') {
        if (SC.user.params['$usericon;']) {
            avatar2.style.backgroundImage = 'url(' + SC.user.params['$usericon;'] + ')';
            avatar2.style.backgroundSize = 'contain';
        }
    }
    // add it to output container
    block.appendChild(avatar1);
    block.appendChild(bubble);
    block.appendChild(avatar2);
    document.getElementById('container').appendChild(block);
    // start animation
    requestAnimationFrame(function () {
        block.style.opacity = '1';
    });
    // scroll down
    document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
    if (!aFast) {
        setTimeout(function () {
            document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
        }, 500);
    }
    return bubble;
};

SC.askLastQuestion = '';
SC.askLastTime = 0;

SC.ask = function () {
    // answer question in textarea and render it
    var e, q, a, sp = true;
    e = document.getElementById('question');
    q = e.value.trim();
    console.log('SC.ask', Date.now(), q);

    SC.askLastQuestion = q;
    SC.askLastTime = Date.now();

    // clear and focus question
    e.value = '';
    e.focus();

    // do nothing on empty question
    if (q === '') {
        return;
    }
    if (q === '#purge') {
        localStorage.clear();
        document.location.reload();
        return;
    }

    // render question
    SC.renderOne('question', q);
    // find answer
    setTimeout(
        function () {
            // math
            a = SC.math.ask(GHOST.character.basic, q);
            if (a !== null) {
                SC.renderOne('answer', a, false, q, false, true);
                SC.log.push({q: q, a: a});
                SC.saveLog();
                return;
            }
            // is it simple why question? turn it into full why question
            try {
                q = GHOST.why.modify('GA', q);
            } catch (e) {
                console.error(e);
            }
            // try detect name
            if (SC.name.parse(q)) {
                console.info('username', SC.user.params['$username;']);
            }
            // ghost
            q = GHOST.appendQuestionMark(q);
            a = GHOST.askChain(SC.characters, q, [0.001, 0.01, 0.02, 0.05, 0.1, 0.5, 0.9, 1]);
            // remember answer for "why" plugin
            GHOST.why.lastAnswer.GA = a && a.answer;
            // fix unknown username
            try {
                if (a && a.hasOwnProperty('answer')) {
                    a.answer = SC.name.fixUnknownName(a.answer);
                }
            } catch (e) {
                console.error('fixUnknownName: ' + e);
            }

            // render answer
            SC.renderOne('answer', a.answer, false, q, false, sp);
            SC.log.push({q: q, a: a.answer});
            SC.saveLog();
        },
        300
    );
};

SC.clear = function () {
    // clear output
    document.getElementById('container').textContent = '';
    SC.log = [];
    SC.saveLog();
};

SC.validateName = function (aText) {
    // options.js needs this
    return aText.toString().trim();
};

SC.showMenu = function () {
    // show context menu
    var m = SC.contextMenu(['Options', 'Edits', 'Clear'], function (aLabel) {
        switch (aLabel) {
        case "Options":
            SC.options(SC.renderRecentConversations);
            break;
        case "Edits":
            SC.edits();
            break;
        case "Clear":
            SC.clear();
            break;
        }
    });
    m.menu.style.left = '1ex';
    m.menu.style.bottom = '2cm';
};

SC.renderRecentConversations = function () {
    // Render recent conversations
    var i;
    document.getElementById('container').innerText = '';
    for (i = 0; i < SC.log.length; i++) {
        if (SC.log[i].q) {
            SC.renderOne('question', SC.log[i].q, true);
        }
        if (SC.log[i].e || SC.log[i].a) {
            SC.renderOne('answer', SC.log[i].e || SC.log[i].a, true, SC.log[i].q);
        }
    }
    // scroll down
    setTimeout(function () {
        document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
    }, 500);
    // scroll down
    setTimeout(function () {
        document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
        // if user name is know say hello now
        if (SC.user.params['$username;']) {
            SC.renderOne('answer', 'Hello ' + SC.user.params['$username;'], false, null, false, true);
        } else {
            if (SC.log.length === 0) {
                SC.renderOne('answer', 'Hello there!', false, null, false, true);
            }
        }
    }, 1000);
};

SC.applyTheme = function (aTheme) {
    // apply css theme
    var e = document.getElementById('theme');
    e.href = "css/theme_" + (aTheme || 'light') + ".css";
};

window.addEventListener('DOMContentLoaded', function () {
    // initialize window
    document.getElementById('ask').addEventListener('click', SC.ask);
    document.getElementById('showmenu').addEventListener('click', SC.showMenu);

    document.getElementById('question').addEventListener('input', function (event) {
        // enter answers the question
        if (document.getElementById('question').value.indexOf('\n') > 0) {
            //if (event.keyCode === 13) {
            SC.ask();
            event.preventDefault();
        }
    });

    SC.applyTheme(SC.user.params['$theme;']);

    // render recent conversation
    SC.renderRecentConversations();
    //SC.edits();
});

