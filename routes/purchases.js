var express = require('express');
var router  = express.Router();

router.get('/auto-create', isLoggedIn, function (req, res) {
	var buyurl = req.query.buyurl || '';
	res.render('orders/auto-create', { buyurl : buyurl });
});






function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('message', 'Please login first');
	res.redirect('/');
}



module.exports = router;