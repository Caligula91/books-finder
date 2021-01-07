const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();
router.get('/', viewController.getOverview);
router.get('/pretraga', viewController.getSearchResults);

module.exports = router;
