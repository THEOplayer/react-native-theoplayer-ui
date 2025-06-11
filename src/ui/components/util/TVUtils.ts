import { Platform } from 'react-native';
import * as ReactNative from 'react-native';

export type TVOSEvent = { eventType: string };
export type TVOSEventHandler = (handler: (event: TVOSEvent) => void) => void;

export const useTVOSEventHandler: TVOSEventHandler = (handler) => {
  let tvOSEventHandler = (_handler: (event: TVOSEvent) => void) => {}; // does nothing

  // on tvOS only, try to replace the tvOSEventHandler by the useTVEventHandler hook.
  if (Platform.OS === 'ios' && Platform.isTV) {
    if (typeof ReactNative.useTVEventHandler === 'function') {
      tvOSEventHandler = ReactNative.useTVEventHandler;
    } else {
      console.warn('useTVEventHandler not supported, a dependency on react-native-tvos is required.');
    }
  }

  return tvOSEventHandler(handler);
};
