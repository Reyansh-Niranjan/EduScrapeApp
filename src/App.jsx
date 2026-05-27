import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [statusText, setStatusText] = useState('Calculating...');
  const canvasRef = useRef(null);

  // May 27, 2026 00:00:00
  const startDate = new Date(2026, 4, 27, 0, 0, 0).getTime();
  // June 18, 2026 23:59:59
  const endDate = new Date(2026, 5, 18, 23, 59, 59).getTime();
  const totalDuration = endDate - startDate;

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      let currentNow = now;

      if (currentNow < startDate) currentNow = startDate;
      if (currentNow > endDate) currentNow = endDate;

      const timeRemaining = endDate - currentNow;
      const timeElapsed = currentNow - startDate;

      let pct = (timeElapsed / totalDuration) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      setProgress(pct);

      const d = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const h = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });

      if (now >= endDate) {
        setStatusText('REWORK COMPLETED');
      } else if (now <= startDate) {
        setStatusText('Rework begins soon');
      } else {
        setStatusText('REWORK ACTIVE');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);
    return () => clearInterval(interval);
  }, []);

  // Canvas Starfield Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let stars = [];
    const numStars = 100;

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.2,
          alpha: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.04 + 0.01,
          glow: Math.random() > 0.85
        });
      }
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        if (star.glow) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#c099ff';
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        }

        ctx.fill();
        ctx.restore();

        star.y += star.speed;
        star.x += star.speed * 0.4;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        if (star.x > canvas.width) {
          star.x = 0;
          star.y = Math.random() * canvas.height;
        }
      });
      animationId = requestAnimationFrame(drawStars);
    };

    window.addEventListener('resize', initCanvas);
    initCanvas();
    drawStars();

    return () => {
      window.removeEventListener('resize', initCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="ambient-glow"></div>
      <div className="ambient-glow-2"></div>
      <canvas ref={canvasRef} className="starfield"></canvas>

      <nav className="navbar">
        <div className="nav-brand">GEMINI</div>
        <div className="nav-links">
          <a href="#manifesto">MANIFESTO</a>
          <a href="#core">CORE</a>
          <a href="#network">NETWORK</a>
        </div>
        <button className="nav-btn">RESERVE ACCESS</button>
      </nav>

      <main className="main-content">
        <div className="glass-card">
          <h1 className="title">REWORK!</h1>
          
          <p className="subtitle">
            EduScrapeApp is undergoing a complete architectural transformation. 
            We are rebuilding from the ground up to deliver a faster, smarter, 
            and incredibly premium experience.
          </p>

          <div className="gemini-container">
            <div className="gemini-glow-bg"></div>
            <svg className="gemini-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#91B4FF" />
                  <stop offset="30%" stop-color="#C099FF" />
                  <stop offset="70%" stop-color="#FF9EAA" />
                  <stop offset="100%" stop-color="#FFD180" />
                </linearGradient>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="18" fill="url(#gemini-grad)" opacity="0.3" filter="url(#glow)" />
              <path d="M50 10C50 32.1 32.1 50 10 50C32.1 50 50 67.9 50 90C50 67.9 67.9 50 90 50C67.9 50 50 32.1 50 10Z" fill="url(#gemini-grad)" filter="url(#glow)" />
              <path d="M75 16C75 22.1 70.1 27 64 27C70.1 27 75 31.9 75 38C75 31.9 79.9 27 86 27C79.9 27 75 22.1 75 16Z" fill="#FFD180" filter="url(#glow)" opacity="0.9" />
            </svg>
          </div>

          <div className="progress-section">
            <div className="dates-container">
              <span className="date-badge">27 / 05 / 2026</span>
              <span className="date-badge">18 / 06 / 2026</span>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="stats-container">
              <div className="percentage">{progress.toFixed(6)}%</div>
              <div className="countdown">
                <span className="countdown-num">
                  {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span> remaining
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-copyright">
          © 2026 GEMINI SYSTEMS. PROTOCOL_v0.1
        </div>
        <div className="footer-links">
          <a href="#comms">ENCRYPTED_COMMS</a>
          <a href="#docs">NEURAL_DOCS</a>
          <a href="#status">SYSTEM_STATUS</a>
        </div>
      </footer>
    </div>
  );
}
