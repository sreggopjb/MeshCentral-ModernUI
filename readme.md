# MeshCentral Modern UI

A MeshCentral plugin that gives the classic web interface a modern look and a few navigation helpers, without replacing any of MeshCentral's own interface code. Every page, dialog and feature is still MeshCentral's, so everything keeps working, and each user can switch back to the classic look at any time.

## What it changes

- **Header**: a clean top bar with the server title, a search box, an appearance menu and a user menu.
- **Sidebar**: labeled navigation with line icons instead of the large bitmap buttons. It can be collapsed to an icon rail, and becomes one automatically on windows narrower than 1200px.
- **Tabs, toolbars, buttons, inputs**: consistent sizes, rounded corners, focus rings.
- **Device list**: devices as cards (column view) or clean rows (list view), with vector device icons. Offline devices are drawn in gray, as in the classic UI.
- **Device, group, user, account and server pages**: information shown in cards, tables restyled, the large device picture drawn as a vector icon.
- **Dialogs and right-click menus**: modern modal and popover styling.
- **Light and dark themes**: follows MeshCentral's own night mode setting (System, Light or Dark).
- **Command palette** (Ctrl+K or ⌘K, or click the search box): jump to any device, device group, user or page, and open a device's Desktop, Terminal or Files tab directly. The shortcut is ignored on the Desktop, Terminal and Console tabs so it still reaches the remote session.

## What it does not change

- Only the classic interface (`default.handlebars`) is restyled. The Bootstrap interface, the mobile interface and the login page are left as they are; MeshCentral does not load plugins on the login page.
- Remote desktop, terminal and file transfer still use MeshCentral's own code. The toolbars around them are restyled but keep their original heights so the remote screen is sized exactly as before.
- Text added by the plugin (the search box, the palette, the appearance and user menus) is in English. Menu labels come from MeshCentral's own, translated, interface.

## Switching between modern and classic

Each user chooses for themselves, in their browser:

- **Modern to classic**: Appearance menu (sliders icon in the header) → **Use classic look**.
- **Classic to modern**: the classic **◆** menu → **Modern look**.

The choice is stored in the browser's local storage (`_modernui`), so it is per browser rather than per account.

## Installing

MeshCentral loads plugins from `meshcentral-data/plugins/<shortName>`. This plugin's short name is `modernui`, so the folder must be named `modernui`.

### Option 1: manual install

1. Copy this folder to `meshcentral-data/plugins/modernui` (it must contain `modernui.js`, `config.json` and `public/`).
2. Enable plugins and list this one in `meshcentral-data/config.json`:

   ```json
   {
     "settings": {
       "plugins": { "enabled": true, "list": ["modernui"] }
     }
   }
   ```

3. Restart MeshCentral.

With `list` set, MeshCentral loads exactly the plugins named there and the **My Server → Plugins** page is not used to install or enable them.

### Option 2: install from My Server → Plugins

1. Enable plugins in `meshcentral-data/config.json`, without a `list`, and restart MeshCentral:

   ```json
   {
     "settings": {
       "plugins": { "enabled": true }
     }
   }
   ```

2. As a full administrator, open **My Server → Plugins → Download Plugin** and enter:

   ```
   https://raw.githubusercontent.com/sreggopjb/MeshCentral-ModernUI/main/config.json
   ```

3. The plugin appears in the list as Disabled. Click **Install** in its row. MeshCentral downloads the `main` branch as a ZIP and enables it.

The URLs in `config.json` point at this repository's `main` branch. If you fork or move it, update `homepage`, `configUrl`, `downloadUrl`, `changelogUrl`, `versionHistoryUrl` and `repository.url` to match. `versionHistoryUrl` lists the repository's Git tags, which MeshCentral offers as older versions to install; tag releases as `v0.1.0`, `v0.2.0` and so on.

## How it works

- `modernui.js` is the server module MeshCentral loads. It exports two browser hooks, `onWebUIStartupEnd` and `goPageEnd`, which MeshCentral serializes into the page. On startup the first one adds the stylesheet and the client script to the page.
- The stylesheet and script are served through MeshCentral's own `pluginadmin.ashx?pin=modernui&asset=...` route, which requires a logged-in session. Only the two files in `public/` can be requested.
- `public/modernui.css` scopes every rule under `html.mui`, so nothing applies when the theme is off or fails to load.
- `public/modernui-client.js` adds the header controls, sidebar labels, appearance menu and command palette. It only calls functions the classic interface already has (`go`, `gotoDevice`, `setNightMode`, `userInterfaceSelectMenu`, ...).

### Layout budget

The classic interface sizes its panels with `calc(100vh - N)`, where `N` assumes a 66px header, a 24px tab bar, a 45px footer and about 95px for a page title and its toolbar. This theme keeps those totals (56px header + 34px tab bar, a ~50px title and a ~40px toolbar) so the lists, the remote desktop and the terminal fit the window exactly. When the classic UI writes grid sizes inline (for example in the single-device pop-out view, `hide=16`), the client script translates them to the theme's sizes.

If you change sizes in the stylesheet, check that no page grows taller than its content area. From the browser console on each page:

```js
var c = document.getElementById('column_l'); c.scrollHeight - c.clientHeight; // should be 0
```

## Compatibility

Built and tested against MeshCentral 1.3.1 in Chromium, at 1440×900 and 1024×680, with the sidebar, top menu and fixed width layouts, light and dark themes, and the footer on and off. It depends on element ids and classes of the classic interface, so a MeshCentral update that changes that markup may need matching changes here.

## License

Apache-2.0, the same as MeshCentral.
