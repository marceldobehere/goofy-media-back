var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // redirect to https://marceldobehere.github.io/goofy-media-front/
    res.redirect('https://marceldobehere.github.io/goofy-media-front/');
});

module.exports = router;
