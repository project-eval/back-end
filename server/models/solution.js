var mongoose = require('mongoose')

/**
 * @schema
 */
var SolutionSchema = mongoose.Schema({

	// breadstick id
	breadstick: {type: String, ref: 'BreadStick'},

	// user username
	user: {type: String, ref: 'User'},

	// solution
	solution: {type: Array, default: []}

})

/**
 * @model
 */
var Solution = mongoose.model('Solution', SolutionSchema)


module.exports = Solution