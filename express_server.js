const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const findUserByEmail = require('./helpers');



const app = express();
const PORT = 8080; //default
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['random test']
}));

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
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

// For unique user & short link IDs
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const urlsForUser = function(id) {
  let userURLs = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = {};
      userURLs[url] = { longURL: urlDatabase[url].longURL, userID: urlDatabase[url].userID }
    }
  }

  return userURLs;
};

// D.O.
app.get('/', (req, res) => {
  return res.redirect('/urls');
});

// home page with list of links
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user, urls: urlsForUser(userID) }; 

  if(!user) {
    return res.redirect('/login');
  }

  return res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  if(!user) {
    return res.redirect('/login');
  }
  
  return res.render('pages/urls_new', templateVars);
});

// handler for when a new short url is generated
app.post('/urls', (req,res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if(!user) {
    return res.redirect('/login');
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = userID;
  console.log(urlDatabase);
  return res.redirect(`/urls/${shortURL}`);
});

// redirect to long url
app.get('/u/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  if (!urlDatabase[req.params.shortURL]) {
    console.log('Short url link not found!');
    return res.render('pages/urls_error_linkDNE', templateVars);
  }

  const regex = new RegExp('^http');
  const longURLRedirect = urlDatabase[req.params.shortURL].longURL;

  // Check if the longURL in the database starts with http://
  if (regex.test(longURLRedirect)) {
    return res.redirect(`${longURLRedirect}`);
  } else {
    return res.redirect(`http://${longURLRedirect}`);
  }
});

// view the details of a shortened link
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID);
  
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase
  };

  if (!URLsBelongingToUser[req.params.shortURL]) {
    return res.render('pages/urls_error_linkOwner', templateVars);
  }

  console.log(urlsForUser(userID));

  
  return res.render('pages/urls_show', templateVars);
});

// handler for when a long url is edited for a particular short url 
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID);

  const templateVars = {
    user: user,
  };

  if(!user || !URLsBelongingToUser) {
    return res.render('pages/urls_error_linkOwner', templateVars);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    console.log(urlDatabase);
    return res.redirect('/');
  }
});

// handler for deleting shortened url entry
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID);

  const templateVars = {
    user: user,
  };

  if(!user || !URLsBelongingToUser) {
    return res.render('pages/urls_error_linkOwner', templateVars);
  } else {
    const property = req.params.shortURL;
    delete urlDatabase[property];
    console.log(urlDatabase);
    return res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  let user = findUserByEmail(req.body.email, users);
  const formPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(formPassword, 10);


  if (!user) {
    return res.status(403).send('User with that e-mail address cannot be found!');
  } else if (user && bcrypt.compareSync(user.password, hashedPassword)) {
    return res.status(403).send('Password is incorrect.');
  } else {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }

});

app.post('/logout', (req, res) =>  {
  // res.clearCookie('user_id');
  delete req.session.user_id;
  return res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  if(user) {
    return res.redirect('/urls');
  }

  return res.render('pages/registration', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Email/password cannot be blank!')
  }
  
  const user = findUserByEmail(req.body.email, users);
  
  if (user) {
    return res.status(400).send('A with that email address already exitsts!')
  }

  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = { id: userID, email: req.body.email, password: hashedPassword };
  console.log(users);

  req.session.user_id = userID
  return res.redirect('/urls')
});

app.get('/login', (req, res) => {
  // const templateVars = { user: req.cookies['user_id'] }; replaced here & in /register bc of header glitch
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };


  if(user) {
    return res.redirect('/urls');
  }
  
  return res.render('pages/login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

