const express = require('express');
const controller = require('../controller/userController');
const {isGuest,isLoggedIn} = require('../middlewares/auth');

const router = express.Router();

router.get('/new',isGuest, controller.new);

router.post('/new',isGuest ,controller.create);

router.get('/login',isGuest ,controller.getUserLogin);

router.post('/login',isGuest , controller.login);

router.get('/profile',isLoggedIn, controller.profile);

router.get('/logout',isLoggedIn, controller.logout);

router.post('/:id/watch',isLoggedIn,controller.addtowatchlist);

router.post('/:id/unwatch',isLoggedIn,controller.removefromwatchlist);

module.exports = router;