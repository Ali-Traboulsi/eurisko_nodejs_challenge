const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    type: {
        type: String,
        default: 'Point'
    },
    coordinates:{
        type: [Number],
        required: true
    },
})

const BranchSchema = new Schema({
    branchName: {type: String, required: true},
    location: {
      type: LocationSchema,
      required: true
    },
});

const Location = mongoose.model('Location', LocationSchema);
const branch = mongoose.model('Branch', BranchSchema)

module.exports = {
    Location: Location,
    Branch: branch
};
