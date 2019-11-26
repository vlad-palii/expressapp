const express = require("express");
//const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "usersdb",
  password: "root"
});

const Schema = mongoose.Schema;

const userScheme = new Schema({
  name: {
      type: String,
      required: true,
      minlength:3,
      maxlength:20
  },
  age: {
      type: Number,
      required: true,
      min: 1,
      max:100
  }
});

// подключение
mongoose.connect("mongodb://localhost:27017/usersdb", { useNewUrlParser: true, useUnifiedTopology: true });
  
const User = mongoose.model("User", userScheme);
//const user = new User(); // name - NoName, age - 22
const user = new User({name: "Tom", age: 99}); // name - Tom, age - 22
const user3 = new User({age:34}); // name - NoName, age - 34

user.save(function(err){
  mongoose.disconnect();  // отключение от базы данных
    
  if(err) return console.log(err);
  console.log("Сохранен объект", user);
});

User.find({}, function(err, docs){
  mongoose.disconnect();
   
  if(err) return console.log(err);
   
  console.log(docs);
});

User.find({name: "Tom"}, function(err, docs){
  mongoose.disconnect();
   
  if(err) return console.log(err);
   
  console.log(docs);
});

//const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true });

//let dbClient;

// app.use(express.static(__dirname + '/public'));

// mongoClient.connect(function(err, client){
//   if(err) return console.log(err);
//   dbClient = client;
//   app.locals.collection = client.db("usersdb").collection("users");
//   app.listen(3000, function(){
//       console.log("Сервер ожидает подключения...");
//   });
// });


const app = express();
const jsonParser = express.json();

app.get("/api/users", function(req, res){
        
  const collection = req.app.locals.collection;
  collection.find({}).toArray(function(err, users){
       
      if(err) return console.log(err);
      res.send(users)
  });
   
});

app.get("/api/users/:id", function(req, res){

  const id = new objectId(req.params.id);
  const collection = app.locals.collection;

  collection.findOne({_id: id}, function(err, user){

    if (err) return console.log(err);

    res.send(user);

  })

})

app.post("/api/users", jsonParser, function(req, res){

  if(!req.body) return res.sendStatus(400);

  const userName = req.body.name;
  const userAge = req.body.age;
  const user = {name: userName, age: userAge};

  const collection = app.locals.collection;
  collection.insertOne(user, function(err, result){
    if(err) return console.log(err);

    res.send(user);
  })

})

app.delete("/api/users/:id", function(req, res){

  const id = new objectId(req.params.id);
  const collection = app.locals.collection;
  collection.findOneAndDelete({_id: id}, function(err, result){
    if(err) return console.log(err);

    let user = result.value;
    res.send(user);
  })

})

app.put("/api/users", jsonParser, function(req, res){
        
  if(!req.body) return res.sendStatus(400);
  const id = new objectId(req.body.id);
  const userName = req.body.name;
  const userAge = req.body.age;
     
  const collection = req.app.locals.collection;
  collection.findOneAndUpdate({_id: id}, { $set: {age: userAge, name: userName}},
       {returnOriginal: false },function(err, result){
             
      if(err) return console.log(err);     
      const user = result.value;
      res.send(user);
  });
  
});

mysqlConnection.connect((err) => {
  if(err) return console.log(err.message)

  console.log("success connection");
})

mysqlConnection.query("SELECT * FROM users",
function(err, results, fields) {
  console.log(err);
  console.log("results", results); // собственно данные
  console.log("meta data", fields); // мета-данные полей 
});


const sqluser = ["Tom"];
const sql = "INSERT INTO users(name) VALUES(?)";
 
mysqlConnection.query(sql, sqluser, function(err, results) {
    if(err) console.log(err);
    else console.log("Данные добавлены");
});

mysqlConnection.end();

process.on("SIGINT", () => {
  //db.close();
  mysqlConnection.destroy();
  process.exit();
})