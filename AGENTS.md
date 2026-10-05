# Project Notes

- Run `npm run test`, `npm run lint`, and `npm run typescript -- --project tsconfig.build.json` for library verification. The root `npm run typescript` also checks example sources; `npm run build` builds both JavaScript formats and declarations.
- Node regression tests in `test/*.test.cjs` transpile TypeScript with dependency stubs. SeekBar tests load the installed slider implementation and simulate measured layout and gestures; they do not replace browser or device testing.
- SeekBar uses a zero-width thumb anchor with a centered visual thumb so slider values map across the full track width. Keep visual thumb dimensions independent of timeline geometry. Custom container margins change track bounds; custom hover previews must use those bounds and the same seekable range and one-second rounding.
- Slider 2.6.0 gesture coordinates include touch-area overflow. Its full-thumb subtraction also accounts for that overflow; changing it to half a thumb without changing the coordinate origin introduces an offset.
