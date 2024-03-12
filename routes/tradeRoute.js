const express = require('express');
const controller = require('../controller/tradeController');
const {isLoggedIn,isAuthor} = require('../middlewares/auth');
const router = express.Router();

router.get('/list', controller.displayGamesList);

router.get('/new', isLoggedIn ,controller.createNewTrade);

router.post('/new',isLoggedIn, controller.addNewItem);

router.get('/:id/edit',isLoggedIn, isAuthor, controller.editForm);

router.get('/:id',controller.showGameById);

router.put('/:id', isLoggedIn, isAuthor, controller.updateGameDetails);

router.get('/:id/listtradeitems',isLoggedIn,controller.listToTrade);

router.post('/:id/generateTrade', isLoggedIn,controller.generateTrade);

router.post('/:item1/:item2/cancel', isLoggedIn,controller.cancelOffer);

router.post('/:item1/:item2/accept', isLoggedIn,controller.acceptRequest);

router.post('/:item1/:item2/reject', isLoggedIn,controller.rejectRequest);

router.get('/:id/decideTrade',isLoggedIn,controller.decideTrade)

router.delete('/:id/delete', isLoggedIn, isAuthor, controller.deleteGameById);


module.exports = router;
