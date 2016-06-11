/**
 * Created by Александр on 03.04.2016.
 */
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
mongoose.connect("mongodb://localhost/test");
var db = mongoose.connection;
var Schema = mongoose.Schema;
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.use(bodyParser());

app.use(cookieParser());
var session = require('express-session');
app.use(session({
    secret: 'SECRET'
}));
var flash = require("connect-flash");
app.use(flash());

var server = app.listen("8888", "192.168.0.108", function(req, res) {
    console.log("Listening on 8888");
});
app.use(session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 60000
    }
}))
app.set("view engine", "jade");
db.once("open", function() {
    console.log("Connected sucsessfully");
});
app.use(express.static(path.join(__dirname, 'public')));
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
var commentSchema = new Schema({
    name: {
        type: String,
        default: "Anonimous",
    },
    time: {
        type: String,
        default: Math.floor(Date.now() / 1000)
    },
    body: String,
});
var Comment = mongoose.model("Comment", commentSchema);

app.get("/", function(req, res, next) {
    Comment.find(function(err, comments) {
        var com = comments.concat();
        res.render("main", {
            comment: com,
            userInfo: req.session.passport
        })
        next();
        req.session.cookie.maxAge = 30000000;
        //console.log(req.session.passport);

    });
});
app.get("/about", function(req, res, next) {
    res.render("about", {
        userInfo: req.session.passport
    });
});
app.get("/contacts", function(req, res, next) {
    res.render("contacts", {
        userInfo: req.session.passport
    });
    console.log(req.session.passport);
});

app.get("/login", function(req, res, next) {
    res.render("login");

});
app.get("/chat", function(req, res, next) {
    if (req.session.passport != undefined) {
    res.cookie('name', req.session.passport.user.username);
    }
    res.render("chat", {
        userInfo: req.session.passport
    });
});
app.get("/signup", function(req, res, next) {
    res.render("signup");

});
app.get("/logout", function(req, res, next) {
    req.session.destroy();
    res.clearCookie('name');
    res.redirect('/');
});

app.get("/:page?", function(req, res) {
    var page = req.params.page;
    if (page != undefined) res.redirect("/");

});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.post("/commentPost", function(req, res, next) {
    var data = req.body;
    console.log(data);
    var comment = new Comment(data);
    if (comment.name == '') comment.name = "Anonimous";
    if (req.session.passport != undefined) comment.name = req.session.passport.user.username;
    comment.time = Math.floor(Date.now() / 1000);
    comment.save(function(err, comment) {
        if (err) return console.error(err);

        console.log(comment._id + " saved!")
        res.redirect("/");
        next();
    })
});
app.post("/removeLast", function(req, res, next) {
    Comment.findOneAndRemove().sort({
        time: "-1"
    }).exec()
    res.redirect("/");
});




// AUTENTIFICATION
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
var contactSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
contactSchema.methods.validPassword = function(pwd) {
    return (this.password === pwd);
};
var Contact = mongoose.model("Contact", contactSchema);
// Passport:
app.use(passport.initialize());
app.use(passport.session());

app.post('/login',
    passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);


passport.use("login", new LocalStrategy(
    function(username, password, done) {
        Contact.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                console.log("1");
                return done(null, false);
            }
            if (!user.validPassword(password)) {
                console.log("2");
                return done(null, false);
            }
            return done(null, user);
            res.cookie('name', user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, {
        username: user.username.capitalizeFirstLetter(),
        _id: user._id
    });
    //console.log(user.username);
});

passport.deserializeUser(function(id, done) {
    Contact.findById(id, function(err, user) {
        done(err, user);
    });
});
app.get('/', function(req, res) {
    console.log("Cookies: ", req.cookies)
});

//console.log(passport.user);

//РЕГИСТРАЦИЯ
app.post("/signup", function(req, res, next) {
    var data = req.body;
    var user = new Contact(data);
    user.save(function(err, user) {
        if (err) {
            var regErr = err;

            console.log(regErr);
            return regErr;

        } else {
            console.log(data.username + " saved!")
            res.redirect("/");

            next()
        };
    });

});
//Contact.find(function(err, users) {
//    console.log(users);
//});
// CHAT

var io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log("connected")
  io.emit('user connected',  + "connected");
  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });
});
