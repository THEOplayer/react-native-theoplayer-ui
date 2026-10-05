const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(filename, modules) {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  });
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
  return module.exports;
}

function setup({ width = 1000, duration = 9000000, seekable = [], currentTime = 4500000, rtl = false, adInProgress = false, props = {} } = {}) {
  const player = { currentTime };
  const slots = [];
  let cursor = 0;
  const flatten = (style) => (Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}));
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    PureComponent: class {
      constructor(props) {
        this.props = props;
      }
      setState(patch, callback) {
        Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
        callback?.();
      }
    },
    useCallback: (callback) => callback,
    useContext: () => ({ player, adInProgress, style: { colors: { seekBarDot: 'white' } } }),
    useEffect: () => {},
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => (slots[index] = value)];
    },
  };
  class Value {
    constructor(value) {
      this.value = value;
    }
    setValue(value) {
      this.value = value;
    }
    __getValue() {
      return this.value;
    }
    interpolate({ inputRange, outputRange }) {
      return {
        __getValue: () => outputRange[0] + ((this.value - inputRange[0]) / (inputRange[1] - inputRange[0])) * (outputRange[1] - outputRange[0]),
      };
    }
  }
  const raw = (value) => (typeof value === 'number' ? value : value.__getValue());
  const native = {
    Animated: {
      Value,
      View: 'AnimatedView',
      add: (a, b) => ({ __getValue: () => raw(a) + raw(b) }),
      multiply: (a, b) => ({ __getValue: () => raw(a) * raw(b) }),
    },
    Easing: { inOut: () => {} },
    I18nManager: { isRTL: rtl },
    PanResponder: { create: (handlers) => ({ panHandlers: handlers }) },
    StyleSheet: { flatten, create: (styles) => styles },
    View: 'View',
  };
  const sliderFilename = require.resolve('@miblanchard/react-native-slider');
  const { Slider } = load(sliderFilename, {
    react,
    'react-native': native,
    './styles': load(path.join(path.dirname(sliderFilename), 'styles.js'), {}),
  });
  const { SeekBar } = load(path.resolve(__dirname, '../src/ui/components/seekbar/SeekBar.tsx'), {
    react,
    'react-native': native,
    '@miblanchard/react-native-slider': { Slider },
    '../util/PlayerContext': { PlayerContext: {} },
    '../../hooks/barrel': {
      useChaptersTrack: () => undefined,
      useDebounce: (callback) => (value, immediate) => immediate && callback(value),
      useDuration: () => duration,
      useSeekable: () => seekable,
    },
    './thumbnail/SingleThumbnailView': { SingleThumbnailView: 'Thumbnail' },
    './useSlider': { useSlider: () => [currentTime, true, () => {}] },
    '../../utils/TestIDs': { TestIDs: { SEEK_BAR: 'seek-bar' } },
    './SeekBarTouchHandler': { SeekBarTouchHandler: 'TouchHandler' },
    'react-native-theoplayer': { PlayerEventType: {} },
    '../../utils/NumberUtils': { fuzzyEquals: () => true },
  });
  let tree = SeekBar(props);
  tree.props.onLayout({ nativeEvent: { layout: { width } } });
  cursor = 0;
  tree = SeekBar(props);
  const sliderElement = tree.props.children[0].props.children[0];
  const slider = new Slider({ ...Slider.defaultProps, ...sliderElement.props });
  const containerStyle = flatten(slider.props.containerStyle);
  const margin = containerStyle.marginHorizontal ?? containerStyle.margin ?? 0;
  const left = containerStyle.marginLeft ?? margin;
  const right = containerStyle.marginRight ?? margin;
  const trackWidth = width - left - right;
  const elements = (element) => (!element?.props ? [] : [element, ...element.props.children.flat(Infinity).flatMap(elements)]);
  const layoutWidth = (element) =>
    flatten(element.props.style).width ??
    Math.max(
      0,
      ...element.props.children
        .flat(Infinity)
        .filter((child) => child?.props)
        .map(layoutWidth),
    );
  let thumb = elements(slider.render()).find((element) => element.props.key === 'slider-thumb-0');
  slider._measureContainer({ nativeEvent: { layout: { width: trackWidth, height: 40 } } });
  slider._measureThumb({ nativeEvent: { layout: { width: layoutWidth(thumb), height: 20 } } });
  const eventAt = (x) => ({ nativeEvent: { locationX: x - left + slider._getTouchOverflowSize().width / 2, locationY: 20 } });
  return {
    player,
    slider,
    flatten,
    begin(x) {
      const event = eventAt(x);
      assert.equal(slider._handleStartShouldSetPanResponder(event), true);
      slider._handlePanResponderGrant(event);
    },
    move(dx) {
      slider._handlePanResponderMove({}, { dx, dy: 0 });
    },
    end(dx = 0) {
      slider._handlePanResponderEnd({}, { dx, dy: 0 });
    },
    thumbPosition() {
      thumb = elements(slider.render()).find((element) => element.props.key === 'slider-thumb-0');
      const translation = raw(flatten(thumb.props.style).transform[0].translateX);
      return left + (rtl ? trackWidth + translation - slider.state.thumbSize.width / 2 : translation + slider.state.thumbSize.width / 2);
    },
  };
}

