// Very simple engine for evaluating mathematical questions
"use strict";
// globals: GHOST

var SC = window.SC || {}

SC.math = {};

SC.math.factorize = function (x) {
    // return factors of integer number (45 = 3 * 3 * 5)
    // reasonable fast to 20e6
    x = Math.abs(Math.round(x));
    if (x <= 1) {
        return [x];
    }
    var i, m = Math.ceil(x / 2), r = [];
    for (i = 2; i <= m; i++) {
        while (x % i === 0) {
            r.push(i);
            x = Math.floor(x / i);
        }
    }
    if (r.length === 0) {
        r.push(x);
    }
    return r;
};

SC.math.isPrime = function (x) {
    // return true if x is prime
    return SC.math.factorize(x).length === 1;
};

SC.math.slang = {
    'zero': '0',
    'one': '1',
    'one half': '0.5',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
    'ten': '10',
    'what s': null,
    'thousand': '1000',
    'million': '1000000',
    'pi': Math.PI.toString(),
    'pie': Math.PI.toString(),
    'plus': '+',
    'minus': '-',
    'times': '*',
    'rute': 'root',
    'x': ' * ',
    '\u00f7': ' / ',
    '\u2212': ' - ',
    'divided': '/',
    'dived': '/',
    'about': null,
    'by': null,
    'bye': null,
    'what': null,
    'that': null,
    'yeah': null,
    'what\'s': null,
    'is': null,
    'it': null,
    "don't": null,
    'how': null,
    'much': null,
    'then': null,
    'match': null,
    'kool': null,
    'a': null,
    'new': null,
    'now': null,
    'cool': null,
    'calculate': null,
    'eval': null,
    'evaluate': null,
    'tell': null,
    '?': null,
    'the': null,
    'want': null,
    'do': null,
    'you': null,
    'know': null,
    'us': null,
    'so': null,
    'ok': null,
    'are': null,
    'solve': null,
    'resolve': null,
    'squared': 'sqr',
    'squar': 'square',
    'squareroot': 'sqrt',
    'multpied': '*',
    'time': '*',
    'pless': '+',
    ',': null,
    'factors': 'factorize',
    'i': null,
    '×': '*',
    'of': null,
    'equals': "=",
    "roote": "root",
    'does': null,
    'number': null,
    'me': null
};

