const model = require('../models/users');
const Story = require('../models/items');


exports.new = (req, res)=>{
    console.log("in signup");
    res.render('../views/user/new.ejs',{cssfile:"index.css"});
};

exports.create = (req, res, next)=>{   
    let user = new model(req.body);
    user.save()
    .then(user=> {
        req.flash('success','User Created Successfully');
        res.redirect('/users/login')})
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};


exports.getUserLogin = (req, res, next) => {
    console.log("in login");
    res.render('../views/user/login.ejs',{cssfile:"newTrade.css"});
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), Story.find({author:id}),Story.find({}) ])
    .then(output=>{
        const [user,myItems,items] = output;
        const list=[];
        const nameOfItem=[];
        items.forEach(i=>nameOfItem[i._id]=[i.itemName,i.status]);
        req.flash('success','Welcome to the profile');
        user.watchlist.forEach(a=>{
            list.push(Story.findById(a))
        });
        Promise.all(list)
        .then(output=>{
            res.render('user/profile.ejs', {cssfile:"index.css",user:user,items:myItems,nameOfItem:nameOfItem,watchlist:output})
        })
    })
    .catch(err=>next(err));
};


exports.addtowatchlist = (req,res,next) => {
    let id = req.params.id;
    let user = req.session.user;
    model.findByIdAndUpdate(user,{"$push":{"watchlist":id},useFindAndModify: false, runValidators:true })
    .then(results=>{req.flash('success','Item added to watchlist successfully');
        res.redirect('/users/profile')})
    .catch(err=>next(err));
};

exports.removefromwatchlist = (req,res,next) => {
    let id = req.params.id;
    let user = req.session.user;
    model.findByIdAndUpdate(user,{"$pull":{"watchlist":id},useFindAndModify: false, runValidators:true })
    .then(results=>{req.flash('success','Item removed from watchlist successfully');
        res.redirect('/users/profile')})
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };

