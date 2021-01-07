const express = require('express');
const testController = require('../controllers/testController');

const router = express.Router();

router.route('/').get(testController.getTestData);

module.exports = router;
