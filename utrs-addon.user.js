// ==UserScript==
// @name            UTRS addon
// @namespace       http://www.chrishowie.com/
// @description     Extra features and fixes for the English Wikipedia UTRS tool
// @include         http://toolserver.org/~unblock/*
// @include         https://toolserver.org/~unblock/*
// ==/UserScript==

(function () {
    // Utility function to walk the DOM tree starting at a node.
    function walk(node, callback)
    {
        if (typeof node == 'string') {
            node = document.getElementById(node);
        }

        if (!node) { return; }

        if (callback(node)) { return; }

        var n;
        for (n = node.firstChild; n; n = n.nextSibling) {
            if (callback(n)) { return; }
            walk(n, callback);
        }
    }

    // Walks the DOM tree and returns the first node where predicate(node)
    // returns true.
    function find(node, predicate)
    {
        var found;
        walk(node, function (n) {
            if (predicate(n)) {
                found = n;
                return true;
            }
        });

        return found;
    }

    // Create a link to toggle visibility of an element.
    function createToggleLink(node) {
        function getToggleLinkText() {
            return node.style.display == 'none' ? '[show]' : '[hide]';
        }

        var a = document.createElement('A');
        var text = document.createTextNode(getToggleLinkText());
        a.appendChild(text);

        a.href = '#';
        a.onclick = function () {
            if (node.style.display == 'none') {
                node.style.display = '';
            } else {
                node.style.display = 'none';
            }

            text.nodeValue = getToggleLinkText();

            return false;
        };

        return a;
    }

    // Remove onclick handlers from the navigation menu <td> elements, since
    // they break the expected middle-click functionality.  (Workaround for
    // UTRS-78.)
    function removeMenuClickHandlers() {
        walk('subheader', function (node) {
            if (node.nodeType == 1 && node.nodeName == 'TD') {
                node.onclick = null;
            }
        });
    }

    // Collapse a list of appeals and add a link to show them.
    function collapseAppealList(headerText) {
        var header = find('main', function (node) {
            return node.nodeType == 1 && node.nodeName == 'H2' && node.innerText == headerText;
        });

        if (!header) { return; }

        var table = header.nextSibling;
        while (table && table.nodeType != 1) { table = table.nextSibling; }

        if (!table || table.nodeName != 'TABLE') { return; }

        table.style.display = 'none';
        var toggleLink = createToggleLink(table);
        toggleLink.style.fontSize = '0.5em';

        header.appendChild(document.createTextNode(' '));
        header.appendChild(toggleLink);
    }

    removeMenuClickHandlers();
    collapseAppealList('Awaiting user response');
})();
