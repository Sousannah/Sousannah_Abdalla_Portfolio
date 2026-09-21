import { useEffect, useRef } from 'react';
import { createFluid } from '../lib/fluid.js';

const isDark = () => document.documentElement.classList.contains('dark');

/**
 * The dye is drawn at its own value, so it is self-limiting: a faint splat is a
 * faint tint whatever is behind it. The light theme needs no correction at all.
 * The dark one is pulled down a little because the page underneath is black, so
 * nothing dilutes the colour and the same dye reads brighter.
 */
const intensityFor = (dark) => (dark ? 0.55 : 1);

/**
 * The fluid backdrop for the landing.
 *
 * Purely decorative, so it opts itself out wherever it would be a nuisance:
 * reduced-motion, no WebGL2, a machine with few cores, or a hidden tab. The
 * canvas never takes pointer events — the simulation listens on the window, so
 * buttons and the ask bar stay fully clickable through it.
 */
export default function FluidCanvas({ className = '' }) {
  const canvasRef = useRef(null);
  const fluidRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A rough proxy for "this device will not enjoy a full-screen shader".
    const cores = navigator.hardwareConcurrency || 4;
    const narrow = window.innerWidth < 768;
    if (cores <= 2) return undefined;

    const fluid = createFluid(canvas, {
      // Phones get a smaller dye field; it is the fill rate that costs, and at
      // that size the difference is invisible.
      simResolution: narrow ? 96 : 128,
      dyeResolution: narrow ? 512 : 1024,
      pressureIterations: narrow ? 12 : 20,
      intensity: intensityFor(isDark()),
      // Everything else — curl, dissipation, pressure, splat size and colour
      // strength — comes from the defaults in fluid.js.
    });

    if (!fluid.supported) return undefined;

    fluidRef.current = fluid;

    if (reducedMotion) {
      // Draw the seeded state once and leave it there: still colour, no motion.
      fluid.renderOnce();
    } else {
      fluid.start();
    }

    // Follow the theme toggle without rebuilding the simulation.
    const themeObserver = new MutationObserver(() => {
      fluid.setIntensity(intensityFor(isDark()));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      themeObserver.disconnect();
      fluid.destroy();
      fluidRef.current = null;
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
