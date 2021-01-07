const axios = require('axios');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = (req, res, next) => {
  res.status(200).render('overview', {
    title: 'Search Books',
  });
};

exports.getSearchResults = catchAsync(async (req, res, next) => {
  const { search, page, limit } = req.query;
  const select = req.query.select || 'delfi+vulkan+evrobook+korisna_knjiga';
  const url = encodeURI(
    `${req.protocol}://${req.get(
      'host'
    )}/api/v1/books/?search=${search}&page=${page}&limit=${limit}&select=${select}`
  );
  const result = await axios({
    method: 'GET',
    url,
    headers: { 'Content-type': 'application/json' },
  });
  if (result.data.status === 'success') {
    const { books } = result.data.data;
    const { nextPage, previousPage } = result.data;
    const currentPage = result.data.page;
    res.status(200).render('searchResults', {
      title: 'Search Results',
      books,
      search,
      pageInfo: {
        currentPage,
        nextPage: nextPage
          ? `${req.protocol}://${req.get(
              'host'
            )}/pretraga?search=${search}&page=${
              currentPage + 1
            }&limit=${limit}&select=${select}`
          : false,
        previousPage: previousPage
          ? `${req.protocol}://${req.get(
              'host'
            )}/pretraga?search=${search}&page=${
              currentPage - 1
            }&limit=${limit}&select=${select}`
          : false,
      },
    });
  } else {
    res.status(200).render('error');
  }
});
