const axios = require('axios');
const HTMLParser = require('node-html-parser');
const slugify = require('slugify');

const hari = `https://www.korisnaknjiga.com/hari-poter-i-ukleto-dete-naslov-79649`;

const parseBook = (html) => {
  let publisher;
  let povez = 'mek';
  let pages;
  try {
    const dom = HTMLParser.parse(html);
    const domData = dom
      .querySelector('.override-opis-knjige')
      .querySelectorAll('p');
    if (domData) {
      domData.forEach((el) => {
        if (el.getAttribute('title').toLowerCase() === 'brosiran') {
          povez = slugify(el.innerText, { lower: true });
          povez = povez.split('-')[1];
          povez = povez.startsWith('bros') ? 'mek' : povez;
        } else if (el.getAttribute('title').toLowerCase() === 'izdavac') {
          publisher = slugify(el.querySelector('a').innerText, {
            lower: true,
          });
        } else if (el.getAttribute('title').toLowerCase() === 'br.strana') {
          pages = parseInt(el.innerText.slice(11), 10);
        }
      });
    }
    return {
      publisher,
      povez,
      pages,
    };
  } catch (error) {
    // LOG SOMEWHERE URL AND VARIABLES
    return {
      publisher,
      povez,
      pages,
    };
  }
};

(async () => {
  const result = await axios(hari);
  const { publisher, povez, pages } = parseBook(result.data);
  console.log(publisher, povez, pages);
})();
