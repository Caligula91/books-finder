const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// (ONLY WORKS WHEN SAME SERVER FOR API AND SITE !!!)

// THROW ERRORS PROTECTED ROUTES
router.get(
  '/user',
  authController.protect,
  viewController.getSinceDate,
  viewController.getMe
);
router.get(
  '/user/update-name',
  authController.protect,
  viewController.updateName
);
router.get(
  '/user/update-password',
  authController.protect,
  viewController.updatePassword
);
router.get(
  '/user/wish-list',
  authController.protect,
  viewController.getWishList
);

router.get(
  '/user/admin/update-top-books',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.updateTopBooks
);

/**
 * DONT THROW ERRORS
 */
router.use(authController.isLoggedIn);

router.get('/about-api', viewController.aboutAPI);
router.get('/about-project', viewController.aboutProject);

router.get('/pretraga', viewController.getSearchBooks);
router.get('/', viewController.getOverview);
router.get('/logout', viewController.logout);

/**
 * REDIRECT HOME IF NOT LOGGED IN
 */

router.get('/signup', viewController.redirectHome, viewController.signup);
router.get('/login', viewController.redirectHome, viewController.login);
router.get(
  '/login/forgot-password',
  viewController.redirectHome,
  viewController.forgotPassword
);
router.get(
  '/user/reset-password/:token',
  viewController.redirectHome,
  viewController.resetPassword
);

module.exports = router;
