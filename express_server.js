const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, urlForUser, getUserByEmail } = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['wannwaoniu9r239278r391r13b9fubf9b3f3fb', 'n3ir13fn389fn3fn3f93f8e7f93n3n3791fb378fb38fb318f8', '482h40821nr20nf3fn34f9n489g24n0g4ng1b4gb580gbn'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//////////////////////////////////////////////////////////////////////
//DATA VARIABLES//
//////////////////////////////////////////////////////////////////////


//Contains default examples
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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//////////////////////////////////////////////////////////////////////
//GET ROUTES//
//////////////////////////////////////////////////////////////////////

//Redirects logged in users to /urls
//Redirects unknown users to /login
app.get("/", (req, res) => {
  if (req.session.user_id)  {
    return res.redirect('/urls');
  } else {
    return res.redirect('/login');
  }
});

//Displays the main urls page, contianing urls created by the current user
app.get("/urls", (req, res) => {
  const userURLs = urlForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    user: users[req.session.user_id],
    urls: userURLs
  };
  return res.render('urls_index', templateVars);
});

//Displays the shortURL creation page, containing a form and button for creating shortURLs
//Redirects to /login if user is unknown
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect('/login');
  }
});

//Displays a specific shortURL's page
//Includes an Edit form to change the associated longURL
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    if (!urlDatabase[req.params.id] || urlDatabase[req.params.id].userID !== req.session.user_id) {
      return res.status(403).send('403 Error: Cannot view URLs created by other users!');
    }
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session.user_id]
    };
    return res.render("urls_show", templateVars);
  } else {
    return res.status(403).send('403 Error: You are not logged in!');
  }
});

//Redirects the user to the associated longURL (to a different website)
app.get("/u/:id", (req, res) => {
  let longURL;
  if (urlDatabase[req.params.id]) {
    longURL = urlDatabase[req.params.id].longURL;
  }
  if (longURL) {
    return res.redirect(longURL);
  }
  return res.status(400).send('400 Error: shortURL does not exist!');
});

//Displays the registration page, including email and password input fields
//Redirects to /urls if the user is already logged in
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  return res.render('register', templateVars);
});

//Displays the login page, including email and password input fields
//Redirects to /urls if the user is already logged in
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  return res.render('login', templateVars);
});

//////////////////////////////////////////////////////////////////////
//POST ROUTES//
//////////////////////////////////////////////////////////////////////

//Add new shortURL and longURL pair (with randomly generated short URL)
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    return res.redirect(`/urls/${shortUrl}`);
  }
  return res.status(403).send('403 Error: You cannot create shortURLS unless you are logged in!');
});

//Delete specified shortURL and longURL pair from database
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.body.id]) {
    return res.status(400).send('400 Error: shortURL does not exist!');
  }
  if (!req.session.user_id) {
    return res.status(403).send('403 Error: Must be logged in to delete!');
  }
  if (urlDatabase[req.body.id].userID !== req.session.user_id) {
    return res.status(403).send('403 Error: Cannot delete other users shortURLs!');
  }
  const deleteURL = req.body.id;
  delete urlDatabase[deleteURL];
  return res.redirect('/urls');
});

//Change the corresponding longURL of specified shortURL
app.post("/urls/:id", (req, res) => {
  console.log(req.body.id);
  console.log(urlDatabase[req.body.id]);
  if (!urlDatabase[req.body.id]) {
    return res.status(400).send('400 Error: shortURL does not exist!');
  }
  if (!req.session.user_id) {
    return res.status(403).send('403 Error: Must be logged in to edit!');
  }
  if (urlDatabase[req.body.id].userID !== req.session.user_id) {
    return res.status(403).send('403 Error: Cannot edit other users shortURLs!');
  }
  const { id, newURL } = req.body;
  urlDatabase[id].longURL = newURL;
  return res.redirect(`/urls`);
});

//Log in user, and create associated cookie
app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);
  if (userID) {
    if (users[userID].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[userID].password)) {
        req.session.user_id = userID;
      }
    }
  } else {
    return res.status(403).send('403 Error: Invalid Email or Password!');
  }
  return res.redirect(`/urls`);
});

//Log out user and delete associated cookie
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect(`/urls`);
});

//Register a new user, storing their data within the database, also logs user in.
//Redirects to /urls
app.post("/register", (req, res) => {
  if (req.body.email === '') {
    return res.status(400).send('400 Error: please enter an email address!');
  }
  if (req.body.password === '') {
    return res.status(400).send('400 Error: please enter a password!');
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send('400 Error: email address already in use!');
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString(6);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = userID;
  return res.redirect(`/urls`);
});

//Tell server to listen for messages on specified port
app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});
