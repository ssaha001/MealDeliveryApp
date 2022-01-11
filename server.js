/*********************************************************************************
 *  WEB322 – Assignment 6
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: Soumik Saha     Student ID: 140721200          Date: 5th December 2021.
 *
 *  Online (Heroku) URL: https://arcane-escarpment-38969.herokuapp.com/
 *
 ********************************************************************************/
let HTTP_PORT = process.env.PORT || 8080;
let path = require("path");
let stream =require("stream");
const helper=require('./module/validateImage');
const bodyParser = require("body-parser");
let express = require("express");
const exphbs = require("express-handlebars");
const Sequelize = require("sequelize");
let multer=require("multer");
const clientSessions = require("client-sessions");
const bcrypt = require('bcryptjs');
const { Server } = require("http");
let app = express();
app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(bodyParser.urlencoded({ extended: true }));
//Serving the static files to the client.
app.use("/static", express.static(path.join(__dirname, "/static")));

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "Quick123Meal456Delivery875Login050301", 
  duration: 3 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));
//function to check that a user has logged in
function ensureUserLogin(req,res,next){
  if(!req.session.user){
    res.render('login',{
      errorMsg:"You need to login first.",
      layout: false
    })
  }
  else{
    next();
  }
}
//Function to check that an admin has logged in
function ensureAdminLogin(req,res,next){
  if(!req.session.user || req.session.user.isAdmin==false){
    res.render("login", {
      errorMsg: "You need to login from your admin account.",
      admin:"admin",
      layout: false,
    });
  }
  else{
    next();
  }
}
// Defining sequelize
var sequelize = new Sequelize(
  "do4ombgokm4k",
  "ennvlmibpsrltz",
  "39a0142fae1951f22975a791f8becff66c4d8a7a92ce197d943f81200731d36c",
  {
    host: "ec2-34-204-128-77.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);
sequelize
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });
  //Defining the user details table's schema
  var UserDetails = sequelize.define("UserDetails", {
    fname: Sequelize.STRING,
    lname: Sequelize.STRING,
    userName: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: Sequelize.STRING,
    postal: Sequelize.STRING,
    admin: Sequelize.BOOLEAN
  });
  //Defining the package details table schema
  var PackageDetails = sequelize.define("PackageDetails", {
    name: {type:Sequelize.STRING,primaryKey:true},
    desc: Sequelize.TEXT,
    cost: Sequelize.FLOAT,
    package:Sequelize.STRING,
    fname:Sequelize.STRING,
    ftype:Sequelize.STRING,
    fdata:Sequelize.BLOB
  });
  // setup a route to listen on the Home path.
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/home.html"));
});

