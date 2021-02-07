const HTMLParser = require('node-html-parser');
const titleFormater = require('./titleFormater');
const { vulkanFormatPrices } = require('./priceFormater');

// UNFINISHED DUE TO VULKAN NOT WORKING
exports.parseBooks = (html) => {
  const books = [];
  try {
    const dom = HTMLParser.parse(html);
    const productItems = dom.querySelectorAll('.item-data');
    productItems.forEach((item) => {
      const imgWrapper = item.querySelector('.img-wrapper');
      let img = imgWrapper.querySelector('img').getAttribute('src');
      img = `https://www.knjizare-vulkan.rs`.concat(img);
      const url = imgWrapper.querySelector('a').getAttribute('href');
      const textWrapper = item.querySelector('.text-wrapper');
      const rawTitle = textWrapper
        .querySelector('.title a')
        .getAttribute('title');
      const { title, ilustrated, extended, part, slug } = titleFormater(
        rawTitle
      );
      // some books doesnt have authors
      const domAuthor = textWrapper.querySelector('.atributs-wrapper a');
      const author = domAuthor ? domAuthor.getAttribute('title') : undefined;
      const currentPrice = textWrapper
        .querySelector('.prices-wrapper')
        .querySelector('.current-price');
      const prevPrice = textWrapper
        .querySelector('.prices-wrapper')
        .querySelector('.prev-price');
      const { price, onlinePrice } = vulkanFormatPrices(
        currentPrice,
        prevPrice
      );
      books.push({
        title,
        author,
        slug,
        ilustrated,
        extended,
        part,
        source: {
          name: 'vulkan',
          logo: '/img/logo/vulkan.png',
          price,
          onlinePrice,
          url,
          img,
          title,
          author,
        },
      });
    });
  } catch (error) {
    console.log('VULKAN_PARSER', error);
    return [];
  }
  return books;
};

exports.getNumPages = (html) => {
  try {
    const dom = HTMLParser.parse(html);
    const pages = dom.querySelector('.pagination').querySelectorAll('.number');
    if (pages.length === 0) return 1;
    const numPages = pages[pages.length - 1]
      .querySelector('a')
      .innerText.trim();
    return parseInt(numPages, 10);
  } catch (error) {
    console.log('VULKAN_PAGE_PARSER', error);
    return 1;
  }
};
