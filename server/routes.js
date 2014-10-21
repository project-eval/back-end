var User = require('./models/user')

module.exports = function (server) {

	/*
	 * @route
	 * @description serves client
	 * @todo should handle all root GET paths
	 */
	server.route({
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			reply('static file')
		},
		config: {auth: 'simple'}
	})

	/*
	 * @route
	 * @description register a new account
	 * @todo validate payload
	 */
	server.route({
		method: 'POST',
		path: '/register',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			//TODO validate payload

			var newUser = new User()
			newUser.username = username
			newUser.password = newUser.generateHash(password)

			newUser.save(function (err, user) {
				if(err) console.log(err)
				else if(!user) reply({error: 'unknown'})
				else reply({success: 'gj!'})
			})
		}
	})

	/*
	 * @route
	 * @description validate account
	 * @todo validate payload
	 */
	server.route({
		method: 'POST',
		path: '/login',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			//TODO validate payload

			User.findOne({username: username}, function (err, user) {
				if(err) console.log(err)
				else if(!user) reply({error: 'invalid username'})
				else if(user.isValidPassword(password)) reply({success: 'gj!'})
				else reply({error: 'wrong password'})
			})
		}
	})

	/*
	 * @route
	 * @api
	 * @description returns public information about an account
	 */
	server.route({
		method: 'GET',
		path: '/api/user/{username}',
		handler: function (request, reply) {

			var username = request.params.username

			//TODO validate param

			User.findOne({username: username}, function (err, user) {
				if(err) console.log(err)
				else if(user) reply({
					username: user.username, 
					points: user.points
				})
				else reply({error: 'user not found'})
			})
		}
	})

	/*
	 * @route
	 * @api
	 */
	server.route({
		method: 'POST',
		path: '/api/breadsticks',
		handler: function (request, reply) {

			var start = request.payload.start
			var end = request.payload.end

			//TODO get breadsticks from 'start' to 'finish'
		}
	})

	/*
	 * @route
	 * @api
	 */
	server.route({
		method: 'GET',
		path: '/api/breadstick',
		handler: function (request, reply) {

		}
	})

	/*
	 * @route
	 * @api
	 */
	server.route({
		method: 'GET',
		path: '/api/breadstickd',
		handler: function (request, reply) {

		}
	})

	/*
	 * @route
	 * @api
	 */
	server.route({
		method: 'GET',
		path: '/api/breadstickr',
		handler: function (request, reply) {

		}
	})
}