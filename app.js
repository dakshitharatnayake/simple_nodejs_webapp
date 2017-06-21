var express = require('express');
var bodyParser = require('body-parser');
var path = require('path'); // this is a core mdule
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var ObjectId = mongojs.ObjectId;


var app = express(); //initialize
var db = mongojs('customerapp', ['users']); //mongo db -- customerapp is db name


//View Engine
app.set('view engine', 'ejs');
//specifiy which folder must be used for views
app.set('views', path.join(__dirname, 'views'));

//Body Parser Middleware
app.use(bodyParser.json()); //bodyParser.json() will handle json content
app.use(bodyParser.urlencoded({extended: false}));

//Global Variables
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});


//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Set Static Path (for css files, jquery files etc.)
//If this folder contains an HTML file that content will override what's specified in this app.js file
app.use(express.static(path.join(__dirname, 'public'))); // public is the name of the folder



//add routes

app.get('/', function(req, res) {
  // find everything
  db.users.find(function (err, docs) {
  	// docs is an array of all the documents in mycollection
    //console.log(docs);
    res.render('index', {
    title: 'Customers',
    users: docs
  })
})
});


app.post('/users/add', function(req,res){
  //Error validation with express-validator
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('age', 'Age is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    console.log('ERRORS');
    db.users.find(function (err, docs) {
    	// docs is an array of all the documents in mycollection
      //console.log(docs);
      res.render('index', {
      title: 'Customers',
      users: docs,
      errors: errors});
    });
  } else {
    var newUser = {
      name: req.body.name,
      age: req.body.age,
      email: req.body.email
    };
  db.users.insert(newUser, function(err, result){
    if(err){
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
  console.log('FORM SUBMITTED');
  }
});


app.delete('/users/delete/:id', function(req, res){
  console.log(req.params.id);
  db.users.remove({_id: ObjectId(req.params.id), function(err, result){
    if(err){
      console.log(err);
    }
    res.redirect('/');
  }});
});

app.listen(3000, () => {
  console.log('Server started on port 3000...');
});
