// imageApi.js
const BASE_URL = "http://localhost:8080";

function getImageUrl(type, filename) {
  if (!filename) return null; 
  return `${BASE_URL}/images/${type}/${filename}`;
}

export function getProfileImageUrl(filename) {
  return getImageUrl("profile", filename);
}

export function getPostImageUrl(filename) {
  return getImageUrl("post", filename);
}