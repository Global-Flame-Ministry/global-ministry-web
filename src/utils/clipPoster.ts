/**
 * Derives a lightweight poster frame from the video itself (never a cover
 * image/flyer). Cloudinary videos get an `so_<posterTime>` still-frame
 * transform; other sources have no derivable poster here and return
 * `undefined` (the player falls back to the `#t=<posterTime>` first-frame
 * trick).
 */
export const getClipPoster = (url: string, posterTime = 1.5): string | undefined => {
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//.test(url)) return undefined;
  return url.replace(
    /(res\.cloudinary\.com\/[^/]+\/video\/upload\/)/,
    `$1so_${posterTime},w_1280,q_auto/`
  );
};
