//to find a match during registration & login
const findUserByEmail = function(email, database) {
  for (let property in database) {
    const user = database[property];
    if (user.email === email) {
      console.log(user.email);
      return user;
    }
  }
};

module.exports = { findUserByEmail };