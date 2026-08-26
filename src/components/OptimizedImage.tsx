import { useState } from "react";
import { getOptimizedImageUrl } from "../utils/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
  sizes = "100vw",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [failedOriginal, setFailedOriginal] = useState(false);

  if (!src) {
    return null;
  }

  const optimizedSrc = failedOriginal ? src : getOptimizedImageUrl(src, width, 75);

  if (hasError) {
    const fallbackClassName = `${className} flex items-center justify-center bg-zinc-900 border border-border text-muted-foreground font-mono text-xs`.trim();
    return (
      <div className={fallbackClassName} style={{ minHeight: height }}>
        image unavailable
      </div>
    );
  }

  const computedClassName = `${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`.trim();

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      className={computedClassName}
      style={{ objectFit: "cover" }}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        if (!failedOriginal) {
          setFailedOriginal(true);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}
