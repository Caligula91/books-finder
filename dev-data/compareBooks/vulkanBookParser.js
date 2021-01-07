const axios = require('axios');
const HTMLParser = require('node-html-parser');
const slugify = require('slugify');

const kandze = `https://www.knjizare-vulkan.rs/domaci-roman/33285-kandze`;

const parseBook = (html) => {
  let publisher;
  let povez = 'mek';
  let pages;
  try {
    const dom = HTMLParser.parse(html);
    const domPublisher = dom
      .querySelector('.atributs-wrapper.chosen-atributes')
      .querySelector('.value a');
    publisher = slugify(domPublisher.innerText, { lower: true });

    const domDetails = dom.querySelector('#tab_product_specification');
    const domPovez = dom.querySelector('.attr-povez');
    if (domPovez) {
      povez = slugify(domPovez.querySelectorAll('td')[1].innerText, {
        lower: true,
      });
      povez = povez.startsWith('bros') ? 'mek' : povez;
    }
    const domPages = domDetails.querySelector('tbody').querySelectorAll('tr');
    // eslint-disable-next-line no-plusplus
    for (let i = domPages.length - 1; i >= 0; i--) {
      const temp = domPages[i].querySelectorAll('td');
      if (temp[0].innerText.trim().toLowerCase() === 'strana') {
        pages = parseInt(temp[1].innerText, 10);
        break;
      }
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
  const result = await axios(kandze);
  const { publisher, povez, pages } = parseBook(result.data);
  console.log(publisher, povez, pages);
})();
