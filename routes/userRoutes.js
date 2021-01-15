const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.post('/password-forgot', authController.forgotPassword);
router.patch('/password-reset/:token', authController.resetPassword);

/**
 * PROTECTED ROUTES
 */
router.use(authController.protect);
router.get('/logout', authController.logOut);
router.get('/me', userController.getMe);
router.patch('/password-update', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.post('/addWishBook', userController.addWishBook);

/**
 * PROTECTED ROUTES FOR ADMIN
 */
router.use(authController.restrictTo('admin'));

module.exports = router;
