const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

// D.O.
app.get('/', (req, res) => {
  // res.send('Hello!');
  // res.render('pages/index');
  res.redirect('/urls');
});

// // add routes
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase }; //interesting...
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
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
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase };
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
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('pages/registration', templateVars);
});

app.post('/register', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('pages/registration', templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

