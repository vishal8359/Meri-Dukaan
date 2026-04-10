/**
 * Image Quality Analyzer
 *
 * Uses sharp to analyze image properties for quality assessment.
 * Checks: blur, brightness, contrast, resolution, file size.
 */
import sharp from "sharp";

/**
 * Analyze image quality metrics.
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} Quality assessment result
 */
export async function analyzeImageQuality(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  const stats = await sharp(imagePath).stats();

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const fileSize = metadata.size || 0;

  // Resolution check (minimum 300x300 for document processing)
  const resolutionOk = width >= 300 && height >= 300;
  const resolutionScore = Math.min(
    100,
    Math.round(((width * height) / (640 * 480)) * 100)
  );

  // Brightness analysis (from channel stats)
  const channels = stats.channels || [];
  const avgBrightness =
    channels.reduce((sum, ch) => sum + (ch.mean || 0), 0) / (channels.length || 1);

  // Too dark < 40, too bright > 220, ideal 80-180
  const brightnessOk = avgBrightness >= 40 && avgBrightness <= 220;
  const brightnessScore =
    avgBrightness < 40
      ? Math.round((avgBrightness / 40) * 60)
      : avgBrightness > 220
        ? Math.round(((255 - avgBrightness) / 35) * 60)
        : 100;

  // Contrast analysis (standard deviation of pixel values)
  const avgStdDev =
    channels.reduce((sum, ch) => sum + (ch.stdev || 0), 0) /
    (channels.length || 1);

  // Low contrast < 20, good > 40
  const contrastOk = avgStdDev >= 20;
  const contrastScore = Math.min(100, Math.round((avgStdDev / 50) * 100));

  // Sharpness estimation via entropy
  const entropy = stats.entropy || 0;
  // Images with entropy < 5 tend to be blurry/uniform
  const sharpnessOk = entropy >= 5;
  const sharpnessScore = Math.min(100, Math.round((entropy / 7.5) * 100));

  // File size check (too small = low quality, too large = uncompressed)
  const fileSizeOk = fileSize >= 20_000 && fileSize <= 10_000_000;

  // Overall clarity score (weighted)
  const clarityScore = Math.round(
    resolutionScore * 0.2 +
    brightnessScore * 0.25 +
    contrastScore * 0.25 +
    sharpnessScore * 0.3
  );

  return {
    width,
    height,
    fileSize,
    format: metadata.format,
    scores: {
      resolution: Math.min(resolutionScore, 100),
      brightness: Math.min(brightnessScore, 100),
      contrast: Math.min(contrastScore, 100),
      sharpness: Math.min(sharpnessScore, 100),
      overall: Math.min(clarityScore, 100),
    },
    checks: {
      resolutionOk,
      brightnessOk,
      contrastOk,
      sharpnessOk,
      fileSizeOk,
    },
    issues: [
      ...(resolutionOk ? [] : ["Image resolution too low (min 300x300)"]),
      ...(brightnessOk ? [] : [avgBrightness < 40 ? "Image too dark" : "Image too bright"]),
      ...(contrastOk ? [] : ["Low contrast — image appears washed out"]),
      ...(sharpnessOk ? [] : ["Image appears blurry or unclear"]),
      ...(fileSizeOk ? [] : [fileSize < 20_000 ? "File too small (low quality)" : "File too large"]),
    ],
  };
}
