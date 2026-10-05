const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/ui/hooks/useWaiting.ts');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const PlayerEventType = Object.fromEntries(
  ['WAITING', 'READYSTATE_CHANGE', 'ERROR', 'PLAY', 'PLAYING', 'PAUSE', 'ENDED', 'SEEKING', 'SOURCE_CHANGE', 'LOAD_START'].map((name) => [
    name,
    name.toLowerCase().replaceAll('_', ''),
  ]),
);

function createPlayer() {
  const listeners = new Map();
  return {
    paused: false,
    listeners,
    addEventListener(types, listener) {
      for (const type of types) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(listener);
      }
    },
    removeEventListener(types, listener) {
      for (const type of types) listeners.get(type)?.delete(listener);
    },
    emit(event) {
      for (const listener of [...(listeners.get(event.type) || [])]) listener(event);
    },
  };
}

function setup() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const context = { player: createPlayer() };
  const react = {
    useContext: () => context,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] = typeof value === 'function' ? value(slots[index]) : value;
        },
      ];
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module,
      exports: module.exports,
      require(name) {
        if (name === 'react') return react;
        if (name === 'react-native-theoplayer') return { PlayerEventType };
        if (name === '../barrel') return { PlayerContext: {} };
        throw new Error(`Unexpected import: ${name}`);
      },
    },
    { filename },
  );
  const render = () => {
    cursor = 0;
    effects = [];
    const waiting = module.exports.useWaiting();
    for (const effect of effects) effect();
    return waiting;
  };
  render();
  return {
    context,
    render,
    emit(...events) {
      for (const event of events) context.player.emit(typeof event === 'string' ? { type: event } : event);
      return render();
    },
    unmount() {
      for (const slot of slots) slot?.cleanup?.();
    },
  };
}

const lowReadyState = { type: 'readystatechange', readyState: 2 };

test('buffering and ready-state recovery retain normal spinner behavior', () => {
  const hook = setup();
  for (const readyState of [0, 1, 2]) assert.equal(hook.emit({ type: 'readystatechange', readyState }), true);
  for (const readyState of [3, 4]) assert.equal(hook.emit({ type: 'readystatechange', readyState }), false);
  assert.equal(hook.emit('waiting'), true);
  assert.equal(hook.emit('playing'), false);
});

test('ended clears buffering even when paused remains false', () => {
  const hook = setup();
  assert.equal(hook.emit(lowReadyState), true);
  assert.equal(hook.emit('ended'), false);
});

test('late EOF waiting and ready-state events cannot re-enable spinner in the same batch', () => {
  const hook = setup();
  assert.equal(hook.emit('ended', 'waiting', lowReadyState), false);
  assert.equal(hook.emit('waiting', lowReadyState), false);
});

test('late playing or play events alone do not undo EOF protection', () => {
  const hook = setup();
  hook.emit('ended');
  assert.equal(hook.emit('playing', 'play', 'waiting', lowReadyState), false);
});

test('pause hides spinner and resume restores outstanding buffering', () => {
  const hook = setup();
  assert.equal(hook.emit('waiting'), true);
  hook.context.player.paused = true;
  assert.equal(hook.emit('pause'), false);
  assert.equal(hook.emit(lowReadyState), false);
  hook.context.player.paused = false;
  assert.equal(hook.emit('play'), true);
  assert.equal(hook.emit('playing'), false);
});

test('replay seek clears EOF protection and allows buffering again', () => {
  const hook = setup();
  hook.emit('ended', lowReadyState);
  assert.equal(hook.emit('seeking', 'play', 'waiting'), true);
  assert.equal(hook.emit('playing'), false);
});

test('new source clears EOF and error state without waiting for a render', () => {
  const hook = setup();
  hook.emit('ended', 'error');
  assert.equal(hook.emit('sourcechange', 'waiting'), true);
});

test('errors suppress later buffering in the same batch', () => {
  const hook = setup();
  assert.equal(hook.emit('error', 'waiting', lowReadyState), false);
});

test('load start resets terminal state but does not show spinner while paused', () => {
  const hook = setup();
  hook.emit('ended', 'error');
  hook.context.player.paused = true;
  assert.equal(hook.emit('loadstart'), false);
  hook.context.player.paused = false;
  assert.equal(hook.emit('play'), true);
});

test('subscriptions and terminal flags belong to the current player', () => {
  const hook = setup();
  const oldPlayer = hook.context.player;
  hook.emit('ended');
  hook.context.player = createPlayer();
  hook.render();
  assert.equal(
    [...oldPlayer.listeners.values()].every((set) => set.size === 0),
    true,
  );
  assert.equal(hook.emit('waiting'), true);
  oldPlayer.emit({ type: 'ended' });
  assert.equal(hook.render(), true);
  hook.unmount();
  assert.equal(
    [...hook.context.player.listeners.values()].every((set) => set.size === 0),
    true,
  );
});
