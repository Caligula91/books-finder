const express = require('express');
const booksController = require('../controllers/booksController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(booksController.getAllBooks);
router.route('/top-books').get(booksController.getTopBooks);
router.route('/delfi').get(booksController.getDelfiBooks);
router.route('/vulkan').get(booksController.getVulkanBooks);
router.route('/korisna-knjiga').get(booksController.getKorisnaKnjigaBooks);
router.route('/evrobook').get(booksController.getEvrobooks);

router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router.patch('/update-top-books', booksController.updateTopBooksDB);

module.exports = router;
