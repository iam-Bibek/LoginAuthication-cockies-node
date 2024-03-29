//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session =require("express-session");
const passport= require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
 app.use(session({
    secret: 'secrect key',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema =new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// encryption of user data


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get('/logout', function(req, res){
  res.redirect("/");
});

app.post('/logout', function(req, res){
  req.logout();
  res.redirect('/logout');
});


app.get("/secrets",function(req,res){
   if(req.isAuthenticated()){
    res.render("secrets");
   }else{
    res.render("/login");
   }
});

// save data through register

app.post("/register", function (req, res) {
    User.register({username: req.body.username},req.body.password , function(err , user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
        passport.authenticate("local") (req, res, function(){
          res.redirect("/secrets");
        })
      }
    });
});

// validation inlogin page
app.post("/login", function (req, res) {
 const user = new User({
  username : req.body.username ,
  password : req.body.password
 });
 req.login(user, function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local") (req,res,function(){
      res.redirect("/secrets");
    })
  }
 })
});

app.listen(3000, function () {
  console.log("register app sterted at port 3000");
});
