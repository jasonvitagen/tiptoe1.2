// Dependencies
var express = require('express');
var router  = express.Router();

module.exports = function (passport) {

	// Local Login
	router.get('/local-login', function (req, res) {
		res.render('auth/local-login', { title: 'Local Login', message: req.flash('message') });
	});

	router.post('/local-login', passport.authenticate('local-login', {
		successRedirect : '/auth/profile',
		failureRedirect : '/auth/local-login',
		failureFlash    : true
	}));

	// Local Signup
	router.get('/local-signup', function (req, res) {
		res.render('auth/local-signup', { title: 'Local Signup', message: req.flash('message') });
	});

	router.post('/local-signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/auth/local-signup',
		failureFlash    : true
	}));

	// Local Connect
	router.get('/connect/local', function (req, res) {
		res.render('auth/local-connect', { title: 'Local Connect', message: req.flash('message') });
	});

	router.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/auth/profile',
		failureRedirect : '/',
		failureFlash    : true
	}));


	// Facebook Login
	router.get('/facebook-login', passport.authenticate('facebook', {
		scope: 'email'
	}));

	// Facebook Callback
	router.get('/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/auth/profile',
		failureRedirect: '/'
	}));

	// Facebook Connect
	router.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

	// Facebook Connect Callback
	router.get('/connect/facebook/callback', passport.authorize('facebook', {
		successRedirect: '/auth/profile',
		failureRedirect: '/'
	}));

	// Google Login
	router.get('/google-login', passport.authenticate('google', {
		scope: ['email', 'profile']
	}));

	// Google Callback
	router.get('/google/callback', passport.authenticate('google', {
		successRedirect: '/auth/profile',
		failureRedirect: '/'
	}));

	// Google Connect
	router.get('/connect/google', passport.authorize('google', { scope: ['email', 'profile']}));

	// Google Connect Callback
	router.get('/connect/google/callback', passport.authorize('google', {
		successRedirect: '/auth/profile',
		failureRedirect: '/'
	}));

	// UNLINK ACCOUNTS
	//----------------------------------------------------------------------------

	// Local
	router.get('/unconnect/local', function (req, res) {
		var user = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function (err) {
			res.redirect('/auth/profile');
		});
	});

	// Facebook
	router.get('/unconnect/facebook', function (req, res) {
		var user = req.user;
		user.facebook.token = undefined;
		user.save(function (err) {
			res.redirect('/auth/profile');
		});
	});

	// Google
	router.get('/unconnect/google', function (req, res) {
		var user = req.user;
		user.google.token = undefined;
		user.save(function (err) {
			res.redirect('/auth/profile');
		});
	});


	// Profile
	router.get('/profile', isLoggedIn, function (req, res) {
		res.render('auth/profile', { title: 'Profile', user: req.user });
	});

	// Logout
	router.get('/logout', function (req, res) {
		req.logout();
		req.flash('message', 'You have been logged out');
		res.redirect('/');
	});

	// Route middleware to make sure user is logged in
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash('message', 'Please login first');
		res.redirect('/');
	}

	return router;
}