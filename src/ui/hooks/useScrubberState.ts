import { useMemo, useState } from 'react';
import type { ScrubberState } from '../components/seekbar/ScrubberState';

/**
 * Keeps the current scrubber state, while dragging the seekbar's thumb.
 *
 * @group Hooks
 */
export const useScrubberState = (): ScrubberState => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubberTime, setScrubberTime] = useState<number | undefined>(undefined);
  return useMemo(
    () => ({
      get isScrubbing() {
        return isScrubbing;
      },
      set isScrubbing(value) {
        setIsScrubbing(value);
      },
      get currentTime() {
        return scrubberTime;
      },
      set currentTime(value) {
        setScrubberTime(value);
      },
    }),
    [isScrubbing, scrubberTime],
  );
};
