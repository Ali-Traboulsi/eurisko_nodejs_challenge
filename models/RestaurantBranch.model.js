const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    branchName: {type: String, required: true},
    location: {
        type: String,
        coordinates: [Number],
        required: true
    },
    phone: String,
});

module.exports = mongoose.model('RestaurantBranch', schema);