---
description: Find out what's new in the React Native UI.
sidebar_custom_props: { 'icon': '📰' }
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added localization support.

### Fixed

- Fixed an issue where the play button would stay in the paused state after starting the stream.

## [0.11.0] (2025-04-03)

### Added

- Added `testID` properties on button and seekBar components to support automated testing.
- Added support for THEOplayer 9.0.

## [0.10.1] (2025-02-26)

### Fixed

- Fixed an issue for Web where the `SeekBar` component would throw an infinite loop error on Safari browsers.

## 0.10.0 (2025-01-22)

### Changed

- Replaced slider component as a dependency of the seek bar.

### Fixed

- Fixed an issue where an app using the UI would crash when using the `SeekBar` component while streaming a live asset.

## 0.9.0 (2024-10-25)

### Changed

- Ad play-out is resumed when the app is foregrounded again after tapping the ad `clickthrough`. This feature requires `react-native-theoplayer` v8.6.0.

## 0.8.0 (2024-09-11)

### Added

- Added support for THEOplayer 8.0.

### Fixed

- Fixed a deprecation warning by removing `defaultProps`.

## 0.7.2 (2024-05-15)

### Fixed

- Fixed an issue where the `SeekBar`'s seekable state was not updated when switching to a MP4 source.
- Fixed an issue where the `SkipButton` components are not rendered when switching sources while casting.

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
