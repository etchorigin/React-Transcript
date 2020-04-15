const formatToString = formula => Math.round(formula).toString().padStart(2, '0');

export const formatSeconds = seconds => {
    const hours = formatToString(((seconds - seconds % 3600) / 3600) % 60);
    const mins = formatToString(((seconds - seconds % 60) / 60) % 60);
    const secs = formatToString(seconds % 60);
    return `${hours}:${mins}:${secs}`
}

export const playedProgress = fraction => Math.round(fraction * 1000);

export default formatSeconds;
