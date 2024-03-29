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

app.get("/error", function(req, res){

  res.status(400);
  res.send("error");

});

app.listen(3000, function(){
  console.log("waiting for connections");
})

module.exports.app = app;

const MongoClient = require("mongodb").MongoClient;

// создаем объект MongoClient и передаем ему строку подключения
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true });

function deleteUser (user) {

  return new Promise(resolve => {
    mongoClient.connect(function(err, client){

      const db = client.db("usersdb");
      const collection = db.collection("users");
  
      collection.deleteMany(user, function(err, result){
        console.log('delete', result);
        client.close();
        resolve(result);
      });

    });
  })

}

function getAll () {

  return new Promise(resolve => {
    mongoClient.connect(function(err, client){

      const db = client.db("usersdb");
      const collection = db.collection("users");

      collection.find().toArray(function(err, result){
  
        if(err) return console.log(err);
        
        console.log('getall', result);
        client.close();
        resolve(result);
      });

    });
  })

}

app.get('/user', async (req, res, next) => {
  try {
    const users = await getAll();
    res.send(users);
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
    console.log("next")
  }
})

app.delete('/user/:name', async (req, res, next) => {

  const name = req.params.name;
  const user = {
    name: name
  };

  try {
    const users = await deleteUser(user);
    res.send(users);
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e)
    console.log("next")
  }
})