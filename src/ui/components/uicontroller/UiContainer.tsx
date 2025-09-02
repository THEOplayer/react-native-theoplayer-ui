import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Platform, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';
import { type TVOSEvent, useTVOSEventHandler } from '../util/TVUtils';
import type { AdEvent, PresentationModeChangeEvent, THEOplayer } from 'react-native-theoplayer';
import { AdEventType, CastEvent, CastEventType, ErrorEvent, PlayerError, PlayerEventType, PresentationMode } from 'react-native-theoplayer';
import type { THEOplayerTheme } from '../../THEOplayerTheme';
import type { MenuConstructor, UiControls } from './UiControls';
import { ErrorDisplay } from '../message/ErrorDisplay';
import { type Locale, defaultLocale } from '../util/Locale';

export interface UiContainerProps {
  /**
   * The player that is provided to all children using PlayerContext.
   */
  player: THEOplayer;
  /**
   * The theme that is provided to all children using PlayerContext.
   */
  theme: THEOplayerTheme;
  /**
   * The localized strings used in the UI components.
   */
  locale?: Partial<Locale>;
  /**
   * The style of the container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * The style of the top slot.
   */
  topStyle?: StyleProp<ViewStyle>;
  /**
   * The style of the center slot.
   */
  centerStyle?: StyleProp<ViewStyle>;
  /**
   * The style of the bottom slot.
   */
  bottomStyle?: StyleProp<ViewStyle>;
  /**
   * The style of the top ad slot.
   */
  adTopStyle?: StyleProp<ViewStyle>;
  /**
   * The style of the center ad slot.
   */
  adCenterStyle?: StyleProp<ViewStyle>;
  /**
   * The style of the bottom ad slot.
   */
  adBottomStyle?: StyleProp<ViewStyle>;
  /**
   * The components to be put in the top slot.
   */
  top?: ReactNode;
  /**
   * The components to be put in the center slot.
   */
  center?: ReactNode;
  /**
   * The components to be put in the bottom slot.
   */
  bottom?: ReactNode;
  /**
   * The components to be put in the top slot during an ad.
   *
   * @remarks
   * <br/> - Currently only supported for web.
   */
  adTop?: ReactNode;
  /**
   * The components to be put in the center slot during an ad.
   *
   * @remarks
   * <br/> - Currently only supported for web.
   */
  adCenter?: ReactNode;
  /**
   * The components to be put in the bottom slot during an ad.
   *
   * @remarks
   * <br/> - Currently only supported for web.
   */
  adBottom?: ReactNode;
  /**
   * A slot to put components behind the UI background.
   */
  behind?: ReactNode;

  children?: never;
}

/**
 * The default style for a fullscreen centered view.
 */
export const FULLSCREEN_CENTER_STYLE: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  alignItems: 'center',
  justifyContent: 'center',
};

/**
 * The default style for the UI container.
 */
export const UI_CONTAINER_STYLE: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  zIndex: 0,
  justifyContent: 'center',
  overflow: 'hidden',
};

/**
 * The default style for the ad container.
 */
export const AD_CONTAINER_STYLE: ViewStyle = {
  position: 'absolute',
  top: 100,
  left: 0,
  bottom: 100,
  right: 0,
  zIndex: 0,
  justifyContent: 'center',
  overflow: 'hidden',
};

/**
 * The default style for the top container.
 */
export const TOP_UI_CONTAINER_STYLE: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  paddingTop: 10,
  paddingLeft: 10,
  paddingRight: 10,
};

/**
 * The default style for the center container.
 */
export const CENTER_UI_CONTAINER_STYLE: ViewStyle = {
  alignSelf: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  width: '100%',
};

/**
 * The default style for the bottom container.
 */
export const BOTTOM_UI_CONTAINER_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10,
};

/**
 * The default style for the ad container.
 */
export const AD_UI_TOP_CONTAINER_STYLE: ViewStyle = TOP_UI_CONTAINER_STYLE;
export const AD_UI_CENTER_CONTAINER_STYLE: ViewStyle = CENTER_UI_CONTAINER_STYLE;
export const AD_UI_BOTTOM_CONTAINER_STYLE: ViewStyle = BOTTOM_UI_CONTAINER_STYLE;

/**
 * A component that does all the coordination between UI components.
 * - It provides all UI components with the PlayerContext, so they can access the styling and player.
 * - It provides slots for UI components to be places in the top/center/bottom positions.
 * - It uses animations to fade the UI in and out when applicable.
 */
