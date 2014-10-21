var mongoose = require('mongoose')

var BreadStickSchema = mongoose.Schema({

	source: String,
    language: String,
    users: [{id: String, hasCompleted: Boolean}],

    difficulty: Number,
    likes: Number
})

var Breadstick = mongoose.model('BreadStick', BreadStickSchema)

module.exports = Breadstick