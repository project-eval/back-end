var mongoose = require('mongoose')

/**
 * @schema
 */
var BreadStickSchema = mongoose.Schema({

	// description = markup
	// tests = language specific tests
	challenges: [{
		description: {type: String},
		test: {type: String}
	}],

	name: 		{type: String},
	author: 	{type: String},
	tags:       [{type: String}],
	language: 	{type: String},
	difficulty: {type: Number},

	// number of 'likes'
	points:     {type: Number, default: 0},

	// 0 = draft
	// 1 = submittited for review
	// 2 = aproved
	// 3 = disaproved
	// 4 = removed by user
	// 9 = banned
	status:     {type: Number, default: 0},

    // users that have tried/completed
    users: 		[{type: String, ref: 'User'}],

    createdOn: 	{type: Date, default: Date.now}

})

/**
 * @model
 */
var Breadstick = mongoose.model('BreadStick', BreadStickSchema)


module.exports = Breadstick