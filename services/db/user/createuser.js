const User = require('../../../models/user');
const UserSettings = require('../../../models/usersettings');
const mongoose = require('mongoose');

const createUserAccount = params => {
  return new Promise((resolve, reject) => {
    const user = new User(params);
    mongoose.startSession()
      .then(session => {
        session.startTransaction();
        user.save({ session })
          .then(user => {
          const userSettings = new UserSettings({ userId: user._id });
            userSettings.save({ session })
              .then(userSettings => {
                session.commitTransaction();
                resolve(user);
              })
              .catch(error => {
                session.abortTransaction();
                reject(error);
              });
          })
          .catch(error => {
            session.abortTransaction();
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = { createUserAccount };
