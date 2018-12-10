# Minimo

[![License:MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

An elegant, simplified new tab page replacement for Google Chrome.

![Minimo Screenshot](/docs/screenshot@2x.png)

## Installing

Minimo is only available for Google Chrome on the [Chrome Webstore](https://chrome.google.com/webstore/detail/minimo/fanglmholkgdapjcfohfhnofcacjiodl) for now. 

Do you want minimo to support other browser? [Let us know!](https://github.com/krismuniz/minimo/issues/new)

## Features

* Useful information at a glance
  * current date & time
  * connection status (offline/online)
  * estimated download speed in Mbps
  * battery level
  * synced tabs from remote Chrome sessions
* An optional button for your navigation bar for quick access to your shortcuts and synced tabs.
* Simple UI for customizing shortcuts that sync as Bookmarks across all your devices
* Rich-text, minimal scratchpad called "Writing mode" to you jot down notes for later (stored locally, in a per-device basis)
* Variety of color themes and synced preferences across browser sessions

## Usage Guide

#### Adding Shortcuts

If you have not added any shortcut to Minimo yet, you should see an `Add Shortcut` button at the top-center part of your new tab page. If you already have shortcuts you can add a new one by right-clicking the new tab page and selecting `Add new shortcut`.

#### Editing a Shortcut

Right-click the shortcut you want to delete and then select `Edit`. You will see a modal dialog window where you can edit your shortcut's title and url.

#### Deleting a Shortcut

Right-click the shortcut you want to delete and then select `Delete`. Your shortcut will be deleted immediately.

#### Rearranging Shortcuts

Drag-and-drop shortcuts to rearrange them. The order will be saved automatically and synced across all your devices via Bookmarks.

#### Changing Minimo's Appearance

Right-click the new tab page and click `Change appearance`. You will see a modal dialog window where you can select your preferred mode (light or dark), theme, favicon, and advanced settings such as time format (12hr or 24hr), keyboard shortcuts, and custom CSS style.

#### Toggle Writing Mode On/Off

Right-click the new tab page and click `Exit writing mode` or `Enter writing mode`. Alternatively, you can use the default keyboard shortcut `shift+⌘` keys (`ctrl+shift` in Windows) or change it in `Change Appearance...` > `Advanced Settings` > `Writing Mode Keyboard Shortcut`

## Privacy

**Minimo does not collect any data. Period.**

Although this extension reads your bookmarks and session data to display shortcuts and synced tabs from remote Chrome sessions, your data does not leave your devices. 

## Contributing

#### Bug Reports & Feature Requests

Something does not work as expected or perhaps you think this extension _needs_ a feature? Please open an issue using GitHub [issue tracker](https://github.com/krismuniz/minimo/issues/new). 

Make sure that an issue pointing out your specific problem does not exist already. Please be as specific and straightforward as possible.

#### Pull Requests

Pull Requests (PRs) are welcome! You should follow the [same basic stylistic conventions](http://standardjs.com/rules.html) as the original code. 

Make sure that a pull request solving your specific problem does not exist already. Your changes must be concise and focus on solving a discrete problem.

## License

[The MIT License (MIT)](https://github.com/krismuniz/minimo/blob/master/LICENSE.md)

Copyright (c) 2018 [Kristian Muñiz](https://www.krismuniz.com)
