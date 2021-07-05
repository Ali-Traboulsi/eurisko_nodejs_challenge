const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});

// sets the virtual property isExpired to true if the date is greated then the expires date property in the model. else, it set the property to false
schema.virtual('isExpired').get(() => {
    return Date.now() >= this.expires;
})

// sets isActive to true if the token is neither revoked or has expired. else, it is false
schema.virtual('isActive').get(() => {
    return !this.revoked && !this.isExpired;
})

module.exports = mongoose.model('RefreshToken', schema);
