import { useCurrentTime } from '../../hooks/useCurrentTime';

export const useSliderTime = () => {
  const currentTime = useCurrentTime();
  return Number.isFinite(currentTime) ? Math.round(currentTime * 1e-3) * 1e3 : 0;
};
