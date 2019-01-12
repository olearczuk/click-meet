require('rootpath')();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const redis = require('redis');
const client = redis.createClient({
  host: 'redis',
  port: 6379,
});

const errorHandler = require('./helpers/error-handler');
const config = require('config.json');

const app = express();
app.use(cors({origin: [
        "http://0.0.0.0:2137",
        "http://localhost:4200"
    ], credentials: true}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || config.sessionSecret,
  store: new RedisStore({client: client, ttl: 600}),
  // saveUninitialized: true,
  // resave: true,
}));

app.use('/', require('./availability/availability.controller'));

app.use(errorHandler);

const port = process.env.PORT || 9010;

app.listen(port, function(){
  console.log('Listening on port ' + port);
})