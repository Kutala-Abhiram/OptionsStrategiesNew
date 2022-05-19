const UserSettings = require('../../../models/usersettings');

const getUserSetting = id => {
  return new Promise((resolve, reject) => {
    UserSettings.findOne({ userId: id })
      .then(userSettings => resolve(userSettings))
      .catch(error => reject(error));
  });
}

module.exports =  getUserSetting;