export const UiContainer = (props: UiContainerProps) => {
  const _currentFadeOutTimeout = useRef<number | undefined>(undefined);
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const [currentMenu, setCurrentMenu] = useState<React.ReactNode | undefined>(undefined);
  const [buttonsEnabled_, setButtonsEnabled] = useState(true);
  const [error, setError] = useState<PlayerError | undefined>(undefined);
  const [didPlay, setDidPlay] = useState(false);
  const [paused, setPaused] = useState(true);
  const [casting, setCasting] = useState(false);
  const [pip, setPip] = useState(false);
  const [adInProgress, setAdInProgress] = useState(false);
  const [adTapped, setAdTapped] = useState(false);
  const appStateSubscription = useRef<any>(null);
  const _menus = useRef<MenuConstructor[]>([]).current;
  const { player, locale } = props;

  const combinedLocale: Locale = { ...defaultLocale, ...locale };

  // Animation control
  const fadeOutBlocked = !didPlay || currentMenu !== undefined || casting || pip || paused;

  const doFadeOut_ = useCallback(() => {
    if (fadeOutBlocked) {
      return;
    }
    clearTimeout(_currentFadeOutTimeout.current);
    Animated.timing(fadeAnimation, {
      useNativeDriver: true,
      toValue: 0,
      duration: 200,
    }).start(() => {
      setButtonsEnabled(false);
    });
  }, [fadeOutBlocked, fadeAnimation]);

  const resumeUIFadeOut_ = useCallback(() => {
    clearTimeout(_currentFadeOutTimeout.current);
    // @ts-ignore
    _currentFadeOutTimeout.current = setTimeout(doFadeOut_, props.theme.fadeAnimationTimoutMs);
  }, [doFadeOut_, props.theme.fadeAnimationTimoutMs]);

  const fadeInUI_ = useCallback(
    (fadeOutEnabled: boolean = true) => {
      clearTimeout(_currentFadeOutTimeout.current);
      _currentFadeOutTimeout.current = undefined;
      setButtonsEnabled(true);
      Animated.timing(fadeAnimation, {
        useNativeDriver: true,
        toValue: 1,
        duration: 200,
      }).start();
      if (fadeOutEnabled) {
        resumeUIFadeOut_();
      }
    },
    [fadeAnimation, resumeUIFadeOut_],
  );

  // TVOS events hook
  useTVOSEventHandler((_event: TVOSEvent) => {
    fadeInUI_();
  });

  // Ad listeners hook
  useEffect(() => {
    const handleAdEvent = (event: AdEvent) => {
      if (event.subType === AdEventType.AD_BREAK_BEGIN) {
        setAdInProgress(true);
        setAdTapped(false);
      } else if (event.subType === AdEventType.AD_BREAK_END) {
        setAdInProgress(false);
        setAdTapped(false);
      } else if (event.subType === AdEventType.AD_CLICKED || event.subType === AdEventType.AD_TAPPED) {
        setAdTapped(true);
      }
    };

    player.addEventListener(PlayerEventType.AD_EVENT, handleAdEvent);
    appStateSubscription.current = AppState.addEventListener('change', (state) => {
      if (state === 'active' && adInProgress && adTapped) {
        player.play();
        setAdTapped(false);
      }
    });

    return () => {
      player.removeEventListener(PlayerEventType.AD_EVENT, handleAdEvent);
      appStateSubscription.current?.remove();
    };
  }, [player, adInProgress, adTapped]);

  // Player listeners hook
  useEffect(() => {
    const handlePlay = () => {
      setDidPlay(true);
      setPaused(false);
    };

    const handlePause = () => {
      setDidPlay(true);
      setPaused(true);
    };

    const handleSourceChange = () => {
      setPaused(player.paused);
    };

    const handleLoadStart = () => {
      setError(undefined);
    };

    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };

    const handleCastEvent = (event: CastEvent) => {
      if (event.subType === CastEventType.CHROMECAST_STATE_CHANGE || event.subType === CastEventType.AIRPLAY_STATE_CHANGE) {
        setCasting(event.state === 'connecting' || event.state === 'connected');
      }
    };

    const handleEnded = () => {
      fadeInUI_(false);
    };

    const handlePresentationModeChange = (event: PresentationModeChangeEvent) => {
      setPip(event.presentationMode === PresentationMode.pip);
      if (event.presentationMode !== PresentationMode.pip) {
        fadeInUI_();
      }
    };

    player.addEventListener(PlayerEventType.LOAD_START, handleLoadStart);
    player.addEventListener(PlayerEventType.ERROR, handleError);
    player.addEventListener(PlayerEventType.CAST_EVENT, handleCastEvent);
    player.addEventListener(PlayerEventType.PLAY, handlePlay);
    player.addEventListener(PlayerEventType.PLAYING, handlePlay);
    player.addEventListener(PlayerEventType.PAUSE, handlePause);
    player.addEventListener(PlayerEventType.SOURCE_CHANGE, handleSourceChange);
    player.addEventListener(PlayerEventType.ENDED, handleEnded);
    player.addEventListener(PlayerEventType.PRESENTATIONMODE_CHANGE, handlePresentationModeChange);

    setPip(player.presentationMode === 'picture-in-picture');

    return () => {
      player.removeEventListener(PlayerEventType.LOAD_START, handleLoadStart);
      player.removeEventListener(PlayerEventType.ERROR, handleError);
      player.removeEventListener(PlayerEventType.CAST_EVENT, handleCastEvent);
      player.removeEventListener(PlayerEventType.PLAY, handlePlay);
      player.removeEventListener(PlayerEventType.PLAYING, handlePlay);
      player.removeEventListener(PlayerEventType.PAUSE, handlePause);
      player.removeEventListener(PlayerEventType.SOURCE_CHANGE, handleSourceChange);
      player.removeEventListener(PlayerEventType.ENDED, handleEnded);
      player.removeEventListener(PlayerEventType.PRESENTATIONMODE_CHANGE, handlePresentationModeChange);
    };
  }, [player, paused, resumeUIFadeOut_, fadeInUI_, currentMenu]);

  // State reflecting hook
  useEffect(() => {
    if (currentMenu === undefined && !paused && didPlay) {
      resumeUIFadeOut_();
    } else {
      fadeInUI_(false);
    }
  }, [currentMenu, paused, didPlay, fadeInUI_, resumeUIFadeOut_]);

  // Interactions
  const openMenu_ = (menuConstructor: () => ReactNode) => {
    _menus.push(menuConstructor);
    setCurrentMenu(menuConstructor());
  };

  const closeCurrentMenu_ = () => {
    _menus.pop();
    const nextMenu = _menus.length > 0 ? _menus[_menus.length - 1] : undefined;
    setCurrentMenu(nextMenu?.());
  };

  const playPause_ = () => {
    if (paused) {
      player.play();
    } else {
      player.pause();
    }
  };

  const enterPip_ = () => {
    // Make sure the UI is disabled first before entering PIP
    clearTimeout(_currentFadeOutTimeout.current);
    fadeAnimation.setValue(0);
    setButtonsEnabled(false);
    player.presentationMode = PresentationMode.pip;
  };

  /**
   * Request to show the UI due to user input.
   */
  const onUserAction_ = useCallback(() => {
    if (!didPlay) {
      return;
    }
    fadeInUI_();
  }, [fadeInUI_, didPlay]);

  const combinedUiContainerStyle = [UI_CONTAINER_STYLE, props.style];
  const combinedAdContainerStyle = [AD_CONTAINER_STYLE, props.style];
  const showMobileAdLayout = adInProgress && Platform.OS != 'web';

  if (error !== undefined) {
    return <ErrorDisplay error={error} />;
  }

  if (Platform.OS !== 'web' && pip) {
    return <></>;
  }

  const ui: UiControls = {
    buttonsEnabled_,
    onUserAction_,
    openMenu_,
    closeCurrentMenu_,
    enterPip_,
  };

  return (
    <PlayerContext.Provider value={{ player, style: props.theme, ui, adInProgress, locale: combinedLocale }}>
      {/* The View behind the UI, that is always visible.*/}
      <View style={FULLSCREEN_CENTER_STYLE} pointerEvents={'none'}>
        {props.behind}
      </View>
      {/* The Animated.View is for showing and hiding the UI*/}
      {!showMobileAdLayout && (
        <Animated.View
          style={[combinedUiContainerStyle, { opacity: fadeAnimation }]}
          onTouchStart={onUserAction_}
          onTouchMove={onUserAction_}
          pointerEvents={buttonsEnabled_ ? 'auto' : 'box-only'}
          {...(Platform.OS === 'web' ? { onMouseMove: onUserAction_, onMouseLeave: doFadeOut_ } : {})}>
          {buttonsEnabled_ && (
            <>
              {/* The UI background */}
              <View style={[combinedUiContainerStyle, { backgroundColor: props.theme.colors.uiBackground }]} onTouchStart={doFadeOut_} />

              {/* The Settings Menu */}
              {currentMenu !== undefined && <View style={[combinedUiContainerStyle]}>{currentMenu}</View>}

              {/* The UI control bars*/}
              {currentMenu === undefined && !adInProgress && (
                <>
                  {didPlay && <View style={[TOP_UI_CONTAINER_STYLE, props.topStyle]}>{props.top}</View>}
                  <View style={[CENTER_UI_CONTAINER_STYLE, props.centerStyle]}>{props.center}</View>
                  {didPlay && <View style={[BOTTOM_UI_CONTAINER_STYLE, props.bottomStyle]}>{props.bottom}</View>}
                  {props.children}
                </>
              )}

              {/* The Ad UI */}
              {currentMenu === undefined && adInProgress && (
                <>
                  <View style={[AD_UI_TOP_CONTAINER_STYLE, props.adTopStyle]}>{props.adTop}</View>
                  <View style={[AD_UI_CENTER_CONTAINER_STYLE, props.adCenterStyle]}>{props.adCenter}</View>
                  <View style={[AD_UI_BOTTOM_CONTAINER_STYLE, props.adBottomStyle]}>{props.adBottom}</View>
                </>
              )}
            </>
          )}
        </Animated.View>
      )}
      {/* Simplistic ad view to allow play pause during an ad on mobile. */}
      {showMobileAdLayout && (
        <View style={[combinedAdContainerStyle]}>
          <TouchableOpacity style={[FULLSCREEN_CENTER_STYLE]} onPress={playPause_}></TouchableOpacity>
        </View>
      )}
    </PlayerContext.Provider>
  );
};
