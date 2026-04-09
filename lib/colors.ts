import { getPalette } from 'colorthief';

/**
 * Extract a palette of dominant colors from an image URL.
 * Returns an array of hex color strings (5-8 colors).
 */
export async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    const palette = await getPalette(img, { colorCount: 8 });
    if (!palette) return [];

    return palette.map((color) => color.hex());
  } catch {
    return [];
  }
}
