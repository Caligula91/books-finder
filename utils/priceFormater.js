exports.delfiFormatPrices = (el, discount) => {
  const arr = el.innerText.split('din');
  let price;
  let onlinePrice;
  if (arr.length > 2) {
    price = arr[2].trim().replace('.', '').replace(',', '.');
    if (discount) {
      discount = parseFloat(discount.replace(/%/, ''));
      onlinePrice = price - (price * discount) / 100;
      // NEW SEGMENT IN FORMAT PRICE
    } else {
      onlinePrice = arr[0].trim().replace('.', '').replace(',', '.');
    }
  } else {
    price = arr[0].trim().replace('.', '').replace(',', '.');
  }
  return {
    price: parseFloat(price),
    onlinePrice: parseFloat(onlinePrice),
  };
};
exports.vulkanFormatPrices = (currentPrice, prevPrice) => {
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
exports.evrobookFormatPrices = (price) => {
  price = price.split(' ')[0];
  price = price.replace('.', '').replace(',', '.');
  price = parseFloat(price);
  return price;
};
exports.korisnaKnjigaFormatPrices = (el) => {
  const arr = el.split(' ');
  arr[0] = arr[0].replace('.', '').replace(',', '.');
  const price = parseFloat(arr[0]);
  return price;
};
