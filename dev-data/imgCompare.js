/* eslint-disable */
const { PNG } = require('pngjs');
const sharp = require('sharp');
const axios = require('axios');
const imageSimilarity = require('../utils/imageSimilarity');
const pixelmatch = require('pixelmatch');

const img1Url = `https://www.delfi.rs/_img/artikli/2017/12/hari_poter_i_zatvorenik_iz_askabana_ilustrovano_vv.jpg`;
const img2Url = `https://evrobook.rs/fajlovi/product/heri-poter-i-zatvorenik-iz-askabana-ilustrovani-download-4-_5a5c86e291965.jpg`;
const HPrelik1 = `https://www.delfi.rs/_img/artikli/2019/02/hari_poter_i_relikvije_smrti_vv.jpg`;
const HPrelik2 = `https://www.knjizare-vulkan.rs/files/thumbs/files/images/slike_proizvoda/thumbs_600/124651_600_600px.jpg`;
const viz1 = `https://www.delfi.rs/_img/artikli/2019/10/sumrak_vizantije_vreme_jovana_viii_paleologa_1392-1448_vv.jpg`;
const viz2 = `https://www.delfi.rs/_img/artikli/2019/03/sumrak_vizantije_vv.jpg`;
const viz3 = `https://www.knjizare-vulkan.rs/files/thumbs/files/images/slike_proizvoda/thumbs_600/246527_600_600px.jpg`;
const lord1 = `https://www.korisnaknjiga.com/photo/books0134/p133732b0.jpg`;
const lord2 = `https://www.delfi.rs/_img/artikli/2019/12/gospodar_prstenova_-_povratak_kralja_tvrd_povez_v.jpg`;
const krv1 = `https://www.delfi.rs/_img/artikli/2019/02/hari_poter_i_polukrvni_princ_vv.jpg`;
const krv2 = `https://evrobook.rs/fajlovi/product/hari-poter-i-polukrvni-princ-polukrvni-princ_59c8b9fe5617c.jpg`;
const gospIII = `https://www.knjizare-vulkan.rs/files/thumbs/files/images/slike_proizvoda/thumbs_600/338127_600_600px.jpg`;
const gospI = `https://www.delfi.rs/_img/artikli/2019/12/gospodar_prstenova_-_druzina_prstena_mek_povez_vv.jpg`;
const gospII = `https://www.delfi.rs/_img/artikli/2019/12/gospodar_prstenova_-_dve_kule_mek_povez_vv.jpg`;
const dvorana1 = `https://www.delfi.rs/_img/artikli/2017/09/hari_poter_i_dvorana_tajni_-_ilustrovano_vv.jpg`;
const dvorana2 = `https://evrobook.rs/fajlovi/product/hari-poter-i-dvorana-tajni-ilustrovano-hari-poter-02-dvorana-tajni-ilustrovan_5a5c8a9002efa.jpg`;
const pehar1 = `https://www.delfi.rs/_img/artikli/2019/02/hari_poter_i_vatreni_pehar_vv.jpg`;
const pehar2 = `https://evrobook.rs/fajlovi/product/hari-poter-i-vatreni-pehar-hari-poter-i-vatreni-pehar_59c8b92fbde26.jpg`;

const collision1 = `https://www.korisnaknjiga.com/photo/books0015/p014761c0.jpg`;
const collision2 = `https://www.korisnaknjiga.com/photo/books0012/p011912b0.jpg`;

const test1 = `https://www.delfi.rs/_img/artikli/2019/12/gospodar_prstenova_-_druzina_prstena_tvrd_povez_vv.jpg`;
const test2 = `https://www.knjizare-vulkan.rs/files/thumbs/files/images/slike_proizvoda/thumbs_600/338126_600_600px.jpg`;

const x = `https://www.knjizare-vulkan.rs/files/thumbs/files/images/slike_proizvoda/thumbs_350/298192_350_350px.jpg`;
const y = `https://www.delfi.rs/_img/artikli/2016/09/knjiga-hari-poter-i-ukleto-dete-dzoan-rouling-3.jpg`;


const getBuffer = async (url) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  const buffer = Buffer.from(response.data, 'binary');
  return await sharp(buffer)
    .trim()
    .resize(200, 286, {
      fit: 'fill',
    })
    .toFormat('png')
    .toBuffer();
};

//0.99
(async () => {
  const imgBuffer1 = await getBuffer(x);
  const imgBuffer2 = await getBuffer(y);
  const img1 = PNG.sync.read(imgBuffer1);
  const img2 = PNG.sync.read(imgBuffer2);
  const similar = await imageSimilarity(imgBuffer1, imgBuffer2);
  const miss = pixelmatch(img1.data, img2.data, null, 200, 286, {
    threshold: 0.1,
  });
  const k = (1 - miss / 100000) / 4;
  console.log(miss, similar, similar + k > 0.5);
})();
