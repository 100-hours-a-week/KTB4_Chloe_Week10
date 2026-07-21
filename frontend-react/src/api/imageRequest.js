// frontend/API/imageRequest.js 그대로 포팅 (BASE_URL 하드코딩은 request.js와 동일한 정책)
const BASE_URL = 'http://localhost:8080';

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
