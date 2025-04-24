import { Platform } from 'react-native';
import * as ReactNative from 'react-native';

export let useTVEventHandler: typeof ReactNative.useTVEventHandler = (handler) => {
  if (Platform.OS === 'ios' && Platform.isTV) {
    try {
      useTVEventHandler = ReactNative.useTVEventHandler;
      return useTVEventHandler(handler);
    } catch {
      console.warn('useTVEventHandler not supported, a dependency on react-native-tvos is required.');
    }
  }
  useTVEventHandler = (_handler) => {
    // Do nothing.
  };
  return useTVEventHandler(handler);
};
