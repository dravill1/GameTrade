const Story = require('../models/items');

exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    }else {
         req.flash('error', 'You are logged in already');
         return res.redirect('/users/profile');
     }
};

exports.isLoggedIn = (req, res, next) =>{
    if(req.session.user){
        return next();
    }else {
         req.flash('error', 'You need to log in first');
         return res.redirect('/users/login');
     }
};

exports.isAuthor = (req, res, next) =>{
    let id = req.params.id;
    Story.findById(id)
    .then(story=>{
        if(story) {
            if(story.author == req.session.user) {
                return next();
            } else {
                req.flash('error','Unauthorized to access the resource');
                res.redirect('back');
            }
        } else {
            let err = new Error('Cannot find a connection with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};


