const dotenv = require('dotenv').config({path: __dirname + '/.env'});

// This simplifies writing navigating through project file directories especially in a deep tree structure
require('rootpath')();

const exrpess = require('express');
const app = exrpess();
const cors = require('cors');
const bodyparser = require('body-parser');
const errorhandler = require('_middleware/error_handler');
const cookieParser = require('cookie-parser');

/*
A little note about body parser:
app.use(bodyparser.json()) looks at req where Content-Type: application/json is set in header and transforms the text-based json input into JS-accessible variables under req.body.

app.use(bodyparser.urlencoded({ extended: false})) does the same but for url encoded requests

 */

// extended: false --> value of key:value pair in ppulated object is string or array only
// if set to true --> value can be of any type
app.use(bodyparser.urlencoded({ extended: false}))
app.use(bodyparser.json());
app.use(cookieParser());

// in order for the server to be accessed by other origins
app.use(cors());

// api routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/cat', require('./controllers/category.controller'));
app.use('/item', require('./controllers/item.controller'));

// global error handler
app.use(errorhandler);

// start the server
const port = process.env.PORT === 'production' ? 5000 : 4000;
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
