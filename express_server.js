const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
     id: "user2RandomID", 
     email: "user2@example.com", 
     password: "dishwasher-funk"
   }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const findUserByEmail = function(email) {
  for (let userID in users) {
    const user = users[userID]
    if (user.email === email) {
      return user;
    }
  }
};

// D.O.
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase }; //interesting...
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('pages/urls_new', templateVars);
});

app.post('/urls', (req,res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  const regex = new RegExp('^http://');
  const longURLRedirect = urlDatabase[req.params.shortURL];

  // Check if the longURL in the database starts with http://
  if (regex.test(longURLRedirect)) {
    res.redirect(`${longURLRedirect}`);
  } else if (!urlDatabase[req.params.shortURL]) {
    console.log('Short url link not found! Redirecting to home page!');
    // res.send('page not found');
    res.redirect('/');
  } else {
    res.redirect(`http://${longURLRedirect}`);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase };
  res.render('pages/urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const property = req.params.shorURL;
  delete urlDatabase[property];
  console.log(urlDatabase);
  res.redirect('/');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) =>  {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { user: req.cookies['user_id'] };
  res.render('pages/registration', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Email/password cannot be blank!')
  }
  
  const user = findUserByEmail(req.body.email);
  
  if (user) {
    res.status(400).send('A with that email address already exitsts!')
  }

  const userID = generateRandomString();
  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
  res.cookie('user_id', userID);
console.log(users);
  res.redirect('/urls')
});

app.get('/login', (req, res) => {
  const templateVars = { user: req.cookies['user_id'] };
  res.render('pages/login', templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

