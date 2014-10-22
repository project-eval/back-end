var _ = require('lodash')
var validator = require('validator')
var User = require('./models/user')
var BreadStick = require('./models/breadstick')

module.exports = function (server) {

	/*
	 * @route
	 * @description serves client
	 * @todo should handle all root GET paths
	 */
	server.route({
		method: 'GET',
		path: '/',
		config: {auth: 'simple'},
		handler: function (request, reply) {
			reply('static file')
		}
	})

	/*
	 * @route
	 * @description register a new account
	 */
	server.route({
		method: 'POST',
		path: '/register',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			if(!validator.isLength(username, 4, 20) || !validator.isLength(password, 8, 100)) {
				reply({error: 'invalid username of password'})
				return
			}

			User.findOne({username: username}, function (err, user) {
				if(err) console.log(err)
				else if(user) reply({error: 'username already registered'})
				else {
					var newUser = new User()
					newUser.username = username
					newUser.password = newUser.generateHash(password)

					newUser.save(function (err, user) {
						if(err) console.log(err)
						else if(!user) reply({error: 'unknown'})
						else {
							request.auth.session.clear()
            				request.auth.session.set(user)
							reply({success: 'gj!'})
						}
					})
				}
			})
		}
	})

	/*
	 * @route
	 * @description validate account
	 */
	server.route({
		method: 'POST',
		path: '/login',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			if(!validator.isLength(username, 4, 20) || !validator.isLength(password, 8, 100)) {
				reply({error: 'invalid username of password'})
				return
			}

			User.findOne({username: username}, function (err, user) {
				if(err) console.log(err)
				else if(!user) reply({error: 'invalid username'})
				else if(user.isValidPassword(password)) {
					request.auth.session.clear()
            		request.auth.session.set(user)
					reply({success: 'gj!'})
				}
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
	 * @description query db for breadsticks
	 *
	 * @TODO add query count limit
	 * @TODO refactor...
	 */
	server.route({
		method: 'GET',
		path: '/api/breadsticks',
		handler: function (request, reply) {

			var query = request.query

			var q = BreadStick.find()

			if(query.language) q.where('language').equals(query.language)
			if(query.sort) q.sort(query.sort)

			q.skip(query.from || 0)
			q.limit(query.to || 10)

			q.exec(function (err, breadSticks) {
				if(err) {
					console.log(err)
					reply({error: 'unknown'})
				}
				else reply(breadSticks)
			})
		}
	})

	/*
	 * @route
	 * @api
	 * @description create breadstick
	 */
	server.route({
		method: 'POST',
		path: '/api/breadsticks',
		handler: function (request, reply) {

			var source = request.payload.source
			var language = request.payload.language
			var difficulty = request.payload.difficulty

			if(!source || !language || !difficulty) {
				reply({error: 'source, language and difficulty are required params!'})
				return
			}

			var newBreadStick = new BreadStick({
				source: source,
			    language: language,
			    difficulty: difficulty
			})

			newBreadStick.save(function (err, breadStick) {
				if(err) console.log(err)
				else if(!breadStick) reply({error: 'unknown'})
				else reply({success: 'gj!'})
			})
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