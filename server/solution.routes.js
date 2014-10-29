var _ = require('lodash')
var Solution = require('./models/solution')
var coderunner = require('./coderunner')
var Joi = require('joi')

module.exports = function (server) {

	/*
	 * @route
	 * query db for solutions
	 */
	server.route({
		method: 'GET',
		path: '/api/solutions',
		config: {
			validate: {
				query: {
					skip: Joi.number().min(0).default(0),
					limit: Joi.number().min(1).max(100).default(50),
					user: Joi.string(),
					breadstick: Joi.string(),
					sort: Joi.string()
				}
			}
		},
		handler: function (request, reply) {

			var query = request.query
			var dbquery = Solution.find()

			if(query.user) dbquery.where('user').equals(query.user)
			if(query.breadstick) dbquery.where('breadstick').equals(query.breadstick)
			if(query.sort) dbquery.sort(query.sort)

			dbquery.skip(query.skip)
			dbquery.limit(query.limit)

			dbquery.exec(function (err, solutions) {
				if(err) throw err
				else if(solutions) return reply(solutions)
				else return reply({error: 'not match found'})
			})
		}
	})

}