//Returns a random string of numbers and letters of a specified length
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

//Returns an object of shortURLs and their respective longURL based on the passed creator ID
//Mimics the layout of the database object within express_server.js
const urlForUser = (id, database) => {
  const output = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      output[shortURL] = {
        longURL: database[shortURL].longURL,
        userID: database[shortURL].userID
      }
    }
  }
  return output;
};

//Returns a user ID given that a passed email, is within the passed database (the email's associated user ID)
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

module.exports = {
  generateRandomString,
  urlForUser,
  getUserByEmail
};