const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'RestaurantBranch'
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    status: {
        type: String,
        default: 'pending'
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    isAccepted: {
        type: Boolean,
        required: true,
        default: true,
    }
});


module.exports = mongoose.model('Order', schema);