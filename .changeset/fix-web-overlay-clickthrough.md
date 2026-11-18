---
'@theoplayer/react-native-ui': patch
---

Fixed clicks on elements drawn by the player, such as THEOads overlay clickthroughs, being blocked by the UI on Web when used with a `react-native-theoplayer` version that dispatches `PlayerEventType.VIEW_TAP`.
