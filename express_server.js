const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//////////////////////////////////////////////////////////////////////
//DATA VARIABLES//
//////////////////////////////////////////////////////////////////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
//FUNCTIONS//
//////////////////////////////////////////////////////////////////////

const generateRandomString = (length) => {
  let generatedString = '';
  let random = 0;

  for (let i = 0; i < length; i++) {
    random = Math.ceil(Math.random() * 36);

    if (random <= 10) {
      generatedString += random;
    } else {
      generatedString += String.fromCharCode(random + 86);
    }
  }
  return generatedString;
};

const checkDuplicateEmail = (email) => {
  for (let user in users) {
    if(email === users[user].email) {
      return users[user].id;
    }
  }
  return null;
}; 

//////////////////////////////////////////////////////////////////////
//GET//
//////////////////////////////////////////////////////////////////////

//View All tinyURLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies['user_id']],
    urls: urlDatabase 
  };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});
//View New tinyURL
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = { 
      user: users[req.cookies['user_id']],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  } 
});
//View Specific tinyURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {};
  if (req.params.id[0] === ':') {
    templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id.slice(1)] };
  } else {  
    templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  }
  templateVars['user'] = users[req.cookies['user_id']];
  res.render("urls_show", templateVars);
});
//Go to specified tinyURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(400).send('400 Error: shortURL does not exist!');
  }
});

//Go to register page
app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users[req.cookies['user_id']],
      urls: urlDatabase 
    };
    res.render('register', templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users[req.cookies['user_id']],
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
  if (req.cookies['user_id']) {
    console.log(req.body); // Log the POST request body to the console
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send('403 Error: You cannot create shortURLS unless you are logged in!');
  }
});

//Delete specified shortURL and longURL pair from database
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const deleteURL = req.body.id;
  console.log(req.body.id);
  delete urlDatabase[deleteURL];
  res.redirect('/urls')
});

//Change the corresponding longURL of specified shortURL
app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const updateURL = Object.keys(req.body)[0];
  console.log(updateURL);
  urlDatabase[updateURL] = req.body[updateURL];
  res.redirect(`/urls/:${updateURL}`);
});

//Login Cookie
app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const userID = checkDuplicateEmail(req.body.email);
   if (userID) {
     if (users[userID].email === req.body.email) {
       if (users[userID].password === req.body.password) {
        res.cookie('user_id', userID);
       }
    }
  } else {
    res.status(403).send('403 Error: Invalid Email or Password!');
  }
  res.redirect(`/urls`);
});

//Logout Cookie
app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

//Register User
app.post("/register", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (req.body.email === '') {
    res.status(400).send('400 Error: please enter an email address!');
  } else if(req.body.password === '') {
    res.status(400).send('400 Error: please enter a password!');
  } else if(checkDuplicateEmail(req.body.email)) {
    res.status(400).send('400 Error: email address already in use!');
  } else {
    const userID = generateRandomString(10);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
