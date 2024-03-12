const express = require('express');
const controller = require('../controller/mainController');
const router = express.Router();


router.get('/',controller.homePage);

router.get('/contact', controller.contact);

router.get('/about', controller.about);

router.get('/*', controller.errorPage);

module.exports = router;