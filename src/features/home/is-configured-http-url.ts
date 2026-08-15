/** True when the value is a usable external profile URL (not `#` or empty). */
export function isConfiguredHttpUrl(value: string | undefined): value is string {
  if (!value || value === '#') {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