//Setup a route to listen on the mealPackage path.
app.get("/mealPack",ensureAdminLogin, function (req, res) {
  res.sendFile(path.join(__dirname, "/addMealPackage.html"));
});
//Setup a route to display the registration page
app.get("/registration", function (req, res) {
  res.sendFile(path.join(__dirname, "/registration.html"));
});
//Setup a route to display the registration page for admin
app.get("/registrationAdmin", function (req, res) {
  res.sendFile(path.join(__dirname, "/registrationAdmin.html"));
});
//Setup a route to display the login page to user.
app.get("/signin", function (req, res) {
  res.sendFile(path.join(__dirname, "/login.html"));
});
//Setup a route for listening to the update route
app.get('/update',ensureAdminLogin,(req,res)=>{
  res.sendFile(path.join(__dirname, "/updateMealPackage.html"));
})
//Registering a new user.
app.post("/register-user", (req, res) => {
  const formData = req.body;
  let encryptedPass;
  bcrypt.hash(formData.password,10).then(hash=>{
        encryptedPass=hash;
  }).catch(err=>{
    console.log(err);
  });
  sequelize.sync().then(function () {
    UserDetails.create({
      fname: formData.first_name,
      lname: formData.last_name,
      userName: formData.username,
      password: encryptedPass,
      email: formData.email,
      postal: formData.postal,
      admin:false
    })
      .then(function () {
        console.log("User Added Successfully");
      })
      .catch(function (err) {
        console.log("An error occured!");
      });
  });
  req.session.user = {
    username: formData.username,
    email: formData.email,
    isAdmin: false
  };
  res.render("registered", {
    data: formData,
    layout: false,
  });
});
//For registering an admin
app.post("/register-admin", (req, res) => {
  const formData = req.body;
  let encryptedPass;
  bcrypt.hash(formData.password,10).then(hash=>{
        encryptedPass=hash;
  }).catch(err=>{
    console.log(err);
  });
  sequelize.sync().then(function () {
    UserDetails.create({
      fname: formData.first_name,
      lname: formData.last_name,
      userName: formData.username,
      password: encryptedPass,
      email: formData.email,
      postal: formData.postal,
      admin:true
    })
      .then(function () {
        console.log("User Added Successfully");
      })
      .catch(function (err) {
        console.log("An error occured!");
      });
  });
  req.session.user = {
    username: formData.username,
    email: formData.email,
    isAdmin: true
  };
  res.render("registered", {
    data: formData,
    layout: false,
  });
});
// Logging in both user and admin
app.post("/login", (req, res) => {
  const formData = req.body;
    sequelize.sync().then(function () {
    UserDetails.findAll({}).then(function (details) {
      let control = -1;
      let cont=false;
      for (let i = 0; i < details.length && control == -1; i++) {
        console.log("Entered for");
        let match;
        if (
          details[i].userName == formData.username &&
          bcrypt.compareSync(formData.password, details[i].password) &&
          details[i].email == formData.email
        ) {
          control = i;
        }
      }
      if (control != -1) {
        req.session.user = {
          username: formData.username,
          email: formData.email,
          isAdmin: details[control].admin
        };
        if(req.session.user.isAdmin===true){
        res.render("welcome", {
          data: details[control],
          admin:"Admin",
          layout: false,
        });
        }
        else{
          res.render("welcome", {
            data: details[control],
            layout: false
          });
        }
      }
       else {
        res.render("welcome", {
          errorMsg: "Please enter the correct credentials.",
          layout: false,
        });
      }
    });
  });
});
//Defining the storage for storing images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './static/packageImages');
  },
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

//Storing the meal package in our database.
app.post('/newPackage',upload.single("photo"),(req,res)=>{
  const mealData=req.body;
  let mealImage=req.file;
  if(helper.validateImage(mealImage)){
    sequelize.sync().then(function () {
      PackageDetails.create({
        name: mealData.name,
        desc: mealData.description,
        cost: mealData.cost,
        package: mealData.noMeals,
        fname: mealImage.filename,
        ftype: mealImage.mimetype,
        fdata: mealImage
      })
        .then(function () {
          console.log("Package added Successfully");
          res.render('addConfirmation',{
            data:"Success",
            layout: false
          })
        })
        .catch(function (err) {
          console.log("An error occured!");
          res.render('addConfirmation',{
            errorMsg: "Package name already exists, add a new one or update the old one.",
            layout: false
          })
        });
    });
  }
  else{
    res.render('addConfirmation',{
      errorMsg: "File must be an image only. (JPG,PNG,JPEG)",
      layout: false
    })
  }
})
//Setup a route for listening to the mealPackage route
app.get("/mealPackage",ensureUserLogin, function (req, res) {
  sequelize.sync().then(function () {
    PackageDetails.findAll({}).then(function (details) {
      res.render('mealPackage',{
        data:details,
        layout: false
      })
    });
  })
});
//Route to update the package info
app.get("/mealPackMod",ensureAdminLogin,(req,res)=>{
  sequelize.sync().then(function () {
    PackageDetails.destroy({
      where: { name: "ijk" } 
  })
    PackageDetails.findAll({}).then(function (details) {
      res.render('updatePackage',{
        data:details,
        layout: false
      })
    });
  })
})
//Update the database with modified package details
app.post('/modifyPackage',(req,res)=>{
  const data=req.body;
  sequelize.sync().then(function () {
    let pos=-1;
    PackageDetails.findAll().then(function(details){
      for(let i=0;i<details.length;i++){
        if(details[i].name==data.name){
          pos=i
        }
      }
    if(pos!=-1){
    PackageDetails.update({
        name: data.new_name,
        desc: data.description,
        cost: data.cost,
        package: data.noMeals
    },{
      where: {name:data.name}
    })
    res.render('updateConfirmation',{
      data:"Succesfull",
      layout:false
    })
  }
  else{
        res.render('updateConfirmation',{
          errorMsg:"The meal package you are trying to update does not exist.",
          detail:"Please enter the correct package name to update.",
          layout: false
        })
      }
  })
})
})

// Route for logout
app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/signin");
});
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
