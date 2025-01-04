// Simple context menu
"use strict";
// globals: document

var SC = window.SC || {}

SC.contextMenu = function (aLabels, aCallback, aSecondaryLabels) {
    // Show simple context menu with buttons and dark background
    var bg, menu, menu2, i, item, c = aCallback;
    // background cover
    bg = document.createElement('div');
    bg.className = 'sc_context_menu_bg';
    bg.style.position = 'fixed';
    bg.style.left = 0;
    bg.style.right = 0;
    bg.style.top = 0;
    bg.style.bottom = 0;
    bg.style.backgroundColor = 'black';
    bg.style.opacity = 0.5;

    // menu
    menu = document.createElement('div');
    menu.className = 'sc_context_menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = 108;
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';

    function hide(event) {
        // hide menu after item was clicked
        if (menu.parentElement) {
            menu.parentElement.removeChild(menu);
        }
        if (menu2 && menu2.parentElement) {
            menu2.parentElement.removeChild(menu2);
        }
        if (bg.parentElement) {
            bg.parentElement.removeChild(bg);
        }
        if (c) {
            if (event.target.nodeName === 'BUTTON') {
                aCallback(event.target.textContent);
            } else {
                aCallback('');
            }
            c = null;
        }
    }
    menu.onclick = hide;
    bg.onclick = hide;

    // items
    for (i = 0; i < aLabels.length; i++) {
        item = document.createElement('button');
        item.textContent = aLabels[i];
        item.addEventListener('click', hide);
        item.style.display = 'block';
        item.style.minHeight = '1.3cm';
        item.style.minWidth = '3cm';
        item.style.width = '100%';
        item.style.flex = 1;
        menu.appendChild(item);
    }

    // show menu
    document.body.appendChild(bg);
    document.body.appendChild(menu);

    if (aSecondaryLabels) {
        menu.style.maxWidth = '100%';
        // secondary menu
        menu2 = document.createElement('div');
        menu2.className = 'sc_context_menu';
        menu2.style.position = 'fixed';
        menu2.style.right = '0';
        menu2.style.zIndex = 108;
        menu2.style.display = 'flex';
        menu2.style.flexDirection = 'column';
        menu2.style.maxWidth = '100%';
        menu2.onclick = hide;
        // items
        for (i = 0; i < aSecondaryLabels.length; i++) {
            item = document.createElement('button');
            item.textContent = aSecondaryLabels[i];
            item.addEventListener('click', hide);
            item.style.display = 'block';
            item.style.minHeight = '1.3cm';
            item.style.minWidth = '3cm';
            item.style.width = '100%';
            item.style.flex = 1;
            menu2.appendChild(item);
        }
        document.body.appendChild(menu2);
    }
    return {menu: menu, menu2: menu2, bg: bg, hide: hide};
};

