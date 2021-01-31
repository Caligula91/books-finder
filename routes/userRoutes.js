const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.post('/password-forgot', authController.forgotPassword);
router.patch('/password-reset/:token', authController.resetPassword);
router.post('/contact/send-message', userController.sendContactMessage);

/**
 * PROTECTED ROUTES
 */
router.use(authController.protect);
router.get('/logout', authController.logOut);
// CHAIN!
router.get('/me', userController.getMe);
router.patch('/password-update', authController.updatePassword);
router.patch('/update-me', userController.updateMe);
router.post('/wishbook', userController.addWishBook);
router.delete('/wishbook', userController.removeWishBook);
router.delete('/clear-wishlist', userController.clearWishList);
router.delete('/delete-me', userController.deleteMe, authController.logOut);

/**
 * PROTECTED ROUTES FOR ADMIN
 */
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
