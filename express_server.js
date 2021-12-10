const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { findUserByEmail } = require("./helpers");

const app = express();
const PORT = 8080; //default
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cookieSession({
    name: "session",
    keys: ["test"],
  })
);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// For unique user & short link IDs
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const urlsForUser = function(id) {
  // append all matches to this object and return after full DB iteration
  let userURLs = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = {};
      userURLs[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID,
      };
    }
  }

  return userURLs;
};


app.get("/", (req, res) => {
  return res.redirect("/urls");
});

// home page with list of links
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user, urls: urlsForUser(userID) };

  if (!user) {
    return res.render("pages/urls_error_linkOwner", templateVars);
  }

  return res.render("pages/urls_index", templateVars);
});

// page to create new short link
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  if (!user) {
    return res.redirect("/login");
  }

  return res.render("pages/urls_new", templateVars);
});

// handler for when a new short url is generated
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect("/login");
  }

  // create shortURL unique ID and an object for it in DB
  // and include the relavant data within the object
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = userID;

  return res.redirect(`/urls/${shortURL}`);
});

// redirect to long url
app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user: user };

  // short link does not exist
  if (!urlDatabase[req.params.shortURL]) {
    return res.render("pages/urls_error_linkDNE", templateVars);
  }

  // The user can create a short link with http:// prefixed or not
  // The code below is to accomodate this and to avoid errors upon redirecting
  const regex = new RegExp("^http");
  const longURLRedirect = urlDatabase[req.params.shortURL].longURL;

  // Check if the longURL in the database starts with http://
  if (regex.test(longURLRedirect)) {
    return res.redirect(`${longURLRedirect}`);
  } else {
    return res.redirect(`http://${longURLRedirect}`);
  }
});

// view the details of a shortened link
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID);

  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
  };

  if (!URLsBelongingToUser[req.params.shortURL]) {
    return res.render("pages/urls_error_linkOwner", templateVars);
  }

  return res.render("pages/urls_show", templateVars);
});

// handler for when a long url is edited for a particular short url
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID);

  const templateVars = { user };

  // if there is no one logged in or if URL does not belong to user, redirect
  if (!user || !URLsBelongingToUser) {
    return res.render("pages/urls_error_linkOwner", templateVars);
  } else {
    // modify DB
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;

    return res.redirect("/");
  }
});

// handler for deleting shortened url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const URLsBelongingToUser = urlsForUser(userID);

  const templateVars = { user };

  // if there is no one logged in or if URL does not belong to user, redirect to error page
  if (!user || !URLsBelongingToUser) {
    return res.render("pages/urls_error_linkOwner", templateVars);
  } else {
    const property = req.params.shortURL;
    delete urlDatabase[property];

    return res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email, users);
  const formPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(formPassword, 10);

  const templateVars = { user };

  // if user tries logging in with an invalid email and/or password
  if (!user) {
    return res.status(403).render("pages/user_error_login", templateVars);
  } else if (user && bcrypt.compareSync(user.password, hashedPassword)) {
    return res.status(403).render("pages/user_error_login", templateVars);
  } else {
    // If user enters correct credentials, sign them in and redirect
    // Followed compass instructions therefore user_id not in camelCase
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  // redirect if user is already logged in.
  if (user) {
    return res.redirect("/urls");
  }

  return res.render("pages/registration", templateVars);
});

app.post("/register", (req, res) => {
  // if user leaves email/password field blank. Although HTML form protects against this too.
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email/password cannot be blank!");
  }

  const user = findUserByEmail(req.body.email, users);
  const templateVars = { user };

  // If user tries to register with an email that already exists in DB
  if (user) {
    return res
      .status(400)
      .render("pages/user_error_registration", templateVars);
  }

  // Create user and add to DB if the conditions above are not met
  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };

  // Followed compass instructions therefore user_id not in camelCase
  req.session.user_id = userID;
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  // const templateVars = { user: req.cookies['user_id'] }; replaced here & in /register bc of header glitch
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (user) {
    return res.redirect("/urls");
  }

  return res.render("pages/login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
