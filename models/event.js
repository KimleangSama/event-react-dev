const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        required: true,
        type: String
    },
    description: {
        required: true,
        type: String
    },
    price: {
        required: true,
        type: Number
    },
    date: {
        required: true,
        type: Date
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('Event', eventSchema);
