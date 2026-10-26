/**
* @description MeshCentral Modern UI - browser side.
*              Adds navigation helpers on top of the classic interface. It only calls the
*              interface's own functions (go, gotoDevice, setNightMode, ...) so every feature
*              keeps working the way MeshCentral implements it.
* @license Apache-2.0
*/

(function () {
    'use strict';
    var mui = window.modernui || (window.modernui = {});
    if (mui.started) { return; }
    mui.started = true;

    var root = document.documentElement;
    var enabled = root.classList.contains('mui');

    // ---------- Helpers ----------

    function $(id) { return document.getElementById(id); }
    function isShown(id) { var e = $(id); return (e != null) && (e.style.display != 'none'); }
    function text(id) { var e = $(id); return (e == null) ? '' : e.textContent.replace(/\s+/g, ' ').trim(); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function getPref(name, def) { try { var v = localStorage.getItem('_modernui' + name); return (v == null) ? def : v; } catch (ex) { return def; } }
    function setPref(name, val) { try { if (val == null) { localStorage.removeItem('_modernui' + name); } else { localStorage.setItem('_modernui' + name, val); } } catch (ex) { } }
    function el(tag, attrs, html) {
        var e = document.createElement(tag);
        for (var i in attrs) { if (i == 'className') { e.className = attrs[i]; } else if (i.substring(0, 2) == 'on') { e.addEventListener(i.substring(2), attrs[i]); } else { e.setAttribute(i, attrs[i]); } }
        if (html != null) { e.innerHTML = html; }
        return e;
    }
    function call(name) { var f = window[name]; if (typeof f == 'function') { return f.apply(window, Array.prototype.slice.call(arguments, 1)); } }
    function currentView() { return (typeof xxcurrentView == 'number') ? xxcurrentView : -1; }
    function dialogOpen() { return (typeof xxdialogMode != 'undefined') && xxdialogMode; }

    // Icons are 24x24 line drawings, stroked with the current text color.
    function icon(paths) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>'; }
    var ICONS = {
        devices: icon('<rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 16.5v4"/>'),
        account: icon('<circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5"/>'),
        events: icon('<path d="M3 12h4l3-8 4 16 3-8h4"/>'),
        files: icon('<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2.5h6.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>'),
        users: icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.2 3.5-5 6.5-5s5.5 1.8 6.5 5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15.3c1.7.7 2.9 2.3 3.5 4.7"/>'),
        server: icon('<rect x="3.5" y="3" width="17" height="7.5" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="7.5" rx="1.5"/><path d="M7 6.75h.01M7 17.25h.01"/>'),
        search: icon('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
        sliders: icon('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
        chevronDown: icon('<path d="M6 9l6 6 6-6"/>'),
        chevronsLeft: icon('<path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>'),
        sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>'),
        moon: icon('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'),
        monitor: icon('<rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 16.5v4"/>'),
        sidebar: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'),
        topbar: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18"/>'),
        fixed: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16"/>'),
        footer: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15.5h18"/>'),
        notes: icon('<path d="M6 3.5h9l4 4v13H6z"/><path d="M14.5 3.5v4.5H19M9.5 12.5h6M9.5 16h6"/>'),
        expand: icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
        layout: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>'),
        classic: icon('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
        logout: icon('<path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15M10 17l5-5-5-5M15 12H4"/>'),
        group: icon('<rect x="3" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13" width="7.5" height="7.5" rx="1.5"/>'),
        user: icon('<circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5"/>'),
        page: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
        plus: icon('<path d="M12 5v14M5 12h14"/>'),
        check: icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
        mesh: icon('<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M10.9 6.9l-4.8 9.2M13.1 6.9l4.8 9.2M7.2 18h9.6"/>')
    };

    // ---------- Sidebar ----------

    // The sidebar buttons only have bitmap icons; give them an icon and the (translated)
    // label of the matching top menu item.
    var NAV = [
        ['LeftMenuMyDevices', 'MainMenuMyDevices', 'devices'],
        ['LeftMenuMyAccount', 'MainMenuMyAccount', 'account'],
        ['LeftMenuMyEvents', 'MainMenuMyEvents', 'events'],
        ['LeftMenuMyFiles', 'MainMenuMyFiles', 'files'],
        ['LeftMenuMyUsers', 'MainMenuMyUsers', 'users'],
        ['LeftMenuMyServer', 'MainMenuMyServer', 'server']
    ];

    function setupSidebar() {
        var bar = $('page_leftbar');
        if (bar == null) return;
        NAV.forEach(function (n) {
            var b = $(n[0]);
            if ((b == null) || b.querySelector('.mui-nav-label')) return;
            var label = text(n[1]) || b.getAttribute('title') || '';
            b.insertBefore(el('span', { className: 'mui-nav-icon' }, ICONS[n[2]]), b.firstChild);
            b.appendChild(el('span', { className: 'mui-nav-label' }, esc(label)));
        });
        if (bar.querySelector('.mui-nav-footer') == null) {
            var footer = el('div', { className: 'mui-nav-footer' });
            var toggle = el('button', { type: 'button', className: 'mui-collapse-btn', title: 'Collapse sidebar', onclick: function () { setCollapsed(!collapsedPref); } }, ICONS.chevronsLeft + '<span class="mui-nav-label">Collapse</span>');
            footer.appendChild(toggle);
            bar.appendChild(footer);
        }
        if (narrow != null) return;
        setCollapsed(getPref('Collapsed', '0') == '1', true);
        // Below this width the full sidebar leaves too little room for the classic toolbars,
        // so it becomes an icon rail whatever the saved preference is.
        narrow = window.matchMedia('(max-width: 1199px)');
        var onWidth = function () { root.classList.toggle('mui-narrow', narrow.matches); applyCollapsed(); };
        if (narrow.addEventListener) { narrow.addEventListener('change', onWidth); } else { narrow.addListener(onWidth); }
        onWidth();
    }

    var narrow = null, collapsedPref = false;

    function applyCollapsed() {
        root.classList.toggle('mui-collapsed', collapsedPref || ((narrow != null) && narrow.matches));
    }

    function setCollapsed(collapsed, initial) {
        collapsedPref = collapsed;
        applyCollapsed();
        if (initial !== true) { setPref('Collapsed', collapsed ? '1' : '0'); }
        // Let the classic UI recompute sizes that depend on the content width (desktop canvas, device list).
        if (initial !== true) { setTimeout(function () { call('mainUpdate', 512); if (currentView() == 11) { call('deskAdjust'); } }, 50); }
    }

    // ---------- Header ----------

    function setupHeader() {
        var head = $('masthead');
        if ((head == null) || head.querySelector('.mui-spacer')) return;
        var title = head.querySelector('.title');

        // A server can replace the text title with a picture (served as logo.png) or custom HTML.
        var customHtml = head.firstElementChild && (head.firstElementChild.innerHTML.trim() != '');
        if ((title != null) && (title.textContent.trim() == '') && !customHtml) {
            head.insertBefore(el('img', { className: 'mui-brand-logo', src: 'logo.png', alt: '', onclick: function (e) { call('go', 1, e); } }), title);
        } else if (!customHtml) {
            head.insertBefore(el('div', { className: 'mui-brand-mark', onclick: function (e) { call('go', 1, e); } }, ICONS.mesh), head.firstChild);
        }

        head.appendChild(el('div', { className: 'mui-spacer' }));

        var mac = /Mac|iPhone|iPad/.test(navigator.platform || '');
        head.appendChild(el('button', { type: 'button', className: 'mui-search', title: 'Search devices, groups, users and pages', onclick: function () { openPalette(); } },
            ICONS.search + '<span>Search…</span><kbd class="mui-kbd">' + (mac ? '⌘' : 'Ctrl') + ' K</kbd>'));

        var appearance = el('button', { type: 'button', className: 'mui-iconbtn', title: 'Appearance', 'aria-haspopup': 'true', onclick: function (e) { e.stopPropagation(); toggleMenu(appearance, buildAppearanceMenu); } }, ICONS.sliders);
        head.appendChild(appearance);

        var user = el('button', { type: 'button', className: 'mui-user', title: '', 'aria-haspopup': 'true', onclick: function (e) { e.stopPropagation(); toggleMenu(user, buildUserMenu); } },
            '<span class="mui-avatar"></span><span class="mui-user-name"></span>' + ICONS.chevronDown);
        head.appendChild(user);
        mui.userButton = user;
        updateUser();
    }

    function userDisplayName() {
        if ((typeof userinfo != 'undefined') && (userinfo != null)) { return userinfo.realname || userinfo.name || ''; }
        if ((typeof logoutControls != 'undefined') && logoutControls && logoutControls.name) { return logoutControls.name; }
        return '';
    }

    function updateUser() {
        var b = mui.userButton;
        if (b == null) return;
        var name = userDisplayName();
        var initials = name.split(/[\s._@-]+/).filter(function (x) { return x.length > 0; }).slice(0, 2).map(function (x) { return x[0].toUpperCase(); }).join('');
        var avatar = b.querySelector('.mui-avatar');
        var img = $('p2AccountImage');
        if ((img != null) && img.getAttribute('src') && (img.getAttribute('src').indexOf('images/user-256.png') == -1)) {
            avatar.style.backgroundImage = 'url("' + img.src.replace(/"/g, '%22') + '")';
            avatar.textContent = '';
        } else {
            avatar.style.backgroundImage = '';
            avatar.textContent = initials || '?';
        }
        b.querySelector('.mui-user-name').textContent = name;
        b.title = name;
    }

    // ---------- Dropdown menus ----------

    var openMenu = null;

    function closeMenu() {
        if (openMenu == null) return;
        openMenu.menu.remove();
        openMenu.anchor.classList.remove('mui-open');
        openMenu = null;
    }

    function toggleMenu(anchor, build) {
        var same = (openMenu != null) && (openMenu.anchor == anchor);
        closeMenu();
        if (same) return;
        var menu = el('div', { className: 'mui-menu', role: 'menu' });
        build(menu);
        document.body.appendChild(menu);
        var r = anchor.getBoundingClientRect();
        menu.style.top = (r.bottom + 6) + 'px';
        menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
        anchor.classList.add('mui-open');
        openMenu = { menu: menu, anchor: anchor };
        menu.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    function menuItem(menu, iconName, label, action, opts) {
        opts = opts || {};
        var item = el(opts.href ? 'a' : 'button', { className: 'mui-menu-item' + (opts.danger ? ' mui-danger' : ''), role: 'menuitem' },
            (iconName ? ICONS[iconName] : '') + '<span>' + esc(label) + '</span>' + (opts.checked ? '<span class="mui-check">' + ICONS.check + '</span>' : ''));
        if (opts.href) { item.href = opts.href; } else { item.type = 'button'; }
        if (action) { item.addEventListener('click', function (e) { closeMenu(); action(e); }); }
        menu.appendChild(item);
        return item;
    }

    function buildUserMenu(menu) {
        var name = userDisplayName();
        var email = ((typeof userinfo != 'undefined') && userinfo && userinfo.email) ? userinfo.email : '';
        menu.appendChild(el('div', { className: 'mui-menu-head' }, '<b>' + esc(name) + '</b>' + (email ? '<span>' + esc(email) + '</span>' : '')));
        menuItem(menu, 'account', text('MainMenuMyAccount') || 'My Account', function (e) { call('go', 2, e); });
        if (isShown('uiViewButton6')) { menuItem(menu, 'notes', 'Personal notes', function () { call('showNotes', false); }); }
        menuItem(menu, 'search', 'Search…', function () { openPalette(); });
        if ((typeof logoutControls != 'undefined') && logoutControls && logoutControls.logoutUrl) {
            menu.appendChild(el('div', { className: 'mui-menu-sep' }));
            menuItem(menu, 'logout', 'Log out', null, { href: logoutControls.logoutUrl, danger: true });
        }
    }

    // Mirrors the classic "◆" interface menu. Options the server has hidden there stay hidden here.
    function buildAppearanceMenu(menu) {
        if (isShown('uiViewButton4')) {
            menu.appendChild(el('div', { className: 'mui-menu-label' }, 'Theme'));
            var mode = call('getstore', 'nightMode', '0') || '0';
            var seg = el('div', { className: 'mui-segment' });
            [['0', 'monitor', 'System'], ['2', 'sun', 'Light'], ['1', 'moon', 'Dark']].forEach(function (m) {
                seg.appendChild(el('button', { type: 'button', className: (mode == m[0]) ? 'mui-on' : '', onclick: function () { setTheme(m[0]); closeMenu(); } }, ICONS[m[1]] + esc(m[2])));
            });
            menu.appendChild(seg);
        }
        if (isShown('uiViewButton1')) {
            menu.appendChild(el('div', { className: 'mui-menu-label' }, 'Layout'));
            var ui = (typeof uiMode == 'number') ? uiMode : 1;
            menuItem(menu, 'sidebar', 'Sidebar', function () { call('userInterfaceSelectMenu', 1); }, { checked: ui == 1 });
            menuItem(menu, 'topbar', 'Top menu', function () { call('userInterfaceSelectMenu', 2); }, { checked: ui == 2 });
            menuItem(menu, 'fixed', 'Fixed width', function () { call('userInterfaceSelectMenu', 3); }, { checked: ui == 3 });
        }
        menu.appendChild(el('div', { className: 'mui-menu-sep' }));
        if (isShown('uiViewButton5')) { menuItem(menu, 'footer', 'Show footer', function () { call('toggleFooterBarMode'); }, { checked: (typeof footerBar != 'undefined') && footerBar }); }
        if (isShown('uiViewButton8')) { menuItem(menu, 'expand', 'Browser full screen', function () { call('toggleBrowserFullscreen'); }); }
        if (isShown('uiViewButton7')) { menuItem(menu, 'layout', 'Bootstrap interface…', function () { call('toggleBootstrapUIMode'); }); }
        menu.appendChild(el('div', { className: 'mui-menu-sep' }));
        if (enabled) {
            menuItem(menu, 'classic', 'Use classic look', function () { setPref('', '0'); call('reload'); });
        } else {
            menuItem(menu, 'classic', 'Use modern look', function () { setPref('', null); call('reload'); });
        }
    }

    function setTheme(mode) {
        call('putstore', 'nightMode', mode);
        if (typeof setNightMode == 'function') { window.nightMode = setNightMode(); }
    }

    // ---------- Command palette ----------

    var palette = null;

    function pageEntries() {
        // Each entry: [element that must be visible, label element(s), view number, icon]
        var list = [
            ['LeftMenuMyDevices', ['MainMenuMyDevices'], 1, 'devices'],
            ['LeftMenuMyAccount', ['MainMenuMyAccount'], 2, 'account'],
            ['LeftMenuMyEvents', ['MainMenuMyEvents'], 3, 'events'],
            ['LeftMenuMyEvents', ['MainMenuMyEvents', 'EventsReport'], 60, 'events'],
            ['LeftMenuMyFiles', ['MainMenuMyFiles'], 5, 'files'],
            ['LeftMenuMyUsers', ['MainMenuMyUsers'], 4, 'users'],
            ['LeftMenuMyUsers', ['MainMenuMyUsers', 'UsersGroups'], 50, 'users'],
            ['LeftMenuMyUsers', ['MainMenuMyUsers', 'UsersRecordings'], 52, 'users'],
            ['LeftMenuMyServer', ['MainMenuMyServer'], 6, 'server'],
            ['LeftMenuMyServer', ['MainMenuMyServer', 'ServerStats'], 40, 'server'],
            ['LeftMenuMyServer', ['MainMenuMyServer', 'ServerConsole'], 115, 'server'],
            ['LeftMenuMyServer', ['MainMenuMyServer', 'ServerTrace'], 41, 'server'],
            ['ServerPlugins', ['MainMenuMyServer', 'ServerPlugins'], 42, 'server']
        ];
        var out = [];
        list.forEach(function (p) {
            if (!isShown(p[0])) return;
            var label = p[1].map(text).filter(function (x) { return x != ''; }).join(' › ');
            if (label == '') return;
            out.push({ kind: 'page', title: label, sub: '', icon: ICONS[p[3]], run: function (e) { call('go', p[2], e); } });
        });
        return out;
    }

    function actionEntries() {
        var out = [];
        if (isShown('uiViewButton4')) {
            var dark = document.body.classList.contains('night');
            out.push({ kind: 'action', title: dark ? 'Switch to light theme' : 'Switch to dark theme', sub: 'Appearance', icon: dark ? ICONS.sun : ICONS.moon, run: function () { setTheme(dark ? '2' : '1'); } });
        }
        if ($('p2createMeshLink1') != null && isShown('p2createMeshLink1')) {
            out.push({ kind: 'action', title: 'Add device group', sub: text('MainMenuMyAccount'), icon: ICONS.plus, run: function () { call('account_createMesh'); } });
        }
        if (isShown('uiViewButton6')) { out.push({ kind: 'action', title: 'Personal notes', sub: '', icon: ICONS.notes, run: function () { call('showNotes', false); } }); }
        if ((narrow == null) || !narrow.matches) {
            out.push({ kind: 'action', title: collapsedPref ? 'Expand sidebar' : 'Collapse sidebar', sub: 'Appearance', icon: ICONS.sidebar, run: function () { setCollapsed(!collapsedPref); } });
        }
        out.push({ kind: 'action', title: enabled ? 'Use classic look' : 'Use modern look', sub: 'Appearance', icon: ICONS.classic, run: function () { setPref('', enabled ? '0' : null); call('reload'); } });
        return out;
    }

    function deviceEntries() {
        var out = [];
        if ((typeof nodes == 'undefined') || !Array.isArray(nodes)) return out;
        nodes.forEach(function (n) {
            var mesh = ((typeof meshes != 'undefined') && meshes[n.meshid]) ? meshes[n.meshid].name : '';
            var online = ((n.conn & 1) != 0);
            var sub = [mesh, n.host || n.ip || '', n.osdesc || ''].filter(function (x) { return x; }).join(' · ');
            var tags = Array.isArray(n.tags) ? n.tags.join(' ') : '';
            out.push({
                // Like the device list, agentless (local) devices are never drawn as offline.
                kind: 'device', title: n.name || '', alt: (n.rname || '') + ' ' + tags + ' ' + sub, sub: sub, online: online, iconClass: 'i' + (n.icon || 1) + ((online || (n.mtype == 3)) ? '' : ' gray'),
                agent: (n.mtype == 2), local: (n.mtype == 3),
                run: function (e) { call('gotoDevice', n._id, null, null, e); },
                open: function (view) { call('gotoDevice', n._id, view); call('go', view); }
            });
        });
        return out;
    }

    function groupEntries() {
        var out = [];
        if (typeof meshes == 'undefined') return out;
        for (var id in meshes) {
            var m = meshes[id];
            if ((m == null) || (m.deleted)) continue;
            (function (id, m) { out.push({ kind: 'group', title: m.name, sub: m.desc || '', icon: ICONS.group, run: function () { call('gotoMesh', id); } }); })(id, m);
        }
        return out;
    }

    function userEntries() {
        var out = [];
        if ((typeof users == 'undefined') || (users == null) || !isShown('LeftMenuMyUsers')) return out;
        for (var id in users) {
            var u = users[id];
            if (u == null) continue;
            (function (u) { out.push({ kind: 'user', title: u.realname || u.name, alt: u.name + ' ' + (u.email || ''), sub: [u.name, u.email].filter(function (x) { return x; }).join(' · '), icon: ICONS.user, run: function (e) { call('gotoUser', u._id, null, e); } }); })(u);
        }
        return out;
    }

    // Simple ranking: prefix match beats word-start match beats substring match.
    function score(entry, q) {
        if (q == '') return 1;
        var t = entry.title.toLowerCase(), a = (entry.alt || entry.sub || '').toLowerCase();
        if (t == q) return 100;
        if (t.indexOf(q) == 0) return 80;
        if ((' ' + t).indexOf(' ' + q) >= 0) return 60;
        if (t.indexOf(q) > 0) return 40;
        if (a.indexOf(q) >= 0) return 20;
        // All words present somewhere
        var words = q.split(/\s+/), all = t + ' ' + a;
        for (var i = 0; i < words.length; i++) { if (all.indexOf(words[i]) == -1) return 0; }
        return 10;
    }

    function openPalette(initial) {
        if (palette != null) { palette.input.focus(); return; }
        if (dialogOpen()) return;
        closeMenu();
        var backdrop = el('div', { className: 'mui-palette-backdrop' });
        var box = el('div', { className: 'mui-palette', role: 'dialog', 'aria-label': 'Search' });
        var inputRow = el('div', { className: 'mui-palette-input' }, ICONS.search);
        var input = el('input', { type: 'text', placeholder: 'Search devices, groups, users and pages…', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search' });
        var list = el('div', { className: 'mui-palette-list', role: 'listbox' });
        var foot = el('div', { className: 'mui-palette-foot' }, '<span><kbd class="mui-kbd">↑</kbd> <kbd class="mui-kbd">↓</kbd> to move</span><span><kbd class="mui-kbd">Enter</kbd> to open</span><span><kbd class="mui-kbd">Esc</kbd> to close</span>');
        inputRow.appendChild(input);
        box.appendChild(inputRow); box.appendChild(list); box.appendChild(foot);
        backdrop.appendChild(box);
        document.body.appendChild(backdrop);

        var sources = { device: deviceEntries(), group: groupEntries(), user: userEntries(), page: pageEntries(), action: actionEntries() };
        var groupNames = { page: 'Pages', device: 'Devices', group: 'Device groups', user: 'Users', action: 'Actions' };
        var order = ['device', 'page', 'group', 'user', 'action'];
        var limits = { device: 12, page: 8, group: 6, user: 6, action: 6 };
        var shown = [], active = 0;

        palette = { backdrop: backdrop, input: input };

        function render() {
            var q = input.value.trim().toLowerCase();
            shown = []; list.innerHTML = '';
            var groupsOrder = (q == '') ? ['page', 'device', 'action'] : order;
            groupsOrder.forEach(function (g) {
                var matches = sources[g].map(function (e) { return { e: e, s: score(e, q) }; }).filter(function (x) { return x.s > 0; });
                if (q != '') { matches.sort(function (a, b) { return (b.s - a.s) || a.e.title.localeCompare(b.e.title); }); }
                else if (g == 'device') { matches.sort(function (a, b) { return (b.e.online - a.e.online) || a.e.title.localeCompare(b.e.title); }); }
                matches = matches.slice(0, (q == '') ? ((g == 'device') ? 6 : limits[g]) : limits[g]);
                if (matches.length == 0) return;
                list.appendChild(el('div', { className: 'mui-palette-group' }, esc(groupNames[g])));
                matches.forEach(function (m) {
                    var e = m.e, index = shown.length;
                    var iconHtml = e.iconClass ? '<span class="mui-pi-icon ' + e.iconClass + '"></span>' : '<span class="mui-pi-icon">' + e.icon + '</span>';
                    var sub = e.sub ? esc(e.sub) : '';
                    if ((e.kind == 'device') && !e.local) { sub = '<span class="mui-status-dot' + (e.online ? ' mui-online' : '') + '"></span>' + (e.online ? 'Online' : 'Offline') + (sub ? ' · ' + sub : ''); }
                    var item = el('div', { className: 'mui-palette-item', role: 'option' }, iconHtml + '<div class="mui-pi-text"><div class="mui-pi-title">' + esc(e.title) + '</div>' + (sub ? '<div class="mui-pi-sub">' + sub + '</div>' : '') + '</div>');
                    if ((e.kind == 'device') && e.agent) {
                        var actions = el('div', { className: 'mui-pi-actions' });
                        [[11, text('MainDevDesktop') || 'Desktop'], [12, text('MainDevTerminal') || 'Terminal'], [13, text('MainDevFiles') || 'Files']].forEach(function (a) {
                            actions.appendChild(el('button', { type: 'button', onclick: function (ev) { ev.stopPropagation(); closePalette(); e.open(a[0]); } }, esc(a[1])));
                        });
                        item.appendChild(actions);
                    }
                    item.addEventListener('mousemove', function () { if (active != index) { setActive(index); } });
                    item.addEventListener('click', function (ev) { choose(index, ev); });
                    list.appendChild(item);
                    shown.push({ entry: e, node: item });
                });
            });
            if (shown.length == 0) { list.appendChild(el('div', { className: 'mui-palette-empty' }, 'No results for “' + esc(input.value) + '”')); }
            setActive(0);
        }

        function setActive(i) {
            if (shown.length == 0) return;
            active = (i + shown.length) % shown.length;
            shown.forEach(function (s, j) { s.node.classList.toggle('mui-active', j == active); });
            shown[active].node.scrollIntoView({ block: 'nearest' });
        }

        function choose(i, ev) {
            var s = shown[i];
            if (s == null) return;
            closePalette();
            s.entry.run(ev);
        }

        input.addEventListener('input', render);
        input.addEventListener('keydown', function (e) {
            if (e.key == 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
            else if (e.key == 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
            else if (e.key == 'Enter') { e.preventDefault(); choose(active, e); }
            else if (e.key == 'Escape') { e.preventDefault(); closePalette(); }
            e.stopPropagation();
        });
        // The classic UI handles keys on document; keep palette typing away from it.
        box.addEventListener('keypress', function (e) { e.stopPropagation(); });
        box.addEventListener('keyup', function (e) { e.stopPropagation(); });
        backdrop.addEventListener('mousedown', function (e) { if (e.target == backdrop) { closePalette(); } });

        if (initial) { input.value = initial; }
        render();
        input.focus();
    }

    function closePalette() {
        if (palette == null) return;
        palette.backdrop.remove();
        palette = null;
    }

    // ---------- Keyboard ----------

    // Views where keystrokes belong to a remote session (desktop, terminal, consoles).
    var REMOTE_VIEWS = [11, 12, 15, 115];

    function onKeyDown(e) {
        if ((e.key == 'k' || e.key == 'K') && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
            if (REMOTE_VIEWS.indexOf(currentView()) >= 0) return; // Ctrl+K means something to the remote shell
            e.preventDefault(); e.stopPropagation();
            if (palette != null) { closePalette(); } else { openPalette(); }
            return;
        }
        if (e.key == 'Escape' && openMenu != null) { closeMenu(); }
    }

    // ---------- Classic UI integration ----------

    // adjustPanels() writes inline grid rows using the classic 66px/24px sizes when parts of the
    // page are hidden by URL arguments. Translate them to this theme's sizes.
    function patchAdjustPanels() {
        if (typeof window.adjustPanels != 'function' || window.adjustPanels.muiPatched) return;
        var original = window.adjustPanels;
        var patched = function () {
            var r = original.apply(this, arguments);
            fixGridRows();
            return r;
        };
        patched.muiPatched = true;
        window.adjustPanels = patched;
        fixGridRows();
    }

    function fixGridRows() {
        var c = $('container');
        if ((c == null) || !enabled) return;
        var rows = c.style.gridTemplateRows;
        if (!rows) return;
        var fixed = rows.replace(/^66px/, 'var(--mui-header-h)').replace(/^((?:var\(--mui-header-h\)|0px|0)\s+)24px/, '$1var(--mui-tabs-h)').replace(/fit-content\(48px\)/, 'minmax(var(--mui-tabs-h), max-content)');
        if (fixed != rows) { c.style.gridTemplateRows = fixed; }
    }

    // The device page shows a 256px bitmap of the device type. Draw the same type with the
    // theme's icon instead, following every change the classic UI makes to the image.
    function setupDeviceIcon() {
        var img = $('MainComputerImage');
        if ((img == null) || img.muiObserved) return;
        img.muiObserved = true;
        var sync = function () {
            var m = /icons256-(\d+)-\d+\.png/.exec(img.getAttribute('src') || '');
            var big = img.parentNode.querySelector('.mui-bigicon');
            if (m == null) { img.classList.remove('mui-replaced'); if (big) { big.remove(); } return; } // Custom picture, keep it
            if (big == null) { big = el('div', { 'aria-hidden': 'true' }); img.parentNode.insertBefore(big, img); }
            big.className = 'mui-bigicon i' + m[1] + (img.classList.contains('gray') ? ' gray' : '');
            if (!img.classList.contains('mui-replaced')) { img.classList.add('mui-replaced'); }
        };
        new MutationObserver(sync).observe(img, { attributes: true, attributeFilter: ['src', 'class'] });
        sync();
    }

    // Move the classic "◆" button out of the way; the appearance menu replaces it.
    function setupClassicMenuButton() {
        var b = $('uiMenuButton');
        if (b != null) { b.style.display = 'none'; }
    }

    mui.onPage = function (view) {
        closeMenu();
        if (palette != null) { closePalette(); }
        updateUser();
    };

    mui.refresh = function () {
        if (!enabled) return;
        setupSidebar();
        setupHeader();
        updateUser();
    };

    // ---------- Start ----------

    function start() {
        if (enabled) {
            setupHeader();
            setupSidebar();
            setupClassicMenuButton();
            setupDeviceIcon();
            patchAdjustPanels();
            // userinfo arrives over the control web socket after startup.
            var tries = 0, timer = setInterval(function () { updateUser(); if ((++tries > 40) || ((typeof userinfo != 'undefined') && userinfo)) { clearInterval(timer); updateUser(); } }, 250);
        } else {
            addClassicToggle();
        }
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('click', function () { closeMenu(); });
        window.addEventListener('resize', closeMenu);
        // The classic UI computes some widths from the layout; refresh once our styles apply.
        if (enabled) { setTimeout(function () { call('mainUpdate', 512); }, 50); }
    }

    // With the modern look turned off, add one entry to the classic "◆" menu to turn it back on.
    function addClassicToggle() {
        var menu = $('uiMenu');
        if ((menu == null) || $('muiEnableButton')) return;
        var b = el('div', { id: 'muiEnableButton', tabindex: '0', title: 'Use modern look', style: 'margin:6px 2px 2px;padding:4px 8px;border-radius:4px;background:#2f6bed;color:#fff;font-weight:bold;text-align:center;cursor:pointer;white-space:nowrap' }, 'Modern look');
        b.addEventListener('click', function () { setPref('', null); call('reload'); });
        menu.appendChild(b);
    }

    start();
})();
