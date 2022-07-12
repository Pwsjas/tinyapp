const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//////////////////////////////////////////////////////////////////////
//GET//
//////////////////////////////////////////////////////////////////////

//View All tinyURLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});
//View New tinyURL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
  };
  res.render("urls_new", templateVars);
});
//View Specific tinyURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {};
  if (req.params.id[0] === ':') {
    templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id.slice(1)] };
  } else {  
    templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  }
  templateVars['username'] = req.cookies['username'];
  res.render("urls_show", templateVars);
});
//Go to specified tinyURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id.slice(1)];
  res.redirect(longURL);
});

//////////////////////////////////////////////////////////////////////
//POST//
//////////////////////////////////////////////////////////////////////

//Add new shortURL and longURL pair (with randomly generated short URL)
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString(req.body.longURL);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/:${shortUrl}`);
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
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

//Logout Cookie
app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie(Object.keys(req.body)[0]);
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let generatedString = '';
  let random = 0;

  for (let i = 0; i < 6; i++) {
    random = Math.ceil(Math.random() * 36);

    if (random <= 10) {
      generatedString += random;
    } else {
      generatedString += String.fromCharCode(random + 86);
    }
  }
  return generatedString;
}