---
sidebar_position: 2
sidebar_custom_props: { 'icon': '📦' }
slug: /react-native-ui/installation
---

# Installation

## Prerequisites

The UI components will depend on a `THEOplayerView` instance provided by `react-native-theoplayer`, so make
sure this package is installed.

## Adding the package dependency

Using the `npm`, `yarn`, or any other package manager, add the dependency to your project.

```bash
$ npm i @theoplayer/react-native-ui
```

The package contains a number of transitive dependencies that contain native iOS and Android platform code
as well. These are not auto-linked if your project does not already have them as a dependency,
so they need to be explicitly defined in the `react-native.config.js` file in project's root:

```typescript
module.exports = {
  dependencies: {
    'react-native-google-cast': {},
    'react-native-svg': {},
    '@react-native-community/slider': {},
  },
};
```

In the [next section](./ui.md) we cover how to add the UI components to `THEOplayerView`.
