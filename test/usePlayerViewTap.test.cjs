const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/ui/hooks/usePlayerViewTap.ts');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});

function setup({ viewTap = true } = {}) {
  const listeners = new Map();
  const player = {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type) {
      for (const listener of [...(listeners.get(type) || [])]) listener({ type });
    },
    listenerCount: (type) => listeners.get(type)?.size ?? 0,
  };
  const cleanups = [];
  const react = { useEffect: (effect) => cleanups.push(effect()) };
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module,
      exports: module.exports,
      require(name) {
        if (name === 'react') return react;
        if (name === 'react-native-theoplayer') return { PlayerEventType: viewTap ? { VIEW_TAP: 'viewtap' } : {} };
        throw new Error(`Unexpected import: ${name}`);
      },
    },
    { filename },
  );
  let taps = 0;
  const supported = module.exports.usePlayerViewTap(player, () => taps++);
  return { player, supported, taps: () => taps, unmount: () => cleanups.forEach((cleanup) => cleanup?.()) };
}

test('subscribes to view taps and reports support', () => {
  const hook = setup();
  assert.equal(hook.supported, true);
  hook.player.emit('viewtap');
  assert.equal(hook.taps(), 1);
});

test('unsubscribes from view taps on unmount', () => {
  const hook = setup();
  hook.unmount();
  assert.equal(hook.player.listenerCount('viewtap'), 0);
  hook.player.emit('viewtap');
  assert.equal(hook.taps(), 0);
});

test('reports no support and adds no listener without the view tap event', () => {
  const hook = setup({ viewTap: false });
  assert.equal(hook.supported, false);
  assert.equal(hook.player.listenerCount('viewtap'), 0);
});
