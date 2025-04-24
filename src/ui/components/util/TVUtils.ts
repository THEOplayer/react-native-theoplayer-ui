import { Platform } from 'react-native';
import * as ReactNative from 'react-native';

export let useTVEventHandler: typeof ReactNative.useTVEventHandler = (handler) => {
  useTVEventHandler = (_handler) => {
    // Do nothing.
  };
  if (Platform.OS === 'ios' && Platform.isTV) {
    if (typeof ReactNative.useTVEventHandler === 'function') {
      useTVEventHandler = ReactNative.useTVEventHandler;
    } else {
      console.warn('useTVEventHandler not supported, a dependency on react-native-tvos is required.');
    }
  }
  return useTVEventHandler(handler);
};
