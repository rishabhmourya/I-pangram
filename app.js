const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

var MongoDBStore = require('connect-mongodb-session')(session);
const { MongoClient, ObjectId } = require('mongodb');
const dbName = 'evaluation';
const sessionDb = 'evaluation_session';


let app = express();
let storee = (async function mongo() {
  let client;
  try {

    app.dbClient = await MongoClient.connect('mongodb+srv://fk:fk1234@cluster0.idqbi.mongodb.net/fk?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected successfully to the db server');
    app.db =  app.dbClient.db(dbName);
    app.delDb =  app.dbClient.db(sessionDb);

    app.sessions =  app.db.collection('mySessions');
    app.users =  app.db.collection('users');
    app.posts =  app.db.collection('posts');
    
    
  } catch (error) {
    console.log(`error on making connection with the ddb :- ${error} `);
  }

}());


var store = new MongoDBStore({
  uri: 'mongodb+srv://fk:fk1234@cluster0.idqbi.mongodb.net/fk?retryWrites=true&w=majority',
  collection: 'evaluation_session'
});

store.on('error', function (error) {
  console.log(error);
});



app.use(require('express-session')({
  secret: 'hello world sjidnasdnkjnwdds',
  cookie: {
    maxAge: 60 * 60000 // 60 min
  },
  store: store,

  resave: true,
  saveUninitialized: true
}));






app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
  next();
});



app.use(express.static(path.join(__dirname, '/public/')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



require('./src/config/passport.js')(app);
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './src/views/');
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));


app.get('*', (req, res, next) => {

  res.locals.cart = req.session.cart;
  res.locals.subscription = req.session.subscription;
  next();
});

const frontRouter = require('./src/routes/frontRoutes')();
const authRouter = require('./src/routes/authRoutes')();


app.use('/', frontRouter);
app.use('/auth', authRouter);
// app.get('/session', function (req, res) {
//   res.send('Hello ' + JSON.stringify(req.session));
// });

app.listen(80, function () {
  console.log('App has been started');
})
