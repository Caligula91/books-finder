const axios = require('axios');

/**
 *'https://www.delfi.rs/knjige/88878_mali_princ_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/romani-i-price-za-decu-od-10-do-12-godina/46855-mali-princ-prosirena-stvarnost' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/romani-i-price-za-decu-od-10-do-12-godina/31680-mali-princ-lux' => Promise { <pending> },
  'https://www.delfi.rs/knjige/90249_mali_princ_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.delfi.rs/knjige/62600_mali_princ_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.delfi.rs/knjige/105386_ozaloscena_porodica_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/lektira-za-decu/35741-ozaloscena-porodica' => Promise { <pending> },
  'https://www.delfi.rs/knjige/37939_iluminati_666_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/esejistika-i-publicistika/43061-iluminati-666' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/esejistika-i-publicistika/41136-deca-novog-doba-iluminati-666-ii-deo' => Promise { <pending> },
  'https://www.delfi.rs/knjige/151510_da_li_znate_engleski?_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/engleski-jezik-prirucnici-i-kursevi/50367-da-li-znate-engleski' => Promise { <pending> },
  'https://www.delfi.rs/knjige/151511_kasijana_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/religija-i-teologija/50363-kasijana' => Promise { <pending> },
  'https://www.delfi.rs/knjige/151512_luca_mikrokozma_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/domaci-klasici/50366-luca-mikrokozma' => Promise { <pending> },
  'https://www.delfi.rs/knjige/116898_nikola_tesla_unutrasnji_svet_zdravlja_-_medicina_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/esejistika-i-publicistika/50512-nikola-tesla-unutrasnji-svet-zdravlja-medicina' => Promise { <pending> },
  'https://www.delfi.rs/knjige/116899_vladari_sveta_-_istorija_iluminata_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/ezoterija/42871-vladari-sveta-istorija-iluminata' => Promise { <pending> },
  'https://www.delfi.rs/knjige/84174_masonska_zagonetka_-_cuvari_tajne_knjiga_delfi_knjizare.html' => Promise { <pending> },
  'https://www.knjizare-vulkan.rs/ezoterija/30739-masonska-zagonetka-cuvari-tajne' => Promise { <pending> }
 */

(async () => {
  const url =
    'https://www.delfi.rs/pretraga?q=đubre&c=1&per_page=50&s=relevance&cena_od=0&cena_do=0&izdavaci=%5B%5D&customMobRadio2=on&stanje=1';
  console.log(url);
  // await axios({
  //   method: 'GET',
  //   url,
  // });
  await axios(url);

  console.log('success');
})();
