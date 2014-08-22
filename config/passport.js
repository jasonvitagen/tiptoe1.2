// Dependencies
var LocalStrategy    = require('passport-local').Strategy; // local strategy
var FacebookStrategy = require('passport-facebook').Strategy; // facebook strategy
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy; // google strategy

// User Model
var User = require('../models/User.js');

// Load Auth Configuration
var authConfiguration = require('./auth.js');

module.exports = function (passport) {

	// Serialize
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	// Deserialize
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	// Configure Local Login
	passport.use('local-login', new LocalStrategy({
		usernameField     : 'email',
		passwordField     : 'password',
		passReqToCallback : true
	},
	function (req, email, password, done) {
		User.findOne({ 'local.email': email }, function (err, user) {

			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, req.flash('message', 'No user found'));
			}

			if (!user.validPassword(password)) {
				return done(null, false, req.flash('message', 'Oops! Wrong password'));
			}

			return done(null, user, req.flash('message', 'You have successfully login'));

		});
	}));

	// Configure Local Signup
	passport.use('local-signup', new LocalStrategy({
		usernameField     : 'email',
		passwordField     : 'password',
		passReqToCallback : true
	},
	function (req, email, password, done) {
		process.nextTick(function () {

			if (!req.user) {

				User.findOne({ 'local.email': email }, function (err, user) {
					if (err) {
						return done(err);
					}

					if (user) {
						return done(null, false, req.flash('message', 'That email is already taken'));
					} else {
						var newUser = new User();
						
						newUser.local.email    = email;
						newUser.local.password = newUser.hashPassword(password);

						newUser.save(function (err) {
							if (err) {
								throw err;
							}
							return done(null, newUser, req.flash('message', 'You have successfully signed up an account'));
						});
					}
				});
				
			} else {

				var user = req.user;

				user.local.email = email;
				user.local.password = User.hashPassword(password);

				user.save(function (err) {
					if (err) {
						throw err;
					}
					done(null, user);
				});

			}


		});
	}));

	// Configure Facebook Login
	passport.use('facebook', new FacebookStrategy({
		clientID     : authConfiguration.facebookAuth.clientID,
		clientSecret : authConfiguration.facebookAuth.clientSecret,
		callbackURL  : authConfiguration.facebookAuth.callbackURL,
		passReqToCallback : true
	},
	function (req, token, refreshToken, profile, done) {
		process.nextTick(function () {

			// If User Is Not Logged In
			if (!req.user) {

				User.findOne({ 'facebook.id': profile.id }, function (err, user) {
					if (err) {
						return done(err);
					}

					if (user) {
						return done(null, user);
					} else {
						var newUser = new User();
						
						newUser.facebook.id    = profile.id;
						newUser.facebook.token = token;
						newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
						console.log(profile.emails);
						newUser.facebook.email = profile.emails && profile.emails.length > 0 && profile.emails[0].value;

						newUser.save(function (err) {
							if (err) {
								throw err;
							}
							return done(null, newUser);
						});
					}
				});

			} else { // If User Is Logged In

				var user = req.user;

				user.facebook.id    = profile.id;
				user.facebook.token = token;
				user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
				user.facebook.email = profile.emails && profile.emails.length > 0 && profile.emails[0].value;

				user.save(function (err) {
					if (err) {
						throw err;
					}
					return done(null, user);
				});

			}


		});
	})); 

	// Configure Google Login
	passport.use('google', new GoogleStrategy({
		clientID: authConfiguration.googleAuth.clientID,
		clientSecret: authConfiguration.googleAuth.clientSecret,
		callbackURL: authConfiguration.googleAuth.callbackURL,
		passReqToCallback: true
	},
	function (req, token, refreshToken, profile, done) {
		process.nextTick(function () {

			if (!req.user) {

				User.findOne({ 'google.id': profile.id }, function (err, user) {
					if (err) {
						return done(err);
					}

					if (user) {
						return done(null, user);
					} else {
						var newUser = new User();

						newUser.google.id    = profile.id;
						newUser.google.token = token;
						newUser.google.name  = profile.displayName;
						newUser.google.email = profile.emails[0].value;

						newUser.save(function (err) {
							if (err) {
								throw err;
							}
							return done(null, newUser);
						});
					}

				});

			} else {

				var user = req.user;

				user.google.id    = profile.id;
				user.google.token = token;
				user.google.name  = profile.displayName;
				user.google.email = profile.emails[0].value;

				user.save(function (err) {
					if (err) {
						throw err;
					}
					done(null, user);
				});

			}

		});
	}));

}