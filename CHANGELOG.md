---
description: Find out what's new in the React Native UI.
sidebar_custom_props: { 'icon': '📰' }
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Fixed an issue where the `SeekBar`'s seekable state was not updated when switching to a MP4 source.

## 0.7.1 (2024-04-16)

### Fixed

- Fixed an issue where the mute button sometimes did not update its icon after toggling.

## 0.7.0 (2024-04-11)

### Added

- Added support for THEOplayer 7.0 and React Native THEOplayer 7.0.

### Fixed

- Fixed TypeScript type definitions to export interfaces describing the props for all components.

## 0.6.0 (2024-03-27)

### Fixed

- Fixed an issue where the skip buttons would remain disabled for MP4 sources.

## 0.5.0 (2024-03-06)

### Added

- Added support for CSAI.

### Fixed

- Fixed connected state for chromecastButton to not take into account the casting state in general (e.g. airplay should not influence this state).

## 0.4.0 (2024-02-14)

### Added

- Added support for overriding button icons.

## 0.3.0 (2023-12-01)

### Fixed

- Fixed several transitioning issues related to PiP state changes and closing menus.

## 0.2.0 (2023-06-26)

### Fixed

- Fixed an issue where components were still tappable after the UI had faded out.

### Changed

- Assume `PlayerConfiguration.chromeless` to be `true` if not specified.

## 0.1.1 (2023-06-06)

### Fixed

- Fixed an issue on Web where using the `ChromecastButton` component would result in a crash.

## 0.1.0 (2023-06-05)

- Initial release.
