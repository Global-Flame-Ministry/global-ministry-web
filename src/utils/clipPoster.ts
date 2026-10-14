/**
 * Derives a lightweight poster frame from the video itself (never a cover
 * image/flyer). Cloudinary videos get an `so_0` still-frame transform; other
 * sources have no derivable poster here and return `undefined` (the player
 * falls back to the `#t=0.1` first-frame trick).
 */
export const getClipPoster = (url: string): string | undefined => {
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//.test(url)) return undefined;
  return url.replace(
    /(res\.cloudinary\.com\/[^/]+\/video\/upload\/)/,
    '$1so_0,w_1280,q_auto/'
  );
};
