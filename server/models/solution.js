var mongoose = require('mongoose')

/**
 * @schema
 */
var SolutionSchema = mongoose.Schema({

	// breadstick id
	breadstick: {type: String, ref: 'BreadStick'},

	// user id
	user: {type: String},

	// solution
	solution: [{type: String, default: ''}]

})

/**
 * @model
 */
var Solution = mongoose.model('Solution', SolutionSchema)


module.exports = Solution