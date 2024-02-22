# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Fixed connected state for chromecastButton to not take into account the casting state in general (e.g. airplay should not influence this state).

## [0.4.0] - 24-02-14

### Added

- Added support for overriding button icons.

## [0.3.0] - 23-12-01

### Fixed

- Fixed several transitioning issues related to PiP state changes and closing menus.

## [0.2.0] - 23-06-26

### Fixed

- Fixed an issue where components were still tappable after the UI had faded out.

### Changed

- Assume `PlayerConfiguration.chromeless` to be `true` if not specified.

## [0.1.1] - 23-06-06

### Fixed

- Fixed an issue on Web where using the `ChromecastButton` component would result in a crash.

## [0.1.0] - 23-06-05

- Initial release.
