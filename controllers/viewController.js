const axios = require('axios');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const response = await axios(
    `${req.protocol}://${req.get('host')}/api/v1/books/top-books`
  );
  const { topBooks } = response.data;
  res.status(200).render('overview', {
    title: 'Home',
    topBooks,
  });
});

exports.getSearchBooks = catchAsync(async (req, res, next) => {
  const { search, page, limit } = req.query;
  const select = req.query.select || 'delfi+vulkan+evrobook+korisnaknjiga';
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
  if (!result.data.status === 'success')
    return next(new AppError('Problem with getting search results', 404));
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
});

/**
 * REDIRECT HOME
 */
exports.redirectHome = (req, res, next) => {
  if (res.locals.user) res.redirect(`${req.protocol}://${req.get('host')}/`);
  else next();
};

exports.signup = (req, res, next) => {
  // 1. Check if already logged in, if it is then redirect to home page and send alert
  // 2. Redirect to signup page if not logged in
  res.status(200).render('signup', {
    title: 'SignUp',
  });
};

exports.login = (req, res, next) => {
  res.status(200).render('login', {
    title: 'LogIn',
  });
};

exports.logout = (req, res, next) => {
  if (res.locals.user) {
    res.cookie('jwt', 'blank', {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
    });
    res.locals.user = undefined;
  }
  res.redirect('/');
};

exports.getMe = (req, res, next) => {
  res.status(200).render('aboutMe', {
    title: 'My Account',
  });
};

exports.forgotPassword = (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Reset Password',
  });
};

/**
 * PROTECTED TO THROW ERROR
 */
exports.updateName = (req, res, next) => {
  res.status(200).render('updateName', {
    title: 'Change Name',
  });
};

exports.updatePassword = (req, res, next) => {
  res.status(200).render('updatePassword', {
    title: 'Change Password',
  });
};

exports.getWishList = (req, res, next) => {
  res.status(200).render('myWishList', {
    title: 'WishList',
  });
};

exports.updateTopBooks = catchAsync(async (req, res, next) => {
  const response = await axios(
    `${req.protocol}://${req.get('host')}/api/v1/books/top-books`
  );
  const { topBooks } = response.data;
  res.status(200).render('updateTopBooks', {
    title: 'Update Top Books',
    topBooks,
  });
});
