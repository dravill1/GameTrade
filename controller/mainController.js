const model = require('../models/items.js');

exports.homePage = (req,res) =>{
    let page = 'index.css';
    res.render('index.ejs',{cssfile: page});
}

exports.contact = (req,res) =>{
    let page = 'shared.css';
    res.render('contact.ejs',{cssfile: page});
}

exports.about = (req,res) =>{
    let page = 'shared.css';
    res.render('about.ejs',{cssfile: page});
}

exports.errorPage = (req,res,next) =>{
    let error = new Error("The server cannot locate "+req.url);
    error.status=404;
    next(error);
}
