var express = require("express");
//Import the mongoose module
var mongoose = require("mongoose");
const crypto = require ("crypto");
var UserDatamodel = require("./models/classes");
var bodyParser = require("body-parser");
const router = require("express").Router();
var newUserModel = require('./models/usermodel');
const bcrypt = require('bcryptjs')
const session = require('express-session');
const { MongoDBStore } = require("connect-mongodb-session");
const mongoDBSession = require('connect-mongodb-session')(session);
require("dotenv").config();


var app = express();
app.use(bodyParser.json()); // Used to parse JSON bodies
// or
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// //Set up default mongoose connection

// const mongoUri =
  const mongoUri = 
  'mongodb+srv://nodeassignmentdatabase:LBwwV5OmbR7vyCdU@cluster0.mqo4s.mongodb.net/test'
mongoose
  .connect(mongoUri, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
  })
  // .then((result) => app.listen(27))
  .catch((err) => console.log(Error));

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const store = new mongoDBSession({
  uri: mongoUri,
  collection: "mySession",
});

//create sesssion for page authorisation
app.use(
  session({
    secret: "process.env.",
    resave:false,
    saveUninitialized:false,
    // store:store,
  })
);

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.static("public"));
// use res.render to load up an ejs view file
//check authentification of users

const isAuth = (req, res, next) =>{
const sess = req.session;
console.log(sess.role);
if(req.session.isAuth){
  console.log("in the Auth fuc");
  console.log(sess.role);
  if(sess.role == "Driver"){
    console.log("User is Driver");
    next();
  }else if (sess.role == "Examiner"){
    console.log("User is Examiner");
    res.redirect('/notpermitted');
  }
  else if (sess.role == "Admin"){
    console.log("User is Driver");
    res.redirect('/notpermitted');
  }
}else{
  console.log("USer aint logged in");
  res.redirect("/login");
}

}

// index page
app.get("/notpermitted", function (req, res) {
  
  res.render("pages/notpermitted");
});


// index page
app.get("/", function (req, res) {
  const sess = req.session;
  if(sess.username) {
      return res.render("pages/loggedIndex");
  }
  console.log(req.session);
  res.render("pages/index");
});

// Goes to the login page
router.get("/login", function (req, res) {
  const sess = req.session;
    if(sess.username) {
        return res.redirect('/G2_page');
    }

  res.render("pages/login");
});



router.post("/loginUser", async (req, res) => {
  const { username, password } = req.body;
  console.log( username, password );

  const user = await newUserModel.findOne({username});
  if (!user){
    return res.redirect('/signup');
  };
  const isMatch = await bcrypt.compare(password, user.password);
  var userRole = user.role;
  console.log("user Role: ", userRole);
  if(!isMatch){
    res.json({
      message: 'Incorrect Password!'
    });
    return res.redirect("/login");
  }
  var sess = req.session;
  sess.username = username;
  sess.role = userRole;
  sess.isAuth = true;
  console.log("Logged in successfully");
  res.redirect("/G2_page");
});


router.get('/logout',(req,res) => {
  req.session.destroy((err) => {
      if(err) {
          return console.log(err);
      }
      res.redirect('/');
  });

});


// Goes to the signup page
router.get("/signup", function (req, res) {
  const sess = req.session;
    if(sess.username) {
        return res.redirect('/G2_page');
    }

  res.render("pages/signup");
});


router.post("/usersignup", async (req, res, next) =>{
  const { username, role, password } = req.body;

  console.log(username, role, password);

  let user = await newUserModel.findOne({username});

  if (user) {
    console.log("User exist");
    return res.redirect('/signup'); 
  };

  const hashedPsw = await bcrypt.hash(password, 12); //encrypt the password

  user = new newUserModel({
    username,
    password: hashedPsw,
    role,
  });
  await user.save();
  //next
  res.redirect("/login");
});

router.post("/userdatarefinery",  isAuth, (req, res, next) => {
  const { DOB, licence } = req.body;
  const algorithm = "aes-256-cbc"; 
// generate 16 bytes of random data
  const initVector = crypto.randomBytes(16);
  const message = DOB;
  const licenceNo = licence;
  const Securitykey = crypto.randomBytes(32);
  // the cipher function
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  const cipherTWo = crypto.createCipheriv(algorithm, Securitykey, initVector);

// encrypt the message
// input encoding
// output encoding
  let encryptedDOBData = cipher.update(message, "utf-8", "hex");
  let encryptedLicenceData = cipherTWo.update(licenceNo, "utf-8", "hex");

  encryptedLicenceData  += cipherTWo.final("hex");
  encryptedDOBData += cipher.final("hex");

  console.log("Encrypted message: " + encryptedDOBData + "Enctypted Licence" + encryptedLicenceData);

  var UserDataItems = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userId: req.body.userId,
    DOB: encryptedDOBData,
    address: req.body.address,
    carDetails: req.body.carDetails,
    LicenceNumber:encryptedLicenceData,
  };
  var data = new UserDatamodel(UserDataItems);
  data.save();
  // next()
  sess =  req.session;
  sess.encryptedDOBData = encryptedDOBData;
  sess.encryptedLicenceData = encryptedLicenceData;
  res.redirect("/G_page");
});


// Goes to the G2_page
router.get("/G2_page", isAuth, (req, res)=> {
  res.render("pages/G2_page");
});

router.get("/G_page", isAuth, (req, res) =>{
  res.render("pages/G_page");
});

// Goes to the G_page
router.post("/G_pagequery", isAuth, (req, res) => {
  // query the database engine
  // respond with template data
  var userId = req.body.user_id;
  console.log(userId);
  const data =  UserDatamodel.findOne({ userId: userId })
  .then((data) => {
    console.log(data);
    if (data) {
      console.log(data);
      
      res.render("pages/vehicleData", { data });
        
    } else {
      console.log("User does not exist");
      res.redirect("/G2_page");
    }
  })
  .catch((err) => {
    console.log(err);
  });
  // console.log(req.query);
  // console.log(result);
});


router.post("/userdataupdate", isAuth, (req, res, next) =>{
  const userId = { userId: req.body.userId };
  const neData = { address: req.body.address, carDetails: req.body.carDetails };

  let doc = UserDatamodel.findOneAndUpdate(userId, neData);
  res.render("pages/G_page");
  console.log(doc);
});

app.use('/', router);

app.listen(8080, () => {
  console.log("Server is live on http:/localhost:8080");
});
//add the router
