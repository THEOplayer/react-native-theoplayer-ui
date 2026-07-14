---
"@theoplayer/react-native-ui": patch
---

Fixed skip buttons not appearing for MP4 sources whose `seekable` range stays empty even when a duration is known. `SkipButton` now remains visible when the media has a finite duration (mirroring `SeekBar`'s fallback).
