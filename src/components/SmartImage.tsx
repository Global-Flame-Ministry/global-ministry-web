import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export type SmartImageVariant = 'article' | 'frame' | 'thumb';

export interface SmartImageProps {
  src?: string | null;
  alt: string;
  variant?: SmartImageVariant;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  /** Width / height ratio used by the 'frame' variant (default 16/10) and 'thumb' (1). */
  ratio?: number;
  /** Optional caption rendered under an 'article' image. */
  caption?: string;
  /** Override corner rounding. Use "" when a parent already clips its corners. */
  rounded?: string;
}

interface NaturalSize {
  w: number;
  h: number;
}

const DEFAULT_FRAME_RATIO = 16 / 10;
const RATIO_TOLERANCE = 0.15;

const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
};

const useNaturalSize = (src?: string | null): NaturalSize | null => {
  const [measured, setMeasured] = useState<(NaturalSize & { src: string }) | null>(null);
  useEffect(() => {
    if (!src) return;
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setMeasured({ src, w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      if (active) setMeasured(null);
    };
    img.src = src;
    return () => {
      active = false;
    };
  }, [src]);
  return measured && measured.src === src
    ? { w: measured.w, h: measured.h }
    : null;
};

const Placeholder: React.FC<{ iconClass?: string }> = ({ iconClass }) => (
  <div className="flex h-full w-full items-center justify-center bg-[#f3f3f9] text-[#b57edc]">
    <ImageIcon className={iconClass ?? 'h-8 w-8'} aria-hidden />
  </div>
);

interface CommonProps {
  src?: string | null;
  alt: string;
  priority: boolean;
  className?: string;
}

const ArticleImage: React.FC<CommonProps & { caption?: string }> = ({
  src,
  alt,
  priority,
  className,
  caption,
}) => {
  const size = useNaturalSize(src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = usePrefersReducedMotion();

  const naturalMaxWidth = size ? `${size.w}px` : undefined;
  const skeletonRatio = size ? `${size.w} / ${size.h}` : '16 / 10';
  const showSkeleton = (!loaded && !!src && !failed) || !src || failed;

  return (
    <figure className={`my-6 flex flex-col items-center ${className ?? ''}`}>
      <div
        className="relative flex w-full justify-center"
        style={{ maxWidth: naturalMaxWidth }}
      >
        {showSkeleton && (
          <div
            className={`w-full max-w-full rounded-2xl border border-[#d5c0d1]/40 bg-[#f3f3f9] ${
              !src || failed ? 'flex items-center justify-center' : 'animate-pulse'
            }`}
            style={{ aspectRatio: skeletonRatio, maxHeight: '70vh' }}
          >
            {(!src || failed) && <ImageIcon className="h-10 w-10 text-[#b57edc]" aria-hidden />}
          </div>
        )}

        {src && !failed && (
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`h-auto w-auto max-w-full max-h-[70vh] sm:max-h-[560px] rounded-2xl border
              border-[#d5c0d1]/30 object-contain shadow-sm
              ${loaded ? 'opacity-100' : 'opacity-0'}
              ${loaded && !reduced ? 'transition-opacity duration-500' : ''}`}
          />
        )}
      </div>

      {caption && (
        <figcaption className="mt-2 max-w-2xl text-center text-xs text-[#837280]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

const FittedImage: React.FC<CommonProps & { ratio: number; rounded: string }> = ({
  src,
  alt,
  priority,
  className,
  ratio,
  rounded,
}) => {
  const size = useNaturalSize(src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = usePrefersReducedMotion();

  const withinTolerance = size
    ? Math.abs(size.w / size.h - ratio) / ratio <= RATIO_TOLERANCE
    : false;
  const showBlurLayer = !!src && !failed && loaded && !withinTolerance;

  return (
    <div
      className={`relative overflow-hidden bg-[#f3f3f9] ${rounded} ${className ?? ''}`}
      style={{ aspectRatio: `${ratio}` }}
    >
      {(!src || failed) && <Placeholder />}

      {src && !failed && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-[#f3f3f9]" aria-hidden />
      )}

      {showBlurLayer && (
        <>
          <img
            src={src ?? undefined}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
          />
          <div aria-hidden className="absolute inset-0 bg-black/20" />
        </>
      )}

      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`relative h-full w-full ${
            withinTolerance ? 'object-cover' : 'object-contain'
          } ${loaded ? 'opacity-100' : 'opacity-0'}
            ${loaded && !reduced ? 'transition-opacity duration-500' : ''}`}
        />
      )}
    </div>
  );
};

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  variant = 'article',
  className,
  loading,
  priority,
  ratio,
  caption,
  rounded,
}) => {
  const resolvedPriority = priority || loading === 'eager';

  if (variant === 'article') {
    return (
      <ArticleImage
        src={src}
        alt={alt}
        priority={resolvedPriority}
        className={className}
        caption={caption}
      />
    );
  }

  if (variant === 'thumb') {
    return (
      <FittedImage
        src={src}
        alt={alt}
        priority={resolvedPriority}
        className={className}
        ratio={1}
        rounded={rounded ?? 'rounded-lg'}
      />
    );
  }

  return (
    <FittedImage
      src={src}
      alt={alt}
      priority={resolvedPriority}
      className={className}
      ratio={ratio ?? DEFAULT_FRAME_RATIO}
      rounded={rounded ?? 'rounded-2xl'}
    />
  );
};

export default SmartImage;
