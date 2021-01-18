const passport = require('passport');
require('./strategies/local.strategies.js')();

module.exports = function passportConfig(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);

    });

    app.use(function (req, res, next) {
        res.locals.login = req.isAuthenticated();
        res.locals.session = req.session;
        res.locals.currentUser = req.user;

        next();
    });
    
}
