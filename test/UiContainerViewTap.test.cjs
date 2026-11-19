const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const uiContainerFile = path.resolve(__dirname, '../src/ui/components/uicontroller/UiContainer.tsx');
const viewTapHookFile = path.resolve(__dirname, '../src/ui/hooks/usePlayerViewTap.ts');

function compile(filename) {
  return ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
}

function createPlayer() {
  const listeners = new Map();
  return {
    paused: true,
    presentationMode: 'inline',
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(event) {
      for (const listener of [...(listeners.get(event.type) || [])]) listener(event);
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

function setup({ OS = 'web', viewTap = true } = {}) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let dirty = false;
  const react = {
    forwardRef: (render) => render,
    createElement: (type, props, ...children) => ({ type, props: { ...props }, children }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          const next = typeof value === 'function' ? value(slots[index]) : value;
          if (!Object.is(next, slots[index])) dirty = true;
          slots[index] = next;
        },
      ];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback: (callback) => callback,
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || !dependencies || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
    useImperativeHandle() {},
  };
  const PlayerEventType = {
    AD_EVENT: 'adevent',
    CAST_EVENT: 'castevent',
    PLAY: 'play',
    PLAYING: 'playing',
    PAUSE: 'pause',
    SOURCE_CHANGE: 'sourcechange',
    ENDED: 'ended',
    PRESENTATIONMODE_CHANGE: 'presentationmodechange',
    ...(viewTap ? { VIEW_TAP: 'viewtap' } : {}),
  };
  const theoplayer = {
    PlayerEventType,
    AdEventType: { AD_BREAK_BEGIN: 'adbreakbegin', AD_BREAK_END: 'adbreakend', AD_CLICKED: 'adclicked', AD_TAPPED: 'adtapped' },
    CastEventType: { CHROMECAST_STATE_CHANGE: 'chromecaststatechange', AIRPLAY_STATE_CHANGE: 'airplaystatechange' },
    PresentationMode: { pip: 'picture-in-picture', fullscreen: 'fullscreen', inline: 'inline' },
  };
  const modules = {
    react,
    'react-native': {
      Animated: {
        Value: class {
          setValue() {}
        },
        timing: () => ({ start: (onEnd) => onEnd?.() }),
        View: 'Animated.View',
      },
      AppState: { addEventListener: () => ({ remove() {} }) },
      Platform: { OS },
      View: 'View',
    },
    'react-native-theoplayer': theoplayer,
    '../util/PlayerContext': { PlayerContext: { Provider: 'PlayerContext.Provider' } },
    '../util/TVUtils': { useTVOSEventHandler: () => {} },
    '../message/ErrorDisplay': { ErrorDisplay: 'ErrorDisplay' },
    '../../hooks/useError': { useError: () => undefined },
    '../util/Locale': { defaultLocale: {} },
    '../../hooks/useWebMouseEvents': { useWebMouseEvents: () => {} },
    '../../hooks/useThrottledCallback': { useThrottledCallback: (callback) => callback },
  };
  const run = (filename) => {
    const module = { exports: {} };
    vm.runInNewContext(
      compile(filename),
      {
        exports: module.exports,
        module,
        setTimeout: () => 0,
        clearTimeout: () => {},
        require(name) {
          if (name === '../../hooks/usePlayerViewTap' && existsSync(viewTapHookFile)) return run(viewTapHookFile);
          assert.ok(name in modules, `Unexpected dependency: ${name}`);
          return modules[name];
        },
      },
      { filename },
    );
    return module.exports;
  };
  const { UiContainer } = run(uiContainerFile);
  const player = createPlayer();
  const props = { player, theme: { fadeAnimationTimoutMs: 2500, colors: { uiBackground: 'black' } }, center: 'center', bottom: 'bottom' };
  let tree;
  const render = () => {
    for (let i = 0; i < 20; i++) {
      dirty = false;
      cursor = 0;
      effects = [];
      tree = UiContainer(props, null);
      const pending = effects;
      pending.forEach((effect) => effect());
      if (!dirty) return;
    }
    throw new Error('UiContainer did not settle');
  };
  render();
  const find = (predicate, node) => {
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = find(predicate, child);
        if (found) return found;
      }
    } else if (node && typeof node === 'object' && 'props' in node) {
      if (predicate(node)) return node;
      return find(predicate, node.children);
    }
    return undefined;
  };
  return {
    player,
    emit(event) {
      player.emit(event);
      render();
    },
    container: () => find((element) => element.type === 'Animated.View', tree),
    background: () => find((element) => element.props.onResponderRelease !== undefined, tree),
    uiVisible: () => find((element) => element.type === 'PlayerContext.Provider', tree).props.value.ui.buttonsEnabled_,
  };
}

function startPlayback(ui) {
  ui.player.paused = false;
  ui.emit({ type: 'play' });
  ui.emit({ type: 'playing' });
}

test('web: the UI lets taps through to the player while it is visible', () => {
  const ui = setup();
  assert.equal(ui.container().props.pointerEvents, 'box-none');
  assert.equal(ui.background().props.pointerEvents, 'none');
});

test('web: a view tap hides the visible UI and shows it again on the next tap', () => {
  const ui = setup();
  startPlayback(ui);
  assert.equal(ui.uiVisible(), true);
  ui.emit({ type: 'viewtap' });
  assert.equal(ui.uiVisible(), false);
  assert.equal(ui.container().props.pointerEvents, 'box-none');
  ui.emit({ type: 'viewtap' });
  assert.equal(ui.uiVisible(), true);
});

test('web: a view tap during a linear ad break does not toggle the UI', () => {
  const ui = setup();
  startPlayback(ui);
  ui.emit({ type: 'adevent', subType: 'adbreakbegin' });
  ui.emit({ type: 'viewtap' });
  assert.equal(ui.uiVisible(), true);
});

test('web: a view tap before playback started does not toggle the UI', () => {
  const ui = setup();
  ui.emit({ type: 'viewtap' });
  assert.equal(ui.uiVisible(), true);
});

test('Android and iOS: a view tap hides the visible UI and shows it again on the next tap', () => {
  for (const OS of ['android', 'ios']) {
    const ui = setup({ OS });
    assert.equal(ui.container().props.pointerEvents, 'box-none');
    assert.equal(ui.background().props.pointerEvents, 'none');
    startPlayback(ui);
    ui.emit({ type: 'viewtap' });
    assert.equal(ui.uiVisible(), false);
    ui.emit({ type: 'viewtap' });
    assert.equal(ui.uiVisible(), true);
  }
});

test('Android and iOS: without the view tap event the UI keeps catching taps', () => {
  for (const OS of ['android', 'ios']) {
    const ui = setup({ OS, viewTap: false });
    assert.equal(ui.container().props.pointerEvents, 'auto');
    assert.equal(ui.background().props.pointerEvents, 'auto');
    assert.equal(ui.player.listenerCount('viewtap'), 0);
  }
});

test('web: without the view tap event the UI keeps catching taps', () => {
  const ui = setup({ viewTap: false });
  assert.equal(ui.container().props.pointerEvents, 'auto');
  assert.equal(ui.background().props.pointerEvents, 'auto');
});
