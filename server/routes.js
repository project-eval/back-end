var _ = require('lodash')
var validator = require('validator')
var User = require('./models/user')
var BreadStick = require('./models/breadstick')
var coderunner = require('./coderunner')
var Q = require('q')

module.exports = function (server) {

	/*
	 * @route
	 * serves client
	 * https://github.com/hapijs/hapi/issues/800
	 */
	server.route({
		method: 'GET',
		path: '/{path*}',
		handler: {
			file: 'index.html'
		}
	})

	/*
	 * @route
	 * register a new account
	 */
	server.route({
		method: 'POST',
		path: '/api/register',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			if(!validator.isLength(username, 4, 20)) {
				return reply({error: 'invalid username length'})
			}
			if(!validator.isLength(password, 8, 100)) {
				return reply({error: 'invalid password length'})
			}
			if(!validator.isAlphanumeric(username)) {
				return reply({error: 'username can only contain alphanumeric characters'})
			}

			User.findOne({username: username}, function (err, user) {
				if(err) throw err

				else if(user) {
					return reply({error: 'username already registered'})
				}

				else {
					var newUser = new User()
					newUser.username = username
					newUser.password = newUser.generateHash(password)

					newUser.save(function (err, user) {
						if(err) throw err

						else if(user) {
							request.auth.session.clear()
							request.auth.session.set(user)
							return reply({success: {role: user.role, username: user.username}})
						}

						else {
							return reply({error: unknown})
						}
					})
				}
			})
		}
	})

	/*
	 * @route
	 * recive info about your session
	 */
	server.route({
		method: 'GET',
		path: '/api/me',
		handler: function (request, reply) {

			if(request.auth.isAuthenticated) {
				return reply({
				  username: request.auth.credentials.username,
				  role: request.auth.credentials.role
				})
			}

			else {
				return reply({
					username: '',
					role: 'public'
				})
			}
		}
	})

	/*
	 * @route
	 * account authentication
	 */
	server.route({
		method: 'POST',
		path: '/api/login',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			if(!username || !password) return reply({error: 'missing username or password field'})

			User.findOne({username: username}, function (err, user) {
				if(err) throw err

				else if(!user) {
					return reply({error: 'username does not exist'})
				}

				else if(user.isValidPassword(password)) {
					request.auth.session.clear()
					request.auth.session.set(user)
					return reply({success: {role: user.role, username: user.username}})
				}

				else {
					return reply({error: 'wrong password'})
				}
			})
		}
	})

	/*
	 * @route
	 * terminate session
	 */
	server.route({
		method: 'POST',
		path: '/api/logout',
		handler: function (request, reply) {
			
			if(request.auth.session) {
				request.auth.session.clear()
			}

			reply({success: true})
		}
	})

	/*
	 * @route
	 * return public information about an account
	 */
	server.route({
		method: 'GET',
		path: '/api/user/{username}',
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

	/*
	 * @route
	 * query db for breadsticks
	 */
	server.route({
		method: 'GET',
		path: '/api/breadsticks',
		handler: function (request, reply) {

			// parsed query string
			var query = request.query
			var dbquery = BreadStick.find()

			if(query.author) dbquery.where('author').equals(query.author)
			if(query.language) dbquery.where('language').equals(query.language)
			if(query.sort) dbquery.sort(query.sort)

			var skip = query.skip || 0
			var limit = query.limit ? clamp(query.limit, 1, 100) : 50

			dbquery.skip(skip)
			dbquery.limit(limit)

			dbquery.exec(function (err, breadSticks) {
				if(err) throw err

				else if(breadSticks) {
					return reply(breadSticks)
				}

				else {
					reply({error: 'unknown'})
				}
			})

			// no clamp on lodash?
			function clamp(num, min, max) {return Math.min(Math.max(num, min), max)}
		}
	})

	/*
	 * @route
	 * get a single breadstick by id
	 */
	server.route({
		method: 'GET',
		path: '/api/breadstick/{id}',
		handler: function (request, reply) {

			var id = request.params.id

			BreadStick.findById(id, function (err, breadStick) {
				if(err) throw err

				else if(breadStick) {
					reply({success: breadStick})
				}

				else if(!breadStick) {
					reply({error: 'breadStick not found'})
				}

				else {
					reply({error: 'unknown'})
				}
			})
		}
	})

	/*
	 * @route
	 * submit code for evaluation
	 */
	server.route({
		method: 'POST',
		path: '/api/breadstick/{id}',
		config: {auth: 'local'},
		handler: function (request, reply) {

			var breadstick_id = request.params.id
			var user_id = request.auth.credentials._id
			var code = request.payload.code

			// $addToSet only pushes to array if item is unique
			User.update({_id: user_id}, {$addToSet:{breadsticks:breadstick_id}}, function (err) {
				if(err) throw err
			})
			BreadStick.update({_id: breadstick_id}, {$addToSet:{users:user_id}}, function (err) {
				if(err) throw err
			})

			BreadStick.findById(breadstick_id, function (err, breadstick) {
				if(err) throw err

				else if(breadstick) {
					coderunner(breadstick.language, code, function (err, output) {
						if(err) return reply({error: err})
						else return reply(output)
					})
				}

				else {
					return reply({error: 'breadstick does not exist'})
				}
			})
		}
	})

	/*
	 * @route
	 * create a breadstick
	 */
	server.route({
		method: 'POST',
		path: '/api/breadsticks',
		config: {auth: 'local'},
		handler: function (request, reply) {

			var author = request.auth.credentials.username

			var newBreadStick = new BreadStick({
				name: 'My breadstick',
				author: author,
				tags: ['comma', 'separated', 'tags'],
				challenges: [
					{
						description: '#write your description for challenge #1 here! \n take advantage of the markdown!',
						test: 'write your tests for challenge #1'
					},
					{
						description: '#write your description for challenge #2 here! \n take advantage of the markdown!',
						test: 'write your tests for challenge #2'
					}
				],
				language: 'javascript',
				difficulty: 0
			})

			newBreadStick.save(function (err, breadStick) {
				if(err) throw err

				else if(breadStick) {
					reply({success: 'breadStick created'})
				}

				else {
					reply({error: 'unknown'})
				}
			})
		}
	})

	/*
	 * @route
	 * update breadstick
	 */
	server.route({
		method: 'PUT',
		path: '/api/breadsticks',
		config: {auth: 'local'},
		handler: function (request, reply) {

			var id = request.payload.id
			var update = request.payload.update

			delete update._id

			if(!update || !id) return reply({error: 'missing params'})

			BreadStick.findOneAndUpdate({'_id': id}, request.payload.update, function (err) {
				if(err) throw err
				else reply({success: 'gj!'})
			})
		}
	})
}