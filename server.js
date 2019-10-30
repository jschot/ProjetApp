var express = require('express');
var consolidate = require('consolidate');
var app = express ()

app.engine ( 'html', consolidate.hogan )
app.set('views', 'static');

app.get('/', function(req,res){
    res.render('Page2.html')
})

app.get('/log', function(req, res){
    var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date();
    var date =  today.toLocaleDateString("en-US", options);
    var username = req.query.username;
    var password = req.query.password;
    if(password=='123pass'){
        res.render('Page1.html',{Date: date, username:req.query.username});
    }else{
        res.render('Page2.html',{tried:"Mot de passe ou/et nom d'utilisateur incorrects"})
    }
})

app.use(express.static('static'));
app.listen(8080);