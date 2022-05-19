const getUserSetting = require("../services/db/usersettings/getusersetting")

const userSettings = params => {
  return new Promise((resolve, reject) => {
    getUserSetting(params.id)
      .then(userSettings => resolve(userSettings))
      .catch(error => reject(error));
  });
};

module.exports = {
  userSettings
};
