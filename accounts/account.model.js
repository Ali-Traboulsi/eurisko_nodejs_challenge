/*
Define a Schema for the account collection on MongoDB database. The exported model object will be used to grant access to the account user to perform certain CRUD operations inside the controller.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    title: { type: String, required: true },
    firstName: { type: String, required, true },
    lastName: { type: String, required, true },
    acceptTerms: Boolean,
    role: { type: String, required: true },
    verificationToken: String,
    verified: Date,
    resetToken: {
        token: String,
        expires: Date,
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date
});

schema.virtual('isVerified').get(() => {
    return !!(this.verified || this.passwordReset)
})

// configure the settings by setting which properties are allowed to be converted to JSON objects
schema.json('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id; // delete id from json object
        delete ret.passwordHash; // delete hashed password from json object
    }
})

// export the model
module.exports = mongoose.model('Account', schema);