const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    restaurantBranch: {
        type: Schema.Types.ObjectId,
        ref: 'RestaurantBranch'
    },
    date: {
        type: Date,
        required: true,
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    status: {
        type: String,
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    isDelivered:{
        type: Boolean,
        required: true
    },
    shippingAddress: {
        type: String,
        coordinates: [Number],
        required: true
    }
})


module.exports = mongoose.model('Order', schema);