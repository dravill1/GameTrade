const model = require('../models/items'); 
const userModel = require('../models/users')
const mongoose = require('mongoose');

exports.displayGamesList = (req,res,next) =>{
    model.find()
    .then(games=>{
        let page="trades.css" ;
        res.render('trades.ejs', {items: games,cssfile:page})
    })
    .catch(err=>next(err));  
};


exports.showGameById = (req,res,next)=>{
    let id = req.params.id;
    let loggedinuser = req.session.user;
    let watchFlag = true;
    console.log(loggedinuser);
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid game id');
        err.status = 400;
        return next(err);
    }
    Promise.all([model.findById(id),userModel.findById(loggedinuser)])
    .then(output=>{
        const [item,users] = output;
        if(item) {
            let page="trade.css" ;
            if(users?.watchlist.includes(item._id))
                watchFlag = false;
            res.render('trade.ejs',{item: item, watchFlag:watchFlag, cssfile:page });
        } else {
            let err = new Error('Cannot find a game with id ' + id);
            err.status = 404;
            next(err);
        }
    })
   .catch(err=>next(err));
};

exports.createNewTrade = (req, res) =>{
    let page = "newTrade.css";
    res.render('newTrade.ejs',{cssfile:page});
};

exports.addNewItem = (req,res,next) => {
   req.body._id = new mongoose.Types.ObjectId();
   req.body.image = req.body.image;
    let game = new model(req.body);
    game.author = req.session.user;
    game.save()
    .then(game=>res.redirect('/trades/list'))
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status=400;
        }
        next(err);
    })
};

exports.editForm = (req,res,next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid game id');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
    .then(game=>{
        if(game){
            let page="newTrade.css" ;
            res.render('updateTrade.ejs', {items: game, cssfile: page});
        }
    else{
        let err = new Error('The server cannot locate '+req.url);
        err.status = 404;
        next(err);
    }
    });  
};

exports.updateGameDetails = (req,res,next) =>{
    let game = req.body;
    let id = req.params.id;
    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        let err = new Error('Invalid game id');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndUpdate(id,game,{useFindAndModify:false,runValidators:true})
    .then(game=>{
        if(game){
            res.redirect('/trades/list');
        }
        else {
            let err = new Error('Cannot find a game with id ' + id);
                err.status = 404;
                next(err);
           }
    })
   .catch(err=>{
    if(err.name === 'ValidationError')
        err.status = 400;
        next(err)
   });
};


exports.listToTrade = (req,res,next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        req.flash('error','Invalid game id');
        res.redirect('back');
    }
    let sid = req.session.user;
    Promise.all([model.find({author:sid}),model.findById(id)])
    .then(output=>{
        const [availableItems,itemfortrade] = output;
        const items = [];
        availableItems.forEach(item=>{
            if(item.status=='Available' && !itemfortrade.receivedTradeItems.includes(item._id)){items.push(item);}
        });
        res.render('listTrades.ejs', {cssfile:"index.css",items:items,item_id:id})
    })
    .catch(err=>next(err));
};

exports.generateTrade = (req,res,next)=>{
    Promise.all([
      model.findByIdAndUpdate(req.body.itemToTrade, {"$push":{"requestedTradeItems":req.params.id}},{useFindAndModify: false}),
      model.findByIdAndUpdate(req.params.id, {"$push":{"receivedTradeItems":req.body.itemToTrade}},{useFindAndModify: false}),
      model.findByIdAndUpdate(req.params.id,{"$set":{"status":"Offer pending"}},{useFindAndModify: false}),
      model.findByIdAndUpdate(req.body.itemToTrade,{"$set":{"status":"Offer pending"}},{useFindAndModify: false}),
    ])
    .then(results=>{req.flash('success','Request has been sent succesfully');
        res.redirect('/users/profile')})
    .catch(err=>next(err));
  };


exports.decideTrade = (req,res,next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        req.flash('error','Invalid game id');
        res.redirect('back');
    }
    model.findById(id)
    .then(item=>{
        const reqPromiseList = [];
        if(item.requestedTradeItems.length>0)
        {
            item.requestedTradeItems.forEach(list=>{
                reqPromiseList.push(model.findById(list));
            });
        }
        const recPromiseList =[];
        if(item.receivedTradeItems.length>0)
        {
            item.receivedTradeItems.forEach(list=>{
                recPromiseList.push(model.findById(list));
            });
        }
        Promise.all(reqPromiseList)
        .then(y=>{
            Promise.all(recPromiseList)
            .then(x=>{
                res.render('decideTrades.ejs',{item:item,reqOffers:y,recOffers:x,cssfile:'index.css',});
            })
            .catch(err=>next(err));
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};

  


  exports.cancelOffer = (req,res,next)=>{
    Promise.all([
        model.findByIdAndUpdate(req.params.item1,{"$pull":{"requestedTradeItems":req.params.item2}},{useFindAndModify: false}),
        model.findByIdAndUpdate(req.params.item2,{"$pull":{"receivedTradeItems":req.params.item1}},{useFindAndModify: false}),
        model.findByIdAndUpdate(req.params.item1,{"$set":{"status":"Available"}},{useFindAndModify: false}),
      model.findByIdAndUpdate(req.params.item2,{"$set":{"status":"Available"}},{useFindAndModify: false}),
    ])
      .then(results=>{req.flash('success','offer is cancelled');
          res.redirect('/users/profile')})
      .catch(err=>next(err));
};

exports.acceptRequest = (req,res,next)=>{
    Promise.all([
        model.findByIdAndUpdate(req.params.item1,{"$set":{"status":"Traded"},"$pull":{"receivedTradeItems":req.params.id2}},{useFindAndModify: false}),
        model.findByIdAndUpdate(req.params.item2,{"$set":{"status":"Traded"},"$pull":{"requestedTradeItems":req.params.id1}},{useFindAndModify: false})
      ])
      .then(results=>{req.flash('success','Trade is accepted');
          res.redirect('/users/profile')})
      .catch(err=>next(err));
};

exports.rejectRequest = (req,res,next)=>{
    Promise.all([
        model.findByIdAndUpdate(req.params.item1,{"$pull":{"receivedTradeItems":req.params.id2}},{useFindAndModify: false}),
        model.findByIdAndUpdate(req.params.item2,{"$pull":{"requestedTradeItems":req.params.id1}},{useFindAndModify: false}),
        model.findByIdAndUpdate(req.params.item1,{"$set":{"status":"Available"}},{useFindAndModify: false}),
      model.findByIdAndUpdate(req.params.item2,{"$set":{"status":"Available"}},{useFindAndModify: false}),
    ])
      .then(results=>{req.flash('success','Trade is denied');
          res.redirect('/users/profile')})
      .catch(err=>next(err));
};


exports.deleteGameById = (req,res,next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        let err = new Error('Invalid game id');
        err.status = 400;
        return next(err);
    }
    Promise.all([model.findByIdAndDelete(id , {useFindAndModify: false}),model.find(),userModel.find()])
    .then(output=>{
        const [game,allgames,allusers] = output;
        const promises = [];
        allgames.forEach(i=>promises.push(model.findByIdAndUpdate(i,{"$pull":{"requestedTradeItems":id}},{useFindAndModify: false})))
        allusers.forEach(i=>promises.push(userModel.findByIdAndUpdate(i,{"$pull":{"watchlist":id}},{useFindAndModify: false})))
        Promise.all(promises)
        .then(results=>{
        if(game)
            res.redirect('/trades/list');
        else{
            let err = new Error('The server cannot locate '+req.url);
            err.status = 404;
            next(err);
        }}
)})
    .catch(err=>next(err));
};



