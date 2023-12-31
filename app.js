var express = require("express");
var path = require("path");
var session = require("express-session");
let alert = require("alert");
var fs = require("fs");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const { isNull } = require("util");
const { render } = require("ejs");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "DYS",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.render("login");
});
if (process.env.PORT) {
  app.listen(process.env.PORT, function () {
    console.log("server started");
  });
} else {
  app.listen(3000, function () {
    console.log("server started on port 3000");
  });
}

function login(user, res) {
  var MongoClient = require("mongodb").MongoClient;
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");
    db.collection("myCollection")
      .find({ username: user.username, password: user.password })
      .toArray(function (err, results) {
        if (results.length == 0) {
          alert("USERNAME or PASSWORD is incorrect");
          res.render("login");
        } else {
          res.render("home");
        }
      });
  });
}
app.post("/", function (req, res) {
  var name = req.body.username;
  var pass = req.body.password;
  req.session.username = name;
  var user = { username: name, password: pass };
  if(name=="admin"&pass=="admin")
  res.render("home");
  else
  login(user, res);
});

// start get methods for all pages
app.get("/annapurna", auth, function (req, res) {
  res.render("annapurna");
});
app.get("/bali", auth, function (req, res) {
  res.render("bali");
});
app.get("/cities", auth, function (req, res) {
  res.render("cities");
});
app.get("/hiking", auth, function (req, res) {
  res.render("hiking");
});
app.get("/home", auth, function (req, res) {
  res.render("home");
});
app.get("/inca", auth, function (req, res) {
  res.render("inca");
});
app.get("/islands", auth, function (req, res) {
  res.render("islands");
});
app.get("/paris", auth, function (req, res) {
  res.render("paris");
});
app.get("/registration", function (req, res) {
  res.render("registration");
});
app.get("/santorini", auth, function (req, res) {
  res.render("santorini");
});
app.get("/search", auth, function (req, res) {
  res.render("searchresults");
});
app.get("/wanttogo", auth, function (req, res) {
 showCart(req,res)
});
app.get("/rome", auth, function (req, res) {
  res.render("rome");
});
//end get methods for all pages
//start registeration method
app.post("/register", function (req, res) {
  var name = req.body.username;
  var pass = req.body.password;
  req.session.username = name;
  var user = { username: name, password: pass };
  register(user, res);
});
//start register function
function register(user, res) {
  var MongoClient = require("mongodb").MongoClient;
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");
    db.collection("myCollection")
      .find({ username: user.username })
      .toArray(function (err, results) {
        if (results.length != 0) {
          alert("USERNAME is already used");
          res.render("registration");
        } else if (user.username == "" || user.password == "") {
          alert("USERNAME AND PASSWORD CANNOT BE EMPTY!");
          res.redirect("registration");
        } else {
          db.collection("myCollection").insertOne({
            username: user.username,
            password: user.password,
            wanttogolist: [],
          });
          res.redirect("/");
          alert("REGISTRATION WAS SUCCESSFUL!");
        }
      });
  });
}
//end register function
//end registration
//start all pages post
app.post("/addbali", function (req, res) {
  addplaces(req, "bali");
  res.render("bali");
  
});
app.post("/addannapurna", function (req, res) {
  addplaces(req, "annapurna");
  res.render("annapurna");
});
app.post("/addinca", function (req, res) {
  addplaces(req, "inca");
  res.render("inca");
});
app.post("/addparis", function (req, res) {
  addplaces(req, "paris");
  res.render("paris");
});
app.post("/addrome", function (req, res) {
  addplaces(req, "rome");
  res.render("rome");
});
app.post("/addsantorini", function (req, res) {
  addplaces(req, "santorini");
  res.render("santorini");
});
//end post of all pages
//start add places
function addplaces(req, place) {
  var MongoClient = require("mongodb").MongoClient;
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");

    var collection = db.collection("myCollection");
    collection
      .find({ username: req.session.username })
      .toArray(function (err, results) {
        var flag = false;

        for (let i = 0; i < results[0].wanttogolist.length; i++) {
          if (results[0].wanttogolist[i] == place) {
            flag = true;
          }
        }
        if (flag) alert("already here");
        else {
          alert("Product is added successfully!");
          results[0].wanttogolist.push(place);
          var newcart = { $set: { wanttogolist: results[0].wanttogolist } };
          collection.updateOne(
            { username: req.session.username },
            newcart,
            { w: 1 },
            function (err, result) {
              if (err) throw err;
            }
          );
        }
      });
  });
}
//end add places
//auth start
function auth(req, res, next) {
  if ("username" in req.session) {
    next();
  } else {
    res.redirect("/");
  }
}
//auth end
//start show cart

async function showCart(req,res){
  var MongoClient = require("mongodb").MongoClient;
  await MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");

    var collection = db.collection("myCollection");
    collection
      .find({ username: req.session.username })
      .toArray(function (err, results) {
      res.render("wanttogo",{places:results[0].wanttogolist})
     
      })
 
    })
}

   
  


//end show cart
//start search 
app.post("/search",auth,function(req,res){

var result=searchplace(req,res);
if(result.length==0)
alert("Destination not Found");

res.render("searchresults",{results:result});

})
function searchplace(req,res){
var input=req.body.Search.toLowerCase();
var result=[];
if("bali".includes(input))
result.push("bali");
if("paris".includes(input))
result.push("paris")
if("rome".includes(input))
result.push("rome")
if("annapurna".includes(input))
result.push("annapurna")
if("santorini".includes(input))
result.push("santorini")
if("inca".includes(input))
result.push("inca")

return result;
}