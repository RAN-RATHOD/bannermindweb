// Poster configuration - normalized coordinates (0-1) for where the printed character stands on each poster
// anchorX: horizontal position (0 = left edge, 1 = right edge)
// anchorY: vertical position from bottom (0 = bottom edge, 1 = top edge)
// startOffsetX: how far outside the poster the live character starts (in pixels)

export const POSTER_CONFIG = {
  business: {
    anchorX: 0.85,  // 85% from left - bottom-right corner INSIDE poster
    anchorY: 0.08,  // 8% up from bottom - proper spacing, stays inside
  },
  birthday: {
    anchorX: 0.83,  // Bottom-right inside poster
    anchorY: 0.08,
  },
  diwali: {
    anchorX: 0.82,  // Bottom-right inside poster
    anchorY: 0.08,
  },
  newYear: {
    anchorX: 0.84,  // Bottom-right inside poster
    anchorY: 0.08,
  },
};

