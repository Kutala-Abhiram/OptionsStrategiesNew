const express = require('express');
const router = express.Router();
const User = require('../../controllers/users');

router.post('/', (req, res) => {
  User.createUser(req.body)
    .then(user => res.status(200).send(user))
    .catch(err => res.status(400).send(err));
});

module.exports = router;
