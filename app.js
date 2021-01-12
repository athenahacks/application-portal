// Load the dotfiles.
require('dotenv').load({silent: true});
// console.log('dotfiles loaded');
var express         = require('express');

// Middleware!
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var morgan          = require('morgan');

var mongoose        = require('mongoose');
var port            = process.env.PORT || 3000;
// var database        = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";
var database        = process.env.MONGO_CONNECTION || "mongodb://localhost:27017";

var settingsConfig  = require('./config/settings');
var adminConfig     = require('./config/admin');

var app             = express();
// console.log("about to connect to mongo")
// Connect to mongodb
// mongoose.connect(database, {useMongoClient: true});
mongoose.connect(database, { useNewUrlParser: true });

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(methodOverride());

app.use(express.static(__dirname + '/app/client'));

// Routers =====================================================================
// console.log("about to do routers")
var apiRouter = express.Router();
require('./app/server/routes/api')(apiRouter);
app.use('/api', apiRouter);

var authRouter = express.Router();
require('./app/server/routes/auth')(authRouter);
app.use('/auth', authRouter);

require('./app/server/routes')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

