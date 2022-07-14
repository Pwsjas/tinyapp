const express = require("express");
const cookieSession = require('cookie-session')
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
}))


//////////////////////////////////////////////////////////////////////
//DATA VARIABLES//
//////////////////////////////////////////////////////////////////////


//Contain default examples
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
//GET//
//////////////////////////////////////////////////////////////////////

//View All tinyURLs
app.get("/urls", (req, res) => {
  const userURLs = urlForUser(req.session.user_id, urlDatabase);
  const templateVars = { 
    user: users[req.session.user_id],
    urls: userURLs
  };
  res.render('urls_index', templateVars);
});
//View New tinyURL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { 
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  } 
});
//View Specific tinyURL
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    if (!urlDatabase[req.params.id] || urlDatabase[req.params.id].userID !== req.session.user_id) {
      return res.status(403).send('403 Error: Cannot view URLs created by other users!');
    }
    let templateVars = {};
    if (req.params.id[0] === ':') {
      templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id.slice(1)].longURL };
    } else {  
      templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
    }
    templateVars['user'] = users[req.session.user_id];
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('403 Error: You are not logged in!');
  }
});
//Go to specified tinyURL
app.get("/u/:id", (req, res) => {
  let longURL;
  if (urlDatabase[req.params.id]) {
    longURL = urlDatabase[req.params.id].longURL;
  }
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(400).send('400 Error: shortURL does not exist!');
  }
});

//Go to register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users[req.session.user_id],
      urls: urlDatabase 
    };
    res.render('register', templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users[req.session.user_id],
      urls: urlDatabase 
    };
    res.render('login', templateVars);
  }
});

//////////////////////////////////////////////////////////////////////
//POST//
//////////////////////////////////////////////////////////////////////

//Add new shortURL and longURL pair (with randomly generated short URL)
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    res.redirect(`/urls`);
  } else {
    res.status(403).send('403 Error: You cannot create shortURLS unless you are logged in!');
  }
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
  res.redirect('/urls')
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
  res.redirect(`/urls`);
});

//Login Cookie
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
  res.redirect(`/urls`);
});

//Logout Cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//Register User
app.post("/register", (req, res) => {
  if (req.body.email === '') {
    res.status(400).send('400 Error: please enter an email address!');
  } else if(req.body.password === '') {
    res.status(400).send('400 Error: please enter a password!');
  } else if(getUserByEmail(req.body.email, users)) {
    res.status(400).send('400 Error: email address already in use!');
  } else {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userID = generateRandomString(6);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = userID;
    res.redirect(`/urls`);
  }
});


app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});