for (const width of [320, 1000]) {
  for (const fraction of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
    test(`click at ${fraction} of ${width}px bar matches edge-to-edge preview on 2.5h content`, () => {
      const app = setup({ width });
      app.begin(width * fraction);
      app.end();
      assert.equal(app.player.currentTime, fraction * 9000000);
      assert.ok(Math.abs(app.thumbPosition() - width * fraction) < 0.001);
    });
  }
}

test('DVR seek uses window start and end, not total duration', () => {
  const app = setup({ duration: Infinity, seekable: [{ start: 3600000, end: 12600000 }] });
  app.begin(250);
  app.end();
  assert.equal(app.player.currentTime, 5850000);
});

test('drag uses same mapping as clicks and scrubber preview', () => {
  const scrubbed = [];
  const app = setup({ props: { onScrubbing: (value) => scrubbed.push(value) } });
  app.begin(250);
  app.move(500);
  assert.equal(scrubbed.at(-1), 6750000);
  app.end(500);
  assert.equal(app.player.currentTime, 6750000);
});

test('near-thumb click seeks to pointer instead of retaining current value', () => {
  const app = setup();
  app.begin(505);
  app.end();
  assert.equal(app.player.currentTime, 4545000);
});

test('custom thumb dimensions and touch target do not affect seek mapping', () => {
  const app = setup({ props: { thumbStyle: [{ width: 48, height: 32 }, { borderRadius: 4 }], thumbTouchSize: { width: 80, height: 60 } } });
  app.begin(250);
  app.end();
  assert.equal(app.player.currentTime, 2250000);
  assert.equal(app.slider.state.thumbSize.width, 0);
  const anchor = app.slider.props.renderThumbComponent(0);
  assert.equal(app.flatten(anchor.props.style).width, 0);
  const visualStyle = app.flatten(anchor.props.children[0].props.style);
  assert.equal(visualStyle.width, 48);
  assert.equal(visualStyle.height, 32);
  assert.equal(visualStyle.borderRadius, 4);
});

test('custom container margins define visible track bounds', () => {
  const app = setup({ props: { sliderContainerStyle: { marginLeft: 20, marginRight: 60 } } });
  app.begin(20 + 920 * 0.25);
  app.end();
  assert.equal(app.player.currentTime, 2250000);
});

test('RTL reverses click mapping and thumb travel together', () => {
  const app = setup({ rtl: true });
  app.begin(250);
  app.end();
  assert.equal(app.player.currentTime, 6750000);
  assert.equal(app.thumbPosition(), 250);
});

for (const [dx, expected] of [
  [-2000, 0],
  [2000, 9000000],
]) {
  test(`drag beyond track clamps to ${expected}`, () => {
    const app = setup();
    app.begin(500);
    app.end(dx);
    assert.equal(app.player.currentTime, expected);
  });
}

test('disabled seekbar does not seek during ads', () => {
  const app = setup({ adInProgress: true });
  app.begin(250);
  app.move(500);
  app.end(500);
  assert.equal(app.player.currentTime, 4500000);
});

test('clicks retain one-second rounding relative to seekable start', () => {
  const app = setup({ seekable: [{ start: 1250, end: 9001500 }] });
  app.begin(251.234);
  app.end();
  assert.equal(app.player.currentTime, 2262250);
});

for (const [fraction, expectedLeft] of [
  [0, 0],
  [0.5, -175],
  [1, -350],
]) {
  test(`thumbnail at ${fraction} stays centered or clamped to seekbar bounds`, () => {
    const { SingleThumbnailView } = load(path.resolve(__dirname, '../src/ui/components/seekbar/thumbnail/SingleThumbnailView.tsx'), {
      react: {
        createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
        useContext: () => ({ player: { duration: 9000000 } }),
        useMemo: (callback) => callback(),
      },
      'react-native': { Dimensions: { get: () => ({ width: 1000, height: 1000 }) }, View: 'View' },
      '../../util/PlayerContext': { PlayerContext: {} },
      './ThumbnailView': { ThumbnailView: 'Thumbnail' },
      '../../../hooks/useThumbnailTrack': { useThumbnailTrack: () => ({}) },
      '../../../hooks/useSeekable': { useSeekable: () => [] },
      '../../../hooks/useDuration': { useDuration: () => 9000000 },
    });
    const thumbnail = SingleThumbnailView({ currentTime: fraction * 9000000, seekBarWidth: 1000 });
    assert.equal(thumbnail.props.style.left + (thumbnail.props.style.marginHorizontal ?? 0), expectedLeft);
  });
}
