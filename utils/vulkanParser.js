const HTMLParser = require('node-html-parser');
const titleFormater = require('./titleFormater');

const formatPrices = (currentPrice, prevPrice) => {
  // some books doesnt have price discount
  let price = (prevPrice || currentPrice).innerText.trim();
  price = price.replace(/(\D|',')/g, (char) => (char === ',' ? '.' : ''));
  price = parseFloat(price);
  let onlinePrice;
  if (prevPrice) {
    onlinePrice = currentPrice.innerText.trim();
    onlinePrice = onlinePrice.replace(/(\D|',')/g, (char) =>
      char === ',' ? '.' : ''
    );
    onlinePrice = parseFloat(onlinePrice);
  }
  return {
    price,
    onlinePrice,
  };
};

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
      const { price, onlinePrice } = formatPrices(currentPrice, prevPrice);
      books.push({
        title,
        author,
        slug,
        img,
        ilustrated,
        extended,
        part,
        source: {
          name: 'Vulkan',
          logo: '/img/logo/vulkan.png',
          price,
          onlinePrice,
          url,
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
