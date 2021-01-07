const axios = require('axios');
const HTMLParser = require('node-html-parser');
const slugify = require('slugify');

const hari = `https://evrobook.rs/product--hari-poter-i-red-feniksa`;

const parseBook = (html) => {
  let povez = 'mek';
  let pages;
  try {
    const dom = HTMLParser.parse(html);
    const domDetails = dom.querySelector('ul.product-bullets');
    const rawPovez = domDetails
      ? domDetails.querySelectorAll('li')[2].innerText.trim().toLowerCase()
      : undefined;
    povez = rawPovez ? slugify(rawPovez.slice(7), { lower: true }) : povez;
    const rawPages = domDetails
      ? domDetails.querySelectorAll('li')[0].innerText.trim()
      : undefined;
    pages = rawPages ? parseInt(rawPages.slice(13), 10) : 0;
    return {
      publisher: 'evro-book',
      povez: povez === 'bros' ? 'mek' : povez,
      pages,
    };
  } catch (error) {
    return {
      publisher: 'evro-book',
      povez: povez === 'bros' ? 'mek' : povez,
      pages,
    };
  }
};

(async () => {
  const result = await axios(hari);
  const { publisher, povez, pages } = parseBook(result.data);
  console.log(publisher, povez, pages);
})();
