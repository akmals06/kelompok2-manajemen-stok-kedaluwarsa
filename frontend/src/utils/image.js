
export function getOptimizedImageUrl(url, { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;

  if (!url.includes('res.cloudinary.com')) return url;

  const parts = [`f_${format}`, `q_${quality}`];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);

  const transform = parts.join(',');

  // Insert transform parameters right after '/upload/' segment
  return url.replace('/upload/', `/upload/${transform}/`);
}

export function getThumbnailUrl(url) {
  return getOptimizedImageUrl(url, { width: 160, height: 120 });
}

export function getCardImageUrl(url) {
  return getOptimizedImageUrl(url, { width: 480, height: 320 });
}

