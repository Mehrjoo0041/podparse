/**
 * Get the playable audio URL from an episode's narrated_audio_path.
 * If it's a full URL (from R2), use it directly.
 * If it's a relative path (local), prefix with '/'.
 */
export function getAudioUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `/${path}`;
}
