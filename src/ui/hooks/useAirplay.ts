import { useContext, useEffect, useState } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { CastEvent, CastEventType, CastState, PlayerEventType } from 'react-native-theoplayer';

/**
 * Returns {@link react-native-theoplayer!THEOplayer.cast.airplay | the player's airplay state}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useAirplay = () => {
  const { player } = useContext(PlayerContext);
  const [castState, setCastState] = useState(player.cast.airplay?.state ?? CastState.unavailable);
  useEffect(() => {
    const onCastStateChangeEvent = (event: CastEvent) => {
      if (event.subType === CastEventType.AIRPLAY_STATE_CHANGE) {
        setCastState(event.state);
      }
    };
    player.addEventListener(PlayerEventType.CAST_EVENT, onCastStateChangeEvent);
  }, [player]);
  return castState;
};
