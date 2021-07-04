const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String, text: true, required: true},
    itemImage: {type: String, required: true},
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }
});

module.exports = mongoose.model('Item', schema);