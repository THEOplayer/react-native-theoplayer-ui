import { DependencyList, useEffect } from "react";
import { PlayerEventMap, THEOplayer } from "react-native-theoplayer";

export function usePlayerEvent<K extends keyof PlayerEventMap>(
  player: THEOplayer | undefined,
  event: K | K[],
  onEvent: (event: PlayerEventMap[K]) => void,
  dependencies: DependencyList = [],
) {
  useEffect(() => {
    player?.addEventListener(event, onEvent);
    return () => {
      player?.removeEventListener(event, onEvent);
    };
  }, [player, ...dependencies]);
}