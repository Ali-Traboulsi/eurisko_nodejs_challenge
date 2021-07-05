const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    label: {
        type: String,
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true
    },
    description: {
        type: String,
    }
});


module.exports = mongoose.model('Address', AddressSchema);
