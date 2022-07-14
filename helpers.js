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
}