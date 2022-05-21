const { createUserAccount } = require('../services/db/user/createuser');
const { listUsers } = require('../services/db/user/listusers');

const createUser = params => {
  return new Promise((resolve, reject) => {
    const { name, email, mobile } = params;
    createUserAccount({ name, email, mobile })
      .then(user => resolve(user))
      .catch(error => reject(error));
  });
};

const allUsers = () => {
  return new Promise((resolve, reject) => {
    listUsers()
      .then(users => resolve(users))
      .catch(error => reject(error));
  });
};

module.exports = { createUser, allUsers };
