export interface ScrubberState {
  /**
   * Whether the user is dragging the seekbar's thumb.
   */
  isScrubbing: boolean;

  /**
   * The current time while the user is dragging the seekbar's thumb.
   */
  currentTime: number | undefined;
}
