//load all modules we need to use
const dotenv = require('dotenv').config();
const express = require('express'); // for creating server
const bodyParser = require('body-parser');
const path = require('path');// used to simplify file paths(Core module)
const { body, validationResult } = require('express-validator'); // for form validation
// const expressValidator = require('express-validator'); // for form validation
const mongojs = require('mongojs'); // connect to MongoDB database
const databaseUri = process.env.MONGOLAB_URI; // db connection string
const db = mongojs(databaseUri, ['users']);
//var ObjectId = require("mongojs").ObjectId;
const app = express(); //initialise a variable = express function
const port = process.env.PORT || 3000;

/*const logger = function(req, res, next){ // custom middleware. Takes req, res & next function as parameters
  console.log('Logging...'); //displays in console every time page reloads i.e. request is made
  next(); // allows next piece of middleware to run
};
app.use(logger); //calls the middleware*/

//VIEW ENGINE
app.set('view engine', 'ejs'); // the view engine to be used
app.set('views', path.join(__dirname, 'views')); // directory of the view

//BODY PARSER MIDDLEWARE
app.use(bodyParser.json()); // will handle json content from request
app.use(bodyParser.urlencoded({ extended: false })); // new obj will contain string or array value

//SET STATIC PATH E.G CSS, JQUERY DATA
app.use(express.static(path.join(__dirname, 'public'))); // public = name of folder containing static assets, __dirname = current directory

//GLOBAL VARIABLES - needs to be in its own middleware
//all global variables can be placed here using the same syntax (res.locals.NameHere)
app.use(function (req, res, next) {
  res.locals.errors = null; //default value - clear error value so expressValidator can use it
  next();
});

//EXPRESS VALIDATOR MIDDLEWARE
// app.use(expressValidator({
//   errorFormatter: function (param, msg, value) {
//     var namespace = param.split('.')
//       , root = namespace.shift()
//       , formParam = root;

//     while (namespace.length) {
//       formParam += '[' + namespace.shift() + ']';
//     }
//     return {
//       param: formParam, // location of error e.g. req.body.first_name
//       msg: msg, // error message for this parameter
//       value // no value required
//     };
//   }
// }));

// connect to db, find & return all docs
function getAllUsers(callback) {
  db.users.find(function (err, docs) {
    return callback(docs);
  });
};

app.get('/', (req, res) => { // handle a GET request from website (data usually POST). / = homepage

  getAllUsers(function (users) {
    res.render('index', {
      title: 'Customers',
      users: users // title is used by ejs to point to asset
    });
  });

});

// //DEAL WITH GET REQUEST (E.G. WHEN PAGE LOADS, LOAD USERS)
// app.get('/', (req, res) => { // handle a GET request from website (data usually POST). / = homepage
//   db.users.find(function (err, docs) { // docs is an array of all the documents in users collection
//   	res.render('index', {
//       title: 'Customers',
//       users: docs // title is used by ejs to point to asset
//     }); // use send method print response to screen
//   })

// });

//DEAL WITH POST REQUEST (E.G. FORM SUBMISSION)
app.post(
  '/users/add',
  body('first_name').notEmpty().withMessage('First Name is Required'),
  body('last_name').notEmpty().withMessage('Last Name is Required'),
  body('email').notEmpty().withMessage('Email Address is Required'),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) { // check for errors. If yes, this prints to cmd. If none, newUser object is created
      getAllUsers(function (users) {
        res.render('index', {
          title: 'Customers',
          users: users,
          errors: errors.array()
        });
      });
      const errorLog = {
        param: req.body, // location of error e.g. req.body.first_name
        msg: errors.array(), // error message
      };
      console.error(errorLog); // empty input message
    } else {
      let newUser = { // form data is put into this object
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email
      };
      db.users.insert(newUser, (err, result) => { // Adds new users to database
        if (err) { // check for error
          console.log(err);
        }
        res.redirect('/'); // if no error, redirect back to homepage
      });
    }

  });
// ORIGINAL
// app.post('/users/add', (req, res) => {
//   req.checkBody('first_name', 'First Name is Required').notEmpty(); // request to check form field. Also provides message for field if empty
//   req.checkBody('last_name', 'Last Name is Required').notEmpty(); // requires field to not be empty
//   req.checkBody('email', 'Email Address is Required').notEmpty();

//   let errors = req.validationErrors();

//   // if(errors){ // check for errors. If yes, this prints to cmd. If none, newUser object is created
//   //     res.render('index', {
//   //       title: 'Customers',
//   //       users: users,
//   //       errors: errors
//   //   });

//   if (errors) { // check for errors. If yes, this prints to cmd. If none, newUser object is created
//     getAllUsers(function(users){
//       res.render('index', {
//         title: 'Customers',
//         users: users,
//         errors: errors
//       });
//     })
//       console.log('ERRORS'); // empty input message
//     }else {
//       let newUser = { // form data is put into this object
//         first_name: req.body.first_name,
//         last_name: req.body.last_name,
//         email : req.body.email
//       }
//       db.users.insert(newUser, (err, result) => { // Adds new users to database
//         if(err){ // check for error
//           console.log(err);
//         }
//         res.redirect('/'); // if no error, redirect back to homepage
//       });
//     };

// });

//DEAL WITH DELETE REQUEST(E.G. WHEN REMOVING A USER)
app.delete('/users/delete/:id', (req, res) => { //id is unique to user
  db.users.remove({ _id: mongojs.ObjectId(req.params.id) }, (err, result) => {
    // remove takes the id of user to be removed & a callback func as parameters.
    //the callback checks for error, logging any error. If none, page is redirected to the homepage
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });

});

app.listen(port, () => { // listener on port 3000, responds with a callback message
  console.log('server started on port 3000...');
});



/*
TODO:
* update to use Typescript
*/