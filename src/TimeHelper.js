const formatToString = (formula) =>
  Math.round(formula).toString().padStart(2, "0");

export const formatSeconds = (seconds) => {
  const hours = formatToString(((seconds - (seconds % 3600)) / 3600) % 60);
  const mins = formatToString(((seconds - (seconds % 60)) / 60) % 60);
  const secs = formatToString(seconds % 60);
  return `${hours}:${mins}:${secs}`;
};

export const formatProgressToSeconds = (progress, durationSeconds) => {
  const seconds = (progress / 1000) * durationSeconds;
  return seconds;
};

export default formatSeconds;
