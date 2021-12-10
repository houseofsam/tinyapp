const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";

    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if given email that does not exist in user database', function() {
    const user = findUserByEmail("DNE@example.com", testUsers)
    const expected = undefined;

    assert.equal(user, expected);
  });
});