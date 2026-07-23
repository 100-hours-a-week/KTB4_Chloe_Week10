const BASE_URL = import.meta.env.VITE_API_URL;

function getImageUrl(type, filename) {
  if (!filename) return null;
  return `${BASE_URL}/images/${type}/${filename}`;
}

export function getProfileImageUrl(filename) {
  return getImageUrl('profile', filename);
}

export function getPostImageUrl(filename) {
  return getImageUrl('post', filename);
}
