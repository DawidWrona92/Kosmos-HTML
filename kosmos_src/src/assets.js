/* ---------- obrazy i globusy ---------- */

const ASSET_DATA = /*ASSET_DATA*/{};
const images = {};

Object.keys(ASSET_DATA).forEach(key => {
 const image = new Image();
 image.src = ASSET_DATA[key];
 images[key] = image;
});

function imageOf(key) {
 const image = images[key];
 return image && image.complete && image.naturalWidth ? image : null;
}

const textureCache = {};

function textureOf(key) {
 if (textureCache[key]) return textureCache[key];
 const image = imageOf(key);
 if (!image) return null;
 const holder = document.createElement('canvas');
 holder.width = image.naturalWidth;
 holder.height = image.naturalHeight;
 const holderCtx = holder.getContext('2d', {willReadFrequently: true});
 holderCtx.drawImage(image, 0, 0);
 const pixels = holderCtx.getImageData(0, 0, holder.width, holder.height);
 textureCache[key] = {width: holder.width, height: holder.height, data: new Uint32Array(pixels.data.buffer)};
 return textureCache[key];
}

const globeCache = {};

/* globus: kula obracana z mapy powierzchni (odwzorowanie równoodległościowe) */
function globeOf(key, size, tiltAngle, variant = '') {
 /* klucz uwzględnia nachylenie i wariant, żeby globus zadania nie nadpisywał globusa ze sceny */
 const cacheKey = `${key}:${size}:${tiltAngle === undefined ? 'd' : tiltAngle}:${variant}`;
 if (globeCache[cacheKey]) return globeCache[cacheKey];
 const texture = textureOf(key);
 if (!texture) return null;
 const output = document.createElement('canvas');
 output.width = size;
 output.height = size;
 const outputCtx = output.getContext('2d');
 const imageData = outputCtx.createImageData(size, size);
 const pixels = new Uint32Array(imageData.data.buffer);
 const count = size * size;
 const baseU = new Float32Array(count);
 const rowV = new Int32Array(count);
 const inside = new Uint8Array(count);
 const half = size / 2;
 const tilt = tiltAngle === undefined ? .2 : tiltAngle;
 const sinTilt = Math.sin(tilt);
 const cosTilt = Math.cos(tilt);
 for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
   const nx = (x + .5 - half) / half;
   const ny = (y + .5 - half) / half;
   const distance = nx * nx + ny * ny;
   if (distance > 1) continue;
   const nz = Math.sqrt(1 - distance);
   const flatY = -ny * cosTilt + nz * sinTilt;
   const flatZ = ny * sinTilt + nz * cosTilt;
   const longitude = Math.atan2(nx, flatZ);
   const latitude = Math.asin(clamp(flatY, -1, 1));
   const index = y * size + x;
   inside[index] = 1;
   baseU[index] = (longitude / TAU + .5) * texture.width;
   rowV[index] = clamp(Math.floor((.5 - latitude / Math.PI) * texture.height), 0, texture.height - 1) * texture.width;
  }
 }
 const globe = {
  canvas: output, size,
  render(rotation) {
   const shift = rotation / TAU * texture.width;
   const width = texture.width;
   const data = texture.data;
   for (let index = 0; index < count; index++) {
    if (!inside[index]) continue;
    let u = Math.floor(baseU[index] + shift) % width;
    if (u < 0) u += width;
    pixels[index] = data[rowV[index] + u];
   }
   outputCtx.putImageData(imageData, 0, 0);
  }
 };
 globe.render(0);
 globeCache[cacheKey] = globe;
 return globe;
}
