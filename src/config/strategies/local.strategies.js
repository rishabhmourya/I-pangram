const passport = require('passport');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
 
module.exports = function localStrategy() {

    passport.use(new Strategy(
        {
            usernameField: 'email',

            passwordField: 'password'

        }, (email, password, done) => {


            (async function mongo() {
                const dbName = 'evaluation';
                let client;
                try {

                    client = await MongoClient.connect('mongodb+srv://fk:fk1234@cluster0.idqbi.mongodb.net/fk?retryWrites=true&w=majority', {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    });
                    const db = client.db(dbName);
                    const col = db.collection('users');
                    const user = await col.findOne({
                        email
                    });
                    if (!user) {
                        return done(null, false, { message: 'user not exist' });
                    }
            
                    await bcrypt.compare(password, user.password, (err, match) => {
                        if (err) {
                            return done(null, false);
                        }
                        if (!match) {
                            return done(null, false,{message: "Password dosen\'t match "});
                        }
                        if (match) {
                            return done(null, user);
                        }
                    });
            
                } catch (error) {

                    console.log(error);
                }
                client.close();
            }());
            
        }
    ));
    
}

