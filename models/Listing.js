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
    }
});

var Listing = mongoose.model('Listing', ListingSchema);

module.exports = Listing;
