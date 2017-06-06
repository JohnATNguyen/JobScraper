var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ListingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }
});

var Listing = mongoose.model('Article', ListingSchema);

module.exports = Listing;
