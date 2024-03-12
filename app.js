//require modules
const express = require('express')
const morgan = require('morgan')
const methodOverride=require('method-override');
const MongoStore = require('connect-mongo');
const flash= require('connect-flash');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const tradeRoute = require('./routes/tradeRoute');
const mainRoute = require('./routes/mainRoute.js');
const userRoute = require('./routes/userRoute.js');


//configure app
let port = 3000;
let host = 'localhost';
app.set('view engine','ejs');


//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


mongoose.connect('mongodb://127.0.0.1:27017/items',{useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>{
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message)); 

app.use(
    session({
        secret: "jgnkfgbghjkdgdfvnlkv",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://127.0.0.1:27017/items'}),
        cookie: {maxAge: 60*60*1000}
        })
);

app.use(flash());


app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.successMessages=req.flash('success');
    res.locals.errorMessages=req.flash('error');
    next();
});

app.use('/trades',tradeRoute);
app.use('/users', userRoute);
app.use('/',mainRoute);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

});

app.use((err, req, res, next) => {
    let path = 'index.css';
    if(!err.status)
    {
        err.status = 500;
        //err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error.ejs',{error : err, cssfile: path})
});