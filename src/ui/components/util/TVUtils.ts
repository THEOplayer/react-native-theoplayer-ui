import { Platform } from 'react-native';
import * as ReactNative from 'react-native';

export const useTVOSEventHandler: typeof ReactNative.useTVEventHandler = (handler) => {
  let tvOSEventHandler = (_handler: (event: ReactNative.HWEvent) => void) => {
    // Do nothing.
  };
  if (Platform.OS === 'ios' && Platform.isTV) {
    if (typeof ReactNative.useTVEventHandler === 'function') {
      tvOSEventHandler = ReactNative.useTVEventHandler;
    } else {
      console.warn('useTVEventHandler not supported, a dependency on react-native-tvos is required.');
    }
  }
  return tvOSEventHandler(handler);
};
