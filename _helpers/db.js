const config = require('config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGO_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    Account: require('accounts/account.model'),
    RefreshToken: require('accounts/refresh_token.model'),
    isValidId
};

// check if id is a valid Mongo ObjectId before attempting to run any query
const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}
