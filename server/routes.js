var _ = require('lodash')
var validator = require('validator')
var User = require('./models/user')
var BreadStick = require('./models/breadstick')
var coderunner = require('./coderunner')
var Q = require('q')

module.exports = function (server) {

	/*
	 * @route
	 * @description serves client
	 */
	server.route({
	 	method: 'GET',
	 	path: '/{param*}',
	     handler: {
	         directory: {
	             path: 'front-end/build',
	             listing: true,
	             index: true
	         },
	     }
	})

	/*
	 * @route
	 * account registration
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

			User.findOne({username: username}, function (err, user) {
				if(err) throw err

				else if(user) {
					reply({error: 'username already registered'})
					return
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
							reply({success: {bitMask: user.bitMask, username: user.username}})
						}

						else {
							reply({error: unknown})
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

			if(!request.auth.isAuthenticated) {
				reply({
		      		username: 'o',
		      		role: 'public'
		    	})
				return
			}

			else {
				reply({
			      username: request.auth.credentials.username,
			      role: request.auth.credentials.role
			    })
			    return
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

			if(!validator.isLength(username, 4, 20)) {
				return reply({error: 'invalid username length'})
			}

			if(!validator.isLength(password, 8, 100)) {
				return reply({error: 'invalid password length'})
			}

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
			if(request.auth.session) request.auth.session.clear()
			reply({success: 'asd'})
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

			if(query.author) q.where('author').equals(query.author)
			if(query.language) q.where('language').equals(query.language)
			if(query.sort) q.sort(query.sort)

			q.skip(query.from || 0)
			q.limit(query.to || 10)

			q.exec(function (err, breadSticks) {
				if(err) throw err
				else reply(breadSticks)
			})
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
	 * submit code to eval
	 */
	server.route({
		method: 'POST',
		path: '/api/breadstick/{id}',
		config: {auth: 'simple'},
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
	 * create breadstick
	 */
	server.route({
		method: 'POST',
		path: '/api/breadsticks',
		config: {auth: 'simple'},
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
		config: {auth: 'simple'},
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