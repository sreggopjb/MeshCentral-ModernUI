/**
* @description MeshCentral Modern UI plugin. Restyles the classic web interface and adds
*              navigation helpers on top of it, without replacing any of its logic.
* @license Apache-2.0
*/

"use strict";

module.exports.modernui = function (pluginHandler) {
    var obj = {};
    var path = require('path');

    obj.pluginHandler = pluginHandler;

    // Hooks listed here are serialized with toString() and run in the browser,
    // so they cannot use anything from this file's scope.
    obj.exports = ['onWebUIStartupEnd', 'goPageEnd'];

    // Static files the browser may request through pluginadmin.ashx?pin=modernui&asset=<name>.
    // This is an allow-list: nothing outside it is ever read from disk.
    var assets = {
        'modernui.css': 'text/css; charset=utf-8',
        'modernui-client.js': 'text/javascript; charset=utf-8'
    };

    // MeshCentral has already checked the IP filter and the user's session before calling this.
    obj.handleAdminReq = function (req, res, user) {
        var name = req.query.asset;
        if ((typeof name != 'string') || (Object.prototype.hasOwnProperty.call(assets, name) == false)) { res.sendStatus(404); return; }
        res.set({ 'Content-Type': assets[name], 'Cache-Control': 'private, no-cache', 'X-Content-Type-Options': 'nosniff' });
        res.sendFile(path.join(__dirname, 'public', name), { cacheControl: false });
    };

    // Browser side: load the stylesheet and the client script once the classic UI has started.
    obj.onWebUIStartupEnd = function () {
        if (window.modernui != null) { if (typeof window.modernui.refresh == 'function') { window.modernui.refresh(); } return; }
        // Only the classic interface (default.handlebars) is restyled; the Bootstrap one is left alone.
        if ((document.getElementById('theme-stylesheet') != null) || (document.getElementById('page_leftbar') == null)) return;
        window.modernui = {};

        var enabled = true;
        try { enabled = (localStorage.getItem('_modernui') !== '0'); } catch (ex) { }
        var base = 'pluginadmin.ashx?pin=modernui&asset=';
        var root = document.documentElement;
        var revealed = false;
        var reveal = function () { if (revealed) return; revealed = true; root.style.visibility = ''; };

        if (enabled) {
            // Keep the classic look from flashing while the stylesheet loads.
            root.style.visibility = 'hidden';
            root.classList.add('mui');
            var link = document.createElement('link');
            link.id = 'modernui-css';
            link.rel = 'stylesheet';
            link.href = base + 'modernui.css';
            link.onload = reveal;
            link.onerror = function () { root.classList.remove('mui'); reveal(); };
            document.head.appendChild(link);
            setTimeout(reveal, 2500);
        }

        var script = document.createElement('script');
        script.src = base + 'modernui-client.js';
        script.onerror = reveal;
        document.head.appendChild(script);
    };

    // Does nothing until the client script has loaded; it reads the current state itself on load.
    obj.goPageEnd = function (view, event) {
        if ((window.modernui != null) && (typeof window.modernui.onPage == 'function')) { window.modernui.onPage(view); }
    };

    return obj;
};
