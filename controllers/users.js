const { createUserAccount } = require('../services/user/createuser');

const createUser = params => {
  return new Promise((resolve, reject) => {
    const { name, email, mobile } = params;
    createUserAccount({ name, email, mobile })
      .then(user => resolve(user))
      .catch(error => reject(error));
  });
} 

module.exports = { createUser };
