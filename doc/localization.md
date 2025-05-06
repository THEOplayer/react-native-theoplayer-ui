---
title: Localization
description: Learn how to localize the THEOplayer UI!
sidebar_position: 2
sidebar_custom_props: { 'icon': '🌍' }
---

# Localization

The React Native UI package supports full localization, allowing you to customize UI text to match the language and tone of your application. You can override default labels—such as menu titles, button text, and indicators—by supplying your own translations using the `localization` prop.

This is especially useful for building internationalized apps or tailoring the viewing experience for a specific audience.


## Example

Here's a simple example that sets Dutch translations for several UI elements:

```tsx
const App = () => {
  const myCustomLocale: Partial<Locale> = {
    backButton: 'Terug',
    settingsTitle: 'Instellingen',
    qualityTitle: 'Videokwaliteit',
    audioTitle: 'Taal',
    subtitleTitle: 'Ondertitels',
    playbackRateTitle: 'Afspeelsnelheid',
    liveLabel: 'LIVE',
    // For a full list of available keys, see the Localization interface.
  };
  return (
    <THEOplayerDefaultUi
      style={StyleSheet.absoluteFill}
      config={playerConfig}
      locale={myCustomLocale}
    />
  );
};
```

