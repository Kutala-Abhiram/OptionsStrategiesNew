const express = require('express');
const router = express.Router();
const User = require('../../controllers/users');
const UserSettings = require('../../controllers/usersettings');

router.post('/', (req, res) => {
  User.createUser(req.body)
    .then(user => res.status(200).send(user))
    .catch(err => res.status(400).send(err));
});

router.get('/:id/user-settings', (req, res) => {
  UserSettings.userSettings(req.params)
    .then(userSettings => res.status(200).send(userSettings))
    .catch(err => res.status(400).send(err));
});

module.exports = router;
