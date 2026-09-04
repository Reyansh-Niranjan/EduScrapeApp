import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export default function Logo({ className = "w-7 h-7", size, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      aria-label="NovaSlate Logo"
      {...props}
    >
      <defs>
        <linearGradient id="ns-logo-grad-primary" x1="10" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#E4E4E7" />
          <stop offset="100%" stopColor="#A1A1AA" />
        </linearGradient>
        <linearGradient id="ns-logo-grad-accent" x1="42" y1="10" x2="52" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ns-logo-grad-diag" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>
      </defs>

      {/* Obsidian Container Frame */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="#09090B"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />

      {/* Corner Technical Registration Dots */}
      <circle cx="12" cy="12" r="1.25" fill="rgba(255,255,255,0.25)" />
      <circle cx="52" cy="12" r="1.25" fill="rgba(255,255,255,0.25)" />
      <circle cx="12" cy="52" r="1.25" fill="rgba(255,255,255,0.25)" />
      <circle cx="52" cy="52" r="1.25" fill="rgba(255,255,255,0.25)" />

      {/* Left Vertical Slate Strata Pillar */}
      <rect x="16" y="16" width="6.5" height="32" rx="3" fill="url(#ns-logo-grad-primary)" />

      {/* Right Vertical Slate Strata Pillar */}
      <rect x="41.5" y="16" width="6.5" height="32" rx="3" fill="url(#ns-logo-grad-primary)" />

      {/* Diagonal Bridge Beam ('N' Geometry) */}
      <path
        d="M19 18.5 L45 42.5 C46.2 43.6 46.5 45.2 45 46.5 C43.8 47.5 42.2 47 41 45.8 L16.5 22.8 C15.5 21.8 15.6 20.2 16.8 19.2 C17.5 18.6 18.3 18.2 19 18.5 Z"
        fill="url(#ns-logo-grad-diag)"
      />

      {/* Center Tactile Slate Platelet */}
      <rect x="25.5" y="29.5" width="13" height="5" rx="2.5" fill="#FAFAFA" opacity="0.95" />

      {/* Nova Star Spark Telemetry Node */}
      <path
        d="M47 10 L48.2 13 L51.2 14.2 L48.2 15.4 L47 18.4 L45.8 15.4 L42.8 14.2 L45.8 13 Z"
        fill="url(#ns-logo-grad-accent)"
      />
      <circle cx="47" cy="14.2" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}
