import { useState, useEffect } from "react";

interface OptimizedLogoProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  width?: number;
  height?: number;
}

export default function OptimizedLogo({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackText = "EA",
  width = 128,
  height = 128,
}: OptimizedLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;
  }, [src]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 border border-border text-foreground font-mono font-bold text-xl ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-60"}`}
      width={width}
      height={height}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}
