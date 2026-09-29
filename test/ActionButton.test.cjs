const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/ui/components/button/actionbutton/ActionButton.tsx');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
});

function setup(isTV, OS = 'kepler') {
  const slots = [];
  let cursor = 0;
  let userActions = 0;
  const context = {
    style: { colors: { icon: 'white', iconSelected: 'yellow' } },
    ui: { buttonsEnabled_: true, onUserAction_: () => userActions++ },
  };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useContext: () => context,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] = value;
        },
      ];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
  };
  const modules = {
    react,
    'react-native': {
      Platform: { isTV, OS },
      View: 'View',
      Image: 'Image',
      TouchableOpacity: 'TouchableOpacity',
      PanResponder: { create: (handlers) => ({ panHandlers: handlers }) },
    },
    '../svg/SvgUtils': { SvgContext: { Provider: 'SvgProvider' } },
    '../../util/PlayerContext': { PlayerContext: {} },
  };
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      exports: module.exports,
      module,
      require(name) {
        assert.ok(name in modules, `Unexpected dependency: ${name}`);
        return modules[name];
      },
    },
    { filename },
  );
  return {
    context,
    get userActions() {
      return userActions;
    },
    render(props = {}) {
      cursor = 0;
      return module.exports.ActionButton(props);
    },
  };
}

for (const platform of ['kepler', 'android', 'ios']) {
  test(`${platform} TV uses a native touchable without pan handlers`, () => {
    const app = setup(true, platform);
    let presses = 0;
    const button = app.render({ testID: 'play', activeOpacity: 0.4, onPress: () => presses++ });
    assert.equal(button.type, 'TouchableOpacity');
    assert.equal(button.props.onPanResponderRelease, undefined);
    assert.equal(button.props.testID, 'play');
    assert.equal(button.props.activeOpacity, 0.4);
    button.props.onPress();
    assert.equal(presses, 1);
    assert.equal(app.userActions, 1);
  });
}

test('TV presses use current callback and respect UI enablement', () => {
  const app = setup(true);
  let oldPresses = 0;
  let newPresses = 0;
  app.render({ onPress: () => oldPresses++ });
  const button = app.render({ onPress: () => newPresses++ });
  button.props.onPress();
  assert.equal(oldPresses, 0);
  assert.equal(newPresses, 1);
  app.context.ui.buttonsEnabled_ = false;
  button.props.onPress();
  assert.equal(newPresses, 1);
  assert.equal(app.userActions, 2);
});

test('TV user activity precedes the callback so controls remain hidden after PiP entry', () => {
  const app = setup(true);
  const calls = [];
  let visible = true;
  let opacity = 1;
  app.context.ui.onUserAction_ = () => {
    calls.push('userAction');
    visible = true;
    opacity = 1;
  };
  const button = app.render({
    onPress: () => {
      calls.push('press');
      visible = false;
      opacity = 0;
    },
  });
  button.props.onPress();
  assert.deepEqual(calls, ['userAction', 'press']);
  assert.equal(visible, false);
  assert.equal(opacity, 0);
});

test('TV focus changes icon tint without adding a border', () => {
  const app = setup(true);
  const props = { svg: 'icon' };
  let button = app.render(props);
  assert.equal(button.props.children[0].props.value.fill, 'white');
  button.props.onFocus();
  button = app.render(props);
  assert.equal(button.props.children[0].props.value.fill, 'yellow');
  assert.equal(Object.assign({}, ...button.props.style).borderWidth, undefined);
  assert.equal(app.userActions, 1);
  button.props.onBlur();
  button = app.render(props);
  assert.equal(button.props.children[0].props.value.fill, 'white');
});

for (const platform of ['android', 'ios', 'web']) {
  test(`${platform} non-TV retains pan press, opacity, and cancellation`, () => {
    const app = setup(platform === 'web' ? undefined : false, platform);
    let presses = 0;
    const props = { onPress: () => presses++, activeOpacity: 0.4 };
    let button = app.render(props);
    assert.equal(button.type, 'View');
    assert.equal(button.props.onPress, undefined);
    assert.equal(button.props.onStartShouldSetPanResponder(), true);
    assert.equal(button.props.onMoveShouldSetPanResponder(), false);
    button.props.onPanResponderRelease();
    assert.equal(presses, 0);
    button.props.onPanResponderGrant();
    button = app.render(props);
    assert.equal(Object.assign({}, ...button.props.style).opacity, 0.4);
    button.props.onPanResponderRelease();
    assert.equal(presses, 1);
    assert.equal(Object.assign({}, ...app.render(props).props.style).opacity, undefined);
    for (const cancel of ['onPanResponderTerminate', 'onPanResponderReject']) {
      button.props.onPanResponderGrant();
      button.props[cancel]();
      button.props.onPanResponderRelease();
      assert.equal(presses, 1);
    }
  });
}

for (const isTV of [true, false]) {
  test(`preserves rendering and decorative behavior with isTV=${isTV}`, () => {
    const app = setup(isTV);
    const icon = { uri: 'test-icon' };
    const style = { padding: 12 };
    const button = app.render({ icon, highlighted: true, style, children: 'label' });
    assert.equal(button.props.style[1], style);
    assert.equal(button.props.children[1].props.source, icon);
    assert.equal(button.props.children[1].props.style[1].tintColor, 'yellow');
    assert.equal(button.props.children[2], 'label');
    const svgButton = app.render({ svg: 'svg', icon });
    assert.equal(svgButton.props.children[1], false);
    const decorative = app.render({ touchable: false, svg: 'svg' });
    assert.equal(decorative.type, 'View');
    assert.equal(decorative.props.onPress, undefined);
    assert.equal(decorative.props.onPanResponderGrant, undefined);
    assert.equal(decorative.props.children[0], 'svg');
  });
}
