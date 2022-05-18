export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image;
    image.src = src;
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
  })
}

export async function loadJSON(src) {
  const data = await fetch(src);
  return data.json;
}

export default {
  loadImage,
  loadJSON
}