const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

let app = express();
let jsonParser = bodyParser.json();

app.use(express.static(__dirname + "/public"));

app.get("/api/users", function(req, res){

  var content = fs.readFileSync("users.json", "utf8");
  var users = JSON.parse(content);
  res.send(users);

});

app.get("/api/users/:id", function(req, res){

  var id = req.params.id;
  var content = fs.readFileSync("users.json", "utf8");
  var users = JSON.parse(content);
  let user = null;

  users.map(function(u) {
    if (u.id == id) {
      return user = u;
    }
  });

  if(user) {
    res.send(user);
  }
  else {
    res.status(404).send();
  }

});

app.post("/api/users", jsonParser, function(req, res){
  if(!req.body) return res.sendStatus(400);

  var userName = req.body.name;
  var userAge = req.body.age;
  var user = {name: userName, age: userAge};
  var data = fs.readFileSync("users.json", "utf8");
  var users = JSON.parse(data);

  var id = Math.max.apply(Math, users.map(function(o){return o.id}));
  user.id = id+1;
  users.push(user);

  var dataUpdated = JSON.stringify(users);
  fs.writeFileSync("users.json", dataUpdated, "utf8");
  res.send(user);

});

app.delete("/api/users/:id", function(req, res){

  var id = req.params.id;
  var data = fs.readFileSync("users.json", "utf8");
  var users = JSON.parse(data);
  var index = -1;

  for(var i = 0; i < users.length; i++) {
    if(users[i].id == id) {
      index = i;
      break; // !!!!!! always exit from FOR 
    }
  }

  if(index > -1) {

    var user = users.splice(index, 1)[0];
    var data = JSON.stringify(users);
    
    fs.writeFileSync("users.json", data, "utf8");
    res.send(user);
  }
  else {
    res.status(404).send();
  }

});

app.put("/api/users/", jsonParser, function(req, res){

  var userId = req.body.id;
  var userName = req.body.name;
  var userAge = req.body.age;

  var data = fs.readFileSync("users.json");
  var users = JSON.parse(data);
  var user = null;

  users.map(function(u) {
    if (u.id == userId) {
      return user = u;
    }
  });

  if(user){
    user.age = userAge;
    user.name = userName;

    var data = JSON.stringify(users);
    fs.writeFileSync("users.json", data, "utf8");
    res.send(users);
  }
  else {
    res.status(404).send();
  }

});

app.get("/test", function(req, res){

  res.send("test");

});

app.listen(3000, function(){
  console.log("waiting for connections");
})

module.exports.app = app;