SC.math.ask = function (aCharacter, aQuestion) {
    // evaluate math questions
    var q = aQuestion, t, token, f, kind, k, err = null, factors, old_slang, old_mwl;

    try {
        old_slang = GHOST.slang;
        old_mwl = GHOST.maxWordLength;
        GHOST.maxWordLength = 200;

        // first pass it through original normalizer
        q = GHOST.normalize(q, true).join(' ');
        SC.math.q1 = q;

        // convert "3 . 14 + 1 . 01" to "3.14 + 1.01"
        q = q.replace(/\ \.\ /g, '.');

        // convert x to " x " (e.g. what is 2x3)
        q = q.replace(/x/g, ' x ');
        // convert :- to /
        q = q.replace(/\u00f7/g, ' / ');

        // second pass is math slang
        GHOST.slang = SC.math.slang;
        token = GHOST.normalize(q, true);
    } finally {
        GHOST.slang = old_slang;
        GHOST.maxWordLength = old_mwl;
    }
    SC.math.q2 = token;

    // fix first minus (-20+3)
    if (parseInt(token.slice(0, 2).join(''), 10) === -token[1]) {
        token = token.slice(1);
        token[0] = -token[0];
    }

    // determine token kind
    kind = [];
    for (t = 0; t < token.length; t++) {
        // float numbers
        f = parseFloat(token[t]);
        if (!isNaN(f)) {
            token[t] = f;
            kind.push('n');
            continue;
        }
        // binary operators
        if (['+', '-', '*', '/', '='].indexOf(token[t]) >= 0) {
            kind.push('b');
            continue;
        }
        // unary operators
        if (['sqrt', 'sin', 'cos', 'factorize', 'prime', 'sqr'].indexOf(token[t]) >= 0) {
            kind.push('u');
            continue;
        }
        // unknown
        kind.push('?');
    }

    // remove tailing = (1+2=)
    if (token.slice(-1)[0] === '=') {
        token.splice(-1);
        kind.splice(-1);
    }

    // remove tailing empty string
    if (token.slice(-1)[0] === '') {
        token.splice(-1);
        kind.splice(-1);
    }

    SC.math.token = token;
    SC.math.kind = kind;

    k = kind.join('');

    // n = what is pi, what is 4, but not "are you 20"
    if ((k === 'n') && (!SC.math.q1.match('are you')) && (!SC.math.q1.match('you are'))) {
        return token[0];
    }

    // nbn = simple binary operators (x operation y)
    //console.log('kind', k, token);
    if (k === 'nbn' || k === 'nbnb') {
        switch (token[1]) {
        case '+':
            return token[0] + token[2];
        case '-':
            return token[0] - token[2];
        case '*':
            return token[0] * token[2];
        case '/':
            return token[0] / token[2];
        case '=':
            return token[0] === token[2];
        }
        return err;
    }

    // nbnbn (1+2-3)
    // I only add this because it is very simple, for anything else real math engine is necessary
    if (k === 'nbnbn') {
        switch (token[1] + token[3]) {
        case '++':
            return token[0] + token[2] + token[4];
        case '+-':
            return token[0] + token[2] - token[4];
        case '-+':
            return token[0] - token[2] + token[4];
        case '--':
            return token[0] - token[2] - token[4];
        case '+/':
            return token[0] + token[2] / token[4];
        case '/+':
            return token[0] / token[2] + token[4];
        case '-/':
            return token[0] - token[2] / token[4];
        case '/-':
            return token[0] / token[2] - token[4];
        case '*/':
            return token[0] * token[2] / token[4];
        case '/*':
            return token[0] / token[2] * token[4];
        case '*+':
            return token[0] * token[2] + token[4];
        case '+*':
            return token[0] + token[2] * token[4];
        case '*-':
            return token[0] * token[2] - token[4];
        case '-*':
            return token[0] - token[2] * token[4];
        case '**':
            return token[0] * token[2] * token[4];
        case '//':
            return token[0] / token[2] / token[4];
        case '+=':
            return token[0] + token[2] === token[4];
        case '-=':
            return token[0] - token[2] === token[4];
        case '*=':
            return token[0] * token[2] === token[4];
        case '/=':
            return token[0] / token[2] === token[4];
        }
        return err;
    }
    // nbnbnbn (1/2+3/4)
    if (k === 'nbnbnbn') {
        switch (token[1] + token[3] + token[5]) {
        case '/*/':
            return token[0] / token[2] * token[4] / token[6];
        case '/+/':
            return token[0] / token[2] + token[4] / token[6];
        case '/-/':
            return token[0] / token[2] - token[4] / token[6];
        case '*+*':
            return token[0] * token[2] + token[4] * token[6];
        case '*-*':
            return token[0] * token[2] - token[4] * token[6];
        case '***':
            return token[0] * token[2] * token[4] * token[6];
        }
    }

    // swap nu to un
    if (k === 'nu') {
        k = token[0];
        token[0] = token[1];
        token[1] = k;
        k = 'un';
    }

    // un = sample unary operators (operation x)
    if (k === 'un') {
        switch (token[0]) {
        case 'sqr':
            return token[1] * token[1];
        case 'sqrt':
            return Math.sqrt(token[1]);
        case 'sin':
            return Math.sin(token[1]);
        case 'cos':
            return Math.cos(token[1]);
        case 'prime':
            if (token[1] > 20e6) {
                return token[1] + " is too big for me to tell if it is prime number";
            }
            return 'Number ' + token[1] + ' is ' + (SC.math.isPrime(token[1]) ? 'prime' : 'not prime') + ' number';
        case 'factorize':
            // too big to factorize?
            if (token[1] > 20e6) {
                return token[1] + " is too big for me to factorize";
            }
            // factorize
            factors = SC.math.factorize(token[1]);
            // is it prime?
            if (factors.length === 1) {
                return Math.round(token[1]) + ' is prime number!';
            }
            // print factors
            return 'Factors of ' + Math.round(token[1]) + ' are ' + factors.join(', ');
        }
        return err;
    }

    // square root of x
    if ((token.length === 4) && (token.slice(0, 3).join(' ') === 'square root of')) {
        return Math.sqrt(token[3]);
    }
    if ((token.length === 4) && (token.slice(0, 3).join(' ') === 'square rute of')) {
        return Math.sqrt(token[3]);
    }
    // square root x
    if ((token.length === 3) && (token.slice(0, 2).join(' ') === 'square root')) {
        return Math.sqrt(token[2]);
    }
    // sqrt of x
    if ((token.length === 3) && (token.slice(0, 2).join(' ') === 'sqrt of')) {
        return Math.sqrt(token[2]);
    }

    return err;
};

