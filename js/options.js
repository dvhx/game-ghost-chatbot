// Options dialog
// linter: ngspicejs-lint
// global: window, document, GA, GHOST, prompt, URL, alert
"use strict";

var SC = window.SC || {};

SC.options = function (aCallback) {
    // Show options dialog and handle inputs
    var e = SC.elementsWithId();

    function validateUrl(aUrl, aDefaultUrl) {
        try {
            var u = new URL(aUrl);
            return u.toString();
        } catch (ex) {
            alert('Invalid url');
            return aDefaultUrl;
        }
    }

    // fill current data
    e.options_name.value = SC.user.params['$nick;'];
    e.options_borndate.value = SC.user.params['$borndate;'] || GHOST.character.ga.params['$borndate;'];
    e.options_age.value = SC.user.params['$age;'] || GHOST.character.ga.params['$age;'];
    e.options_sex.value = SC.user.params['$sex;'] || GHOST.character.ga.params['$sex;'];
    e.options_location.value = SC.user.params['$location;'] || GHOST.character.ga.params['$location;'];
    e.options_city.value = SC.user.params['$city;'] || GHOST.character.ga.params['$city;'];
    e.options_height.value = SC.user.params['$height;'] || GHOST.character.ga.params['$height;'];
    e.options_weight.value = SC.user.params['$weight;'] || GHOST.character.ga.params['$weight;'];
    e.options_user_name.value = SC.user.params['$username;'] || GHOST.character.ga.params['$username;'] || '';
    e.options_user_icon.src = SC.user.params['$usericon;'] || 'image/user32.png';
    e.options_user_icon_default.onclick = function () {
        // default icon
        SC.user.params['$usericon;'] = 'image/user32.png';
        e.options_user_icon.src = SC.user.params['$usericon;'];
    };
    e.options_user_icon_change.onclick = function () {
        // change icon url
        var s = SC.user.params['$usericon;'] || '';
        var url = prompt('Change user icon', s.startsWith('http') ? s : 'http://');
        if (url || (url === '')) {
            e.options_user_icon.src = validateUrl(url, 'image/user32.png');
        }
    };
    e.options_ghost_icon.src = SC.user.params['$ghosticon;'] || 'image/ghost32.png';
    e.options_ghost_icon_default.onclick = function () {
        // default icon
        SC.user.params['$ghosticon;'] = 'image/ghost32.png';
        e.options_ghost_icon.src = SC.user.params['$ghosticon;'];
    };
    e.options_ghost_icon_change.onclick = function () {
        // change icon url
        var s = SC.user.params['$ghosticon;'] || '';
        var url = prompt('Change ghost icon', s.startsWith('http') ? s : 'http://');
        if (url || (url === '')) {
            e.options_ghost_icon.src = validateUrl(url, 'image/ghost32.png');
        }
    };
    e.options_theme.value = SC.user.params['$theme;'] || 'light';
    e.options_theme.onchange = function () {
        SC.applyTheme(e.options_theme.value);
    };

    e.options_save.onclick = function () {
        // Save and close dialog
        SC.user.params['$nick;'] = e.options_name.value;
        SC.user.params['$borndate;'] = e.options_borndate.value;
        SC.user.params['$age;'] = e.options_age.value;
        SC.user.params['$sex;'] = e.options_sex.value;
        SC.user.params['$location;'] = e.options_location.value;
        SC.user.params['$city;'] = e.options_city.value;
        SC.user.params['$height;'] = e.options_height.value;
        SC.user.params['$weight;'] = e.options_weight.value;
        SC.user.params['$username;'] = e.options_user_name.value;
        SC.user.params['$usericon;'] = e.options_user_icon.src;
        SC.user.params['$ghosticon;'] = e.options_ghost_icon.src;
        SC.user.params['$theme;'] = e.options_theme.value;
        SC.saveUser();
        e.options.close();
        if (aCallback) {
            aCallback();
        }
    };

    e.options_cancel.onclick = function () {
        // Close options without saving
        e.options.close();
        SC.applyTheme(SC.user.params['$theme;']);
    };

    e.options.showModal();
};

