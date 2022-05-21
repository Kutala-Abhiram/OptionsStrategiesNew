const User = require('../../../models/schema/user');

const listUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({})
      .then(users => resolve(users))
      .catch(error => reject(error));
  });
};

module.exports = { listUsers };
