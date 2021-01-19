const express = require('express');
const booksController = require('../controllers/booksController');

const router = express.Router();

router.route('/').get(booksController.getAllBooks);
router.route('/top-books').get(booksController.getTopBooks);
router.route('/delfi').get(booksController.getDelfiBooks);
router.route('/vulkan').get(booksController.getVulkanBooks);
router.route('/korisna-knjiga').get(booksController.getKorisnaKnjigaBooks);
router.route('/evrobook').get(booksController.getEvrobooks);

module.exports = router;
