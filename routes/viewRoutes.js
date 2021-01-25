const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/pretraga', viewController.getSearchBooks);
router.get('/', viewController.getOverview);
router.get('/signup', viewController.signup);
router.get('/login', viewController.login);
router.get('/logout', viewController.logout);
router.get('/me', viewController.getMe);

module.exports = router;
