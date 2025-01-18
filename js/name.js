// Algorithm for extracting user name from their questions
"use strict";
// globals: GHOST

var SC = window.SC || {};

SC.name = (function () {
    var self = {},
        limitThreshold = GHOST.globalTermFrequency('the', [GHOST.character.basic], 0) / 20,
        // various regexps for detecting names
        my_name_is_xxx = /^my name is (.*?)$/,
        call_me_xxx = /^call me (.*?)$/,
        you_can_call_me_xxx = /^you can call me (.*?)$/,
        hi_my_name_is_xxx = /^(hi|hello|and|cool|by the way) my name is (.*?)$/,
        i_am_xxx_what_is_your_name = /^i am (.*?) what is (you|your) name$/,
        i_am_xxx_nice_to_meet = /i am (.*?) nice to meet/,
        my_name_is_not = /my name is not (.*?)/;

    //console.log('name tf threshold', limitThreshold);

    self.limit = function (aWords) {
        // limit name to break after few words, usually before common word
        // e.g. "my name is john smith what is yours" the word "what" is not part of name
        var w = aWords.split(' '), i, tf;
        for (i = 0; i < w.length; i++) {
            tf = GHOST.globalTermFrequency(w[i], [GHOST.character.basic], 0);
            //console.log('tf(', w[i], ')=', tf, limitThreshold);
            // stop at very common word
            if ((i > 0) && (tf > limitThreshold)) {
                //console.log('very common', w[i], 'tf', tf);
                return w.slice(0, i).join(' '); // slice is shallow, items are values and result is immediately joined
            }
            // stop after 3 words
            if (i >= 3) {
                //console.log('too many names', w);
                return w.slice(0, i).join(' '); // slice is shallow, items are values and result is immediately joined
            }
        }
        // just first word
        return w.join(' ');
    };

    self.capitalize = function (aNames) {
        // convert "john smith" to "John Smith"
        var n = aNames.split(' ');
        return n.map(function (a) { return a.substr(0, 1).toUpperCase() + a.substr(1); }).join(' ');
    };

    self.parse = function (aQuestion) {
        // extract user name from question
        var q = GHOST.normalize(aQuestion).join(' '),
            m,
            r;

        function testOneRe(re, index) {
            if (!r) {
                m = re.exec(q);
                if (m) {
                    r = self.limit(m[index]);
                }
            }
        }

        testOneRe(my_name_is_xxx, 1);
        testOneRe(call_me_xxx, 1);
        testOneRe(you_can_call_me_xxx, 1);
        testOneRe(hi_my_name_is_xxx, 2); // because 1st group is hi
        testOneRe(i_am_xxx_what_is_your_name, 1);
        testOneRe(i_am_xxx_nice_to_meet, 1);

        // remove the "my name is NOT something"
        if (my_name_is_not.exec(q)) {
            return;
        }

        // return it
        if (r) {
            r = self.capitalize(r);
            // save user's name
            if (SC.user && SC.saveUser) {
                SC.user.params['$username;'] = r;
                SC.saveUser();
            }
            return r;
        }
    };

    self.fixUnknownName = function (aAnswer) {
        // if ghost returned $username; and it is not know yet
        if (aAnswer.match(/\$username\;/)) {
            return "I have trouble remembering names";
        }
        // if user sets empty name
        if (aAnswer.trim() === '') {
            try {
                var s = GHOST.askChain([GHOST.character.basic], 'this_triggers_dumb').answer;
                if (s === '') {
                    s = "Hmm...";
                }
                return s;
            } catch (e) {
                console.error(e);
                return "Hmm";
            }
        }
        return aAnswer;
    };

    return self;
}());

