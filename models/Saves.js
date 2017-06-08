var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SavesSchema = new Schema({
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

var Saves = mongoose.model('Saves', SavesSchema);

module.exports = Saves;
