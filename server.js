var express = require('express');
var consolidate = require('consolidate');
var session = require('express-session');
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

    app.use(session({
        secret: "projetPrepa",
        resave: false,
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 3600000
        }
    }))

    app.get('/', function(req,res){
        sesUsername = req.session.username;
        console.log("New connection");
        console.log(sesUsername);
        dbo.collection("account").find({username:sesUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
                console.log("Already logged redirect to page1");
                res.render('Page1.html', {username:sesUsername, Date:getDate()})
            }
            else{
                console.log("not connected redirect to connection page");
                res.render('Page2.html'); 
            }
        })
    })

    app.get('/log', function(req, res){
        var reqUsername = req.query.username;
        var reqPassword = req.query.password;
        
        dbo.collection("account").find({username:reqUsername}).toArray(function(err, result){ //finding in the DB the data for the username
            if(err) throw err;
            var pass = result[0].password; //get the password from the DB
            console.log("Connection attempt with:")
            console.log(result[0].password);
            if(pass == reqPassword){ //test if the password given by the user is good
                req.session.username = reqUsername;
                console.log("User connected with:")
                console.log(req.session.username);
                console.log("-------------")
                res.render('Page1.html',{Date:getDate(), username:reqUsername});
            }else{
                console.log("-------------")
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
		if(req.session.username){
            res.render('Page1.html', {username:req.session.username, Date:getDate()})
        }
        res.render('Page2.html',{username:req.session.username});
	})
	app.get('/secpage', function(req, res) {
		if(req.session.username){
            res.render('Page1.html', {username:req.session.username, Date:getDate()})
        }
		else {
		res.render('Page2.html');
		}
	})
	app.get('/thirdpage', function(req, res) {
        sesUsername = req.session.username;
        dbo.collection("account").find({username:sesUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
                res.render('Page3.html', {username:sesUsername});
            }
            else{
                res.render('Page2.html'); 
            }
        })
	})


    app.use(express.static('static'));
    app.listen(8080);

})