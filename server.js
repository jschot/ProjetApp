var express = require('express');
var consolidate = require('consolidate');
var app = express ()
//MangoDB connection 
var MongoClient = require('mongodb').MongoClient
var Server = require('mongodb').Server;
var url = 'mongodb://localhost:27017'

function getDate(){
    var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date();
    var date =  today.toLocaleDateString("en-US", options);
    return date;
}

MongoClient.connect(url, function(err, db){
    dbo = db.db("projetPrepa");
    if (err) throw err;
    console.log("Successfull connection to Database")

    app.engine ( 'html', consolidate.hogan )
    app.set('views', 'static');

    app.get('/', function(req,res){
        res.render('Page2.html');
    })

    app.get('/log', function(req, res){
        var reqUsername = req.query.username;
        var reqPassword = req.query.password;
        
        dbo.collection("account").find({username:reqUsername}).toArray(function(err, result){ //finding in the DB the data for the username
            if(err) throw err;
            var pass = result[0].password; //get the password from the DB
            console.log("Connection attempt with:")
            console.log(result[0].password);
            console.log("-------------")
            if(pass == reqPassword){ //test if the password given by the user is good
                res.render('Page1.html',{Date:getDate(), username:reqUsername});
            }else{
                res.render('Page2.html',{tried:"Mot de passe ou/et nom d'utilisateur incorrects"})
            }
        });
    })

    app.get('/sign_in', function(req, res){
        var reqUsername = req.query.username;
        var reqPassword = req.query.password;
        dbo.collection("account").find({username:reqUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
                //accout already exist
                console.log("Try to create a new account with an username which is already taken:");
                console.log(reqUsername);
                console.log("-------------");
                res.render('Page2.html',{signError:"Ce nom d'utilisateur existe déja"})
            }else{
                console.log(result);
                var userAcc = {username: reqUsername, password: reqPassword, fullName: req.query.full_name};
                dbo.collection("account").insertOne(userAcc, function(err, res) {
                    if (err) throw err;
                    console.log("added new user");
                });
                res.render('Page2.html');
            }
        });
    })
	
	app.get('/firstpage', function(req, res) {
		var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var today = new Date();
		var date =  today.toLocaleDateString("en-US", options);
		res.render('Page1.html',{Date: date});
	})
	app.get('/secpage', function(req, res) {
		res.render('Page2.html');
	})
	app.get('/thirdpage', function(req, res) {
		res.render('Page3.html');
	})

    app.use(express.static('static'));
    app.listen(8080);

})