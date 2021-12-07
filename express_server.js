const express = require('express');
const app = express();
const PORT = 8080; //default

app.set('view engine', 'ejs');

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

// D.O.
app.get('/', (req, res) => {
  // res.send('Hello!');
  res.render('pages/index');
});

// D.O.
app.get('/about', (req, res) => {
  const mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  const tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('pages/about', {
    mascots: mascots,
    tagline: tagline
  });
})

// add routes
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get('/urls', (req, res) => {
   const templateVars = { urls: urlDatabase } //interesting...
   res.render('pages/urls_index', templateVars);
 })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

