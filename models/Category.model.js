const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, required: true},
    catImage: {type: String, required: true},
});

// schema.methods.toJSON = function () {
//     const result = this.toObject();
//     delete result.catImage;
//     return result
// };

module.exports = mongoose.model('Category', schema);
