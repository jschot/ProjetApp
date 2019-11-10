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

    app.get('/search', function(req, res){
        if(req.session.username){
            dbo.collection("accidents").find({description:req.query.search}).toArray(function(err, result){ 
            if(err) throw err;
            if (result.length == 0) {
				console.log(result.length);
				res.render('Page1.html',{Date:getDate(), username:req.session.username});
			}
			else {
				var desc = result[0].description;
				var adr = result[0].Adresse;
				var who = result[0].user;
				var dat = result[0].date;
				res.render('Page1.html',{Date:getDate(), username:req.session.username, Desc:desc, Adr:adr, Who:who, Datum:dat});
			}
			});
		}
		else {
			res.render('Page2.html');
		}
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
                if(reqUsername == "" || reqPassword == "" || req.query.full_name == "" || req.query.email == ""){
                    res.render('Page2.html', {signError: "Veuillez remplir tous les champs"});
                }
                else{
                    var userAcc = {username: reqUsername, password: reqPassword, fullName: req.query.full_name, email: req.query.email};
                    dbo.collection("account").insertOne(userAcc, function(err, res) {
                        if (err) throw err;
                        console.log("added new user");
                    });
                    res.render('Page2.html');
                }
            }
        });
    })

	app.get('/submit', function(req, res){
	var descrip = req.query.description;
	var adresse = req.query.adresse;
	var sesUsername = req.session.username;
	if (descrip == "" && adresse == ""){
	  res.render('Page3.html', {error1 : "ERROR : Veuilliez donner une description et une adresse SVP"});
	}
	if (descrip == ""){
	  res.render('Page3.html', {error1 : "ERROR : Veuilliez donner une descriptin du problème SVP"});
	}
	if (adresse == ""){
	  res.render('Page3.html', {error1 : "ERROR : Veuilliez donner une adresse SVP"});
	}
	else{
	  dbo.collection("accidents").insert({description : descrip ,Adresse : adresse, user : sesUsername, date : getDate()});
	  console.log ("added new accidents.");
	  res.render('Page3.html', {error1 : "Informations bien enregistrés !"});
	}
	})

	app.get('/firstpage', function(req, res) {
		if(req.session.username){
            res.render('Page1.html', {username:req.session.username, Date:getDate()});
        }
        res.render('Page2.html',{username:req.session.username});
	})
	app.get('/secpage', function(req, res) {
		if(req.session.username){
            res.render('Page1.html', {username:req.session.username, Date:getDate()});
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
    
    app.get('/disconnect', function(req, res){
        req.session.username = "";
        res.redirect('/');
    })

    app.use(express.static('static'));
    app.listen(8080);

})