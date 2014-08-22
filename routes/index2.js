var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('home/index2', { title: 'Express', message: req.flash('message') });
});

module.exports = router;
