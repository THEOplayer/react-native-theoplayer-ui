function isValidNumber(x: number): boolean {
  return !isNaN(x) && isFinite(x);
}

export function formatTime(time: number, guide: number = 0, preferNegative?: boolean): string {
  // Handle negative values at the end
  const negative = time < 0 || (preferNegative && time === 0);
  time = Math.abs(time);

  // Adjust for time being in milliseconds
  time = time / 1000;
  guide = guide / 1000;

  const guideMinutes = Math.floor((guide / 60) % 60);
  const guideHours = Math.floor(guide / 3600);

  let timeParts: string[];
  if (!isValidNumber(time)) {
    timeParts = [guideHours > 0 ? '--' : '', '--', '--'];
  } else {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor((time / 60) % 60);
    const hours = Math.floor(time / 3600);
    // Check if we need to show hours.
    const showHours = hours > 0 || guideHours > 0;
    // If hours are showing, we may need to add a leading zero to minutes.
    // Always show at least one digit of minutes.
    const showMinutesLeadingZero = showHours || guideMinutes >= 0;
    timeParts = [
      showHours ? `${hours}` : '',
      showMinutesLeadingZero && minutes < 10 ? `0${minutes}` : `${minutes}`,
      seconds < 10 ? `0${seconds}` : `${seconds}`,
    ];
  }

  const timePhrase = timeParts.filter((part) => part !== '').join(':');
  return `${negative ? '-' : ''}${timePhrase}`;
}
