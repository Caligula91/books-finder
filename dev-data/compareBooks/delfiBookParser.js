/* eslint-disable no-plusplus */
const axios = require('axios');
const HTMLParser = require('node-html-parser');
const slugify = require('slugify');

const kandze = `https://www.delfi.rs/knjige/165775_kandze_knjiga_delfi_knjizare.html`;

const parseBook = (html) => {
  let publisher;
  let povez = 'mek';
  let pages;
  try {
    const dom = HTMLParser.parse(html);
    publisher = slugify(
      dom.querySelectorAll('.author')[1].querySelector('a').innerText,
      { lower: true }
    );
    const domIndex = dom
      .querySelector('.tab-pane.podaci')
      .querySelector('.col-left')
      .querySelectorAll('p');
    let povezIndex = -1;
    let pagesIndex = -1;
    domIndex.forEach((el, index) => {
      if (el.innerText.trim().toLowerCase().startsWith('povez'))
        povezIndex = index;
      if (el.innerText.trim().toLowerCase().startsWith('broj strana'))
        pagesIndex = index;
    });
    const domDetails = dom
      .querySelector('.tab-pane.podaci')
      .querySelector('.col-right')
      .querySelectorAll('p');
    if (povezIndex !== -1) {
      povez = slugify(domDetails[povezIndex].innerText, { lower: true });
      povez = povez.startsWith('bros') ? 'mek' : povez;
    }
    if (pagesIndex !== -1)
      pages = parseInt(domDetails[pagesIndex].innerText, 10);
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
