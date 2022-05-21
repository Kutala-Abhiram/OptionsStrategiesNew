const express = require('express');
const router = express.Router({ mergeParams: true });
const Strategy = require('../../controllers/strategies');

router.post('/', (req, res) => {
  Strategy.createStrategy(req)
    .then(strategy => res.status(200).send(strategy))
    .catch(err => res.status(400).send(err));
});

module.exports = router;
