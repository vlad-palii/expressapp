var assert = require("assert");
var operations = require("./operations.js");
const request = require("supertest");
var app = require("./app").app;


it("should multiply two nums", function(){

  var expectedResult = 14;

  var result = operations.multiply(7, 2);

  assert.equal(expectedResult, result);

});


it("shoud async multiply two numbers", function(done){
     
  var expectedResult = 12;

  operations.multiplyAsync(4, 3, function(result){
      if(result!==expectedResult){
          throw new Error(`Expected ${expectedResult}, but got ${result}`);
      }
      done();
  });
});
 
 
it("should return Test", function(done){
     
    request(app)
        .get("/test")
        .expect("test")
        .end(done);
        
});


it("should return NotFound with status 404", function(done){
     
  request(app)
      .get("/error")
      .expect(400)
      .expect("error")
      .end(done);
});