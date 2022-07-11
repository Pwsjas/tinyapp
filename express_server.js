const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

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

//new
//View All tinyURLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});
//Create New tinyURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//View Specific tinyURL
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id.slice(1)] };
  res.render("urls_show", templateVars);
});
//Go to specified tinyURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id.slice(1)];
  res.redirect(longURL);
});



app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString(req.body.longURL);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`urls/:${shortUrl}`);
});
//new


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