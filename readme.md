# MeshCentral Modern UI

A plugin that gives the MeshCentral web interface a cleaner, modern look.

It restyles MeshCentral's existing interface instead of replacing it, so every feature works exactly as before. Each user can switch back to the classic look at any time.

## Features

- Clean header with search, an appearance menu and a user menu
- Labeled sidebar that collapses to icons, automatically on smaller screens
- Device list as cards or rows, with sharp vector icons
- Refreshed pages, tables, dialogs and right-click menus
- Light and dark themes, following MeshCentral's night mode setting
- Quick search with **Ctrl+K** (**⌘K** on Mac): jump to any device, group, user or page, or open a device's Desktop, Terminal or Files tab directly

## Requirements

- MeshCentral 1.1.0 or later (tested on 1.3.1)
- The plugin styles MeshCentral's default web interface. The Bootstrap interface, the mobile interface and the login page are not changed.

## Installation

### From the MeshCentral web interface

1. Enable plugins in `meshcentral-data/config.json`, then restart MeshCentral. The **Plugins** tab under **My Server** only appears once plugins are enabled.

   ```json
   "settings": {
     "plugins": { "enabled": true }
   }
   ```

2. Sign in as a full administrator and open **My Server → Plugins**.
3. Click **Download Plugin** and enter:

   ```
   https://raw.githubusercontent.com/sreggopjb/MeshCentral-ModernUI/main/config.json
   ```

4. Modern UI appears in the list as Disabled. Choose **Install** from the **Action** menu in its row.
5. Reload the page.

### Manually

1. Download this repository and put its contents in `meshcentral-data/plugins/modernui`. The folder must be named `modernui`.
2. Add the plugin to `meshcentral-data/config.json`:

   ```json
   "settings": {
     "plugins": { "enabled": true, "list": ["modernui"] }
   }
   ```

   With `list` set, MeshCentral loads only the plugins named there, and the Plugins tab can no longer install others.

3. Restart MeshCentral.

## Usage

- **Appearance menu** (sliders icon in the header): theme, layout, footer, and **Use classic look**.
- **Back to the modern look**: in the classic interface, open the **◆** menu at the top right and choose **Modern look**.
- **Search**: press **Ctrl+K** or click the search box. The shortcut is ignored on the Desktop, Terminal and Console tabs so it still reaches the remote machine.

The modern or classic choice is saved per browser.

## Updating and removing

- **Update**: when a newer version is available, it shows in the **Latest** column of **My Server → Plugins**. Choose **Upgrade** from the plugin's **Action** menu.
- **Remove**: choose **Disable**, then **Delete**, from the plugin's **Action** menu. For a manual install, remove it from `list`, delete the `modernui` folder and restart MeshCentral.

## Known limitations

- The plugin's own controls (search, appearance and user menus) are in English. MeshCentral's menus and pages keep their translations.
- The plugin depends on the markup of MeshCentral's default interface. A MeshCentral update that changes it may need a plugin update.

## License

Apache-2.0, the same as MeshCentral.
