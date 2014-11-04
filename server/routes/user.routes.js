var _ = require('lodash')
var User = require('../models/user')
var Joi = require('joi')

module.exports = function (server) {

	/*
	 * @route
	 */
	server.route({
		method: 'GET',
		path: '/api/user/{username}',
		config: {
			description: 'return public information about an account',
			tags: ['user']
		},
		handler: function (request, reply) {

			var username = request.params.username

			User.findOne({username: username}, function (err, user) {
				if(err) throw err

				else if(user) {
					reply({
						username: user.username,
						points: user.points,
						createdOn: user.createdOn,
						breadsticks: user.breadsticks
					})
				}

				else {
					reply({error: 'user not found'})
				}
			})
		}
	})
}