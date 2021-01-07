const { createCanvas, loadImage } = require('canvas');

function filterImageData(data) {
  const res = new Array(8 * 8 * 8 * 8).fill(0);
  const device = (val) => {
    let mapVal = 0;
    if (val > 223) {
      // [224 ~ 255]
      mapVal = 7;
    } else if (val > 191) {
      // [192 ~ 223]
      mapVal = 6;
    } else if (val > 159) {
      // [160 ~ 191]
      mapVal = 5;
    } else if (val > 127) {
      // [128 ~ 159]
      mapVal = 4;
    } else if (val > 95) {
      // [96 ~ 127]
      mapVal = 3;
    } else if (val > 63) {
      // [64 ~ 95]
      mapVal = 2;
    } else if (val > 31) {
      // [32 ~ 63]
      mapVal = 1;
    } else {
      // [0 ~ 31]
      mapVal = 0;
    }
    return mapVal;
  };
  for (let index = 0; index < data.length; index += 4) {
    const key =
      device(data[index]) * 8 * 8 * 8 +
      device(data[index + 1]) * 8 * 8 +
      device(data[index + 2]) * 8 +
      device(data[index + 3]);

    res[key] += 1;
  }
  return res;
}
// 余玄相似度
function vectorCosine(p1, p2) {
  // eslint-disable-next-line eqeqeq
  if (p1.length != p2.length) return false;

  let fenzi = 0;
  let sqrt1 = 0;
  let sqrt2 = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < p1.length; i++) {
    fenzi += p1[i] * p2[i];
    sqrt1 += p1[i] * p1[i];
    // eslint-disable-next-line no-restricted-properties
    sqrt2 += Math.pow(p2[i], 2);
  }

  const res = fenzi / (Math.sqrt(sqrt1) * Math.sqrt(sqrt2));
  return res;
}

module.exports = function (image1, image2) {
  if (!(image1 instanceof Buffer && image2 instanceof Buffer))
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('Parameters should be instance of Buffer');
  return Promise.all(
    [image1, image2].map((img) => {
      return loadImage(img).then((image) => {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        return filterImageData(imageData.data);
      });
    })
  ).then((res) => {
    return vectorCosine(res[0], res[1]);
  });
};
