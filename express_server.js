const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080; //default

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

// D.O.
app.get('/', (req, res) => {
  // res.send('Hello!');
  res.render('pages/index');
});

// // add routes
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase } //interesting...
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
})

app.post('/urls', (req,res) => {
  // console.log(generateRandomString());
  // console.log(req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);
  res.send('ok');
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase }
  res.render('pages/urls_show', templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

