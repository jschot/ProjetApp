var express = require('express');
var consolidate = require('consolidate');
var app = express ()
//MangoDB connection 
var MongoClient = require('mongodb').MongoClient
var Server = require('mongodb').Server;
var url = 'mongodb://localhost:27017'


MongoClient.connect(url, function(err, db){
    dbo = db.db("projetPrepa");
    if (err) throw err;
    console.log("Successfull connection to Database")

    app.engine ( 'html', consolidate.hogan )
    app.set('views', 'static');

    app.get('/', function(req,res){
        res.render('Page2.html')
    })

    app.get('/log', function(req, res){
        var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var today = new Date();
        var date =  today.toLocaleDateString("en-US", options);
        var reqUsername = req.query.username;
        var reqPassword = req.query.password;
        
        dbo.collection("account").find({username:reqUsername}).toArray(function(err, result){ //finding in the DB the data for the username
            if(err) throw err;
            var pass = result[0].password; //get the password from the DB
            console.log("Connection attempt with:")
            console.log(result[0].password);
            console.log("-------------")
            if(pass == reqPassword){ //test if the password given by the user is good
                res.render('Page1.html',{Date: date, username:reqUsername});
            }else{
                res.render('Page2.html',{tried:"Mot de passe ou/et nom d'utilisateur incorrects"})
            }
        });
    })

    app.use(express.static('static'));
    app.listen(8080);

})