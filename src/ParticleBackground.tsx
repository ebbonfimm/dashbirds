import { useEffect, useRef } from 'react';

interface GridPoint {
  x: number;
  y: number;
  targetRadius: number;
  currentRadius: number;
  targetOpacity: number;
  currentOpacity: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: GridPoint[] = [];
    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 };

    // Configuration
    const SPACING = 35; // Distance between grid dots
    const BASE_RADIUS = 1.2; // Size of dots when idle
    const HOVER_RADIUS = 4; // Size of dots when hovered
    const BASE_OPACITY = 0.15; // Opacity when idle (subtle background presence)
    const HOVER_OPACITY = 0.9; // Opacity when hovered (bright yellow glow)
    const MOUSE_INFLUENCE_RADIUS = 180; // How far the light spreads from the mouse
    const EASING = 0.08; // Smoothness of the transition (lower = longer trailing light)

    // Colors
    // Idle color: Dark grey from brand (#101011)
    const IDLE_COLOR_RGB = { r: 16, g: 16, b: 17 };
    // Hover color: Yellow from brand (#F7DF01)
    const HOVER_COLOR_RGB = { r: 247, g: 223, b: 1 };

    const initGrid = () => {
      points = [];
      // Calculate rows and cols to cover the screen
      const cols = Math.floor(canvas.width / SPACING) + 1;
      const rows = Math.floor(canvas.height / SPACING) + 1;

      // Center the grid on screen
      const offsetX = (canvas.width - (cols - 1) * SPACING) / 2;
      const offsetY = (canvas.height - (rows - 1) * SPACING) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          points.push({
            x: offsetX + i * SPACING,
            y: offsetY + j * SPACING,
            targetRadius: BASE_RADIUS,
            currentRadius: BASE_RADIUS,
            targetOpacity: BASE_OPACITY,
            currentOpacity: BASE_OPACITY,
          });
        }
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Initialize
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      points.forEach((p) => {
        // Calculate distance to mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Determine target states based on distance
        if (distance < MOUSE_INFLUENCE_RADIUS) {
          const intensity = Math.pow(1 - (distance / MOUSE_INFLUENCE_RADIUS), 1.5); // easing curve for light falloff
          p.targetRadius = BASE_RADIUS + (HOVER_RADIUS - BASE_RADIUS) * intensity;
          p.targetOpacity = BASE_OPACITY + (HOVER_OPACITY - BASE_OPACITY) * intensity;
        } else {
          p.targetRadius = BASE_RADIUS;
          p.targetOpacity = BASE_OPACITY;
        }

        // Apply easing for smooth transitions (creates the trailing effect)
        p.currentRadius = lerp(p.currentRadius, p.targetRadius, EASING);
        p.currentOpacity = lerp(p.currentOpacity, p.targetOpacity, EASING);

        // Calculate blended color based on current opacity
        // Fades smoothly from subtle dark grey to bright yellow
        const intensityProgress = (p.currentOpacity - BASE_OPACITY) / (HOVER_OPACITY - BASE_OPACITY);
        const safeIntensity = Math.max(0, Math.min(1, isNaN(intensityProgress) ? 0 : intensityProgress));
        
        const r = Math.round(lerp(IDLE_COLOR_RGB.r, HOVER_COLOR_RGB.r, safeIntensity));
        const g = Math.round(lerp(IDLE_COLOR_RGB.g, HOVER_COLOR_RGB.g, safeIntensity));
        const b = Math.round(lerp(IDLE_COLOR_RGB.b, HOVER_COLOR_RGB.b, safeIntensity));

        // Draw the grid point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.currentOpacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, 
        pointerEvents: 'none', 
      }}
    />
  );
}
