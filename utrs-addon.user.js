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

        if (!node) { return false; }

        if (callback(node)) { return true; }

        var n;
        for (n = node.firstChild; n; n = n.nextSibling) {
            if (walk(n, callback)) { return true; }
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

    // Shortcut to insert a node following another.
    function insertNodeAfter(target, node) {
        target.parentNode.insertBefore(node, target.nextSibling);
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

    // Create a field to quickly insert a link to an enwp page
    function addWikipediaLinkBox() {
        var textarea = document.getElementById('emailText');

        if (!textarea) {
            if (document.getElementById('editTemplate')) {
                textarea = document.getElementById('text');
            } else {
                return;
            }
        }

        var outer = document.createElement('DIV');

        outer.appendChild(document.createTextNode('Insert link to Wikipedia page: '));

        var pageEntry = document.createElement('INPUT');
        pageEntry.size = 50;
        outer.appendChild(pageEntry);

        outer.appendChild(document.createTextNode(' '));

        var insertLinkButton = document.createElement('BUTTON');
        insertLinkButton.appendChild(document.createTextNode('Insert'));
        outer.appendChild(insertLinkButton);

        insertNodeAfter(textarea, outer);

        insertLinkButton.onclick = function () {
            var linkTarget = 'http://en.wikipedia.org/wiki/' + pageEntry.value;
            var linkTitle;

            var selectionLength = textarea.selectionEnd - textarea.selectionStart;

            if (selectionLength != 0) {
                linkTitle = textarea.value.substr(textarea.selectionStart, selectionLength);
            } else {
                linkTitle = linkTarget;
            }

            var link = document.createElement('A');
            link.appendChild(document.createTextNode(linkTitle));
            link.href = linkTarget;

            var linkText = link.outerHTML;

            var selectionStart = textarea.selectionStart;

            textarea.value =
                textarea.value.substr(0, selectionStart) +
                linkText +
                textarea.value.substr(textarea.selectionEnd);

            textarea.selectionStart = selectionStart;
            textarea.selectionEnd = selectionStart + linkText.length;
            textarea.focus();

            return false;
        };

        pageEntry.onkeypress = function (e) {
            if (e.keyCode == 10 || e.keyCode == 13) {
                insertLinkButton.click();
                return false;
            }
        };
    }

    removeMenuClickHandlers();
    collapseAppealList('Awaiting user response');
    addWikipediaLinkBox();
})();
