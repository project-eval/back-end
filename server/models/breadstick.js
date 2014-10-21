var mongoose = require('mongoose')

/**
 * @schema
 */
var BreadStickSchema = mongoose.Schema({

	// source should be a reference to somewhere else.
	source: 	{type: String},

	title: 		{type: String},
	author: 	{type: Number, ref: 'User'},
	language: 	{type: String},
	difficulty: {type: Number},
	points:     {type: Number, default: 0},

    // users that have tried/completed
    users: 		[{
    	id: {type: Number, ref: 'User'}, 
    	hasCompleted: {type: Boolean, default: false}
    }],

    createdOn: 	{type: Date, default: Date.now}

})

/**
 * @model
 */
var Breadstick = mongoose.model('BreadStick', BreadStickSchema)


module.exports = Breadstick