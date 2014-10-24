var _ = require('lodash')
var validator = require('validator')
var User = require('./models/user')
var BreadStick = require('./models/breadstick')
var coderunner = require('./coderunner')

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
			reply('Hello').state('olive-garden-isAuth', request.auth.isAuthenticated)
		}
	})

	/*
	 * @route
	 * @description register a new account
	 */
	server.route({
		method: 'POST',
		path: '/api/register',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			if(!validator.isLength(username, 4, 20) || !validator.isLength(password, 8, 100)) {
				reply({error: 'invalid username of password'})
				return
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
							reply({success: {role: user.role, username: user.username}})
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
	 * @description initiate session
	 */
	server.route({
		method: 'POST',
		path: '/api/login',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			if(!validator.isLength(username, 4, 20)) {
				reply({error: 'invalid username length'})
				return
			}

			if(!validator.isLength(password, 8, 100)) {
				reply({error: 'invalid password length'})
				return
			}

			User.findOne({username: username}, function (err, user) {
				if(err) throw err

				else if(!user) {
					reply({error: 'username does not exist'})
				}

				else if(user.isValidPassword(password)) {
					request.auth.session.clear()
					request.auth.session.set(user)
					reply({success: {role: user.role, username: user.username}})
				}

				else {
					reply({error: 'wrong password'})
				}
			})
		}
	})

	/*
	 * @route
	 * @description terminate session
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
				if(err) throw err

				else if(user) {
					reply({
						username: user.username,
						points: user.points
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
				if(err) throw err

				else reply(breadSticks)
			})
		}
	})

	/*
	 * @route
	 * @api
	 * @description get a single breadstick by id
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
	 * @api
	 * @description submit code to eval
	 * @TODO
	 */
	server.route({
		method: 'POST',
		path: '/api/breadstick/{id}',
		config: {auth: 'simple'},
		handler: function (request, reply) {

			var id = request.params.id
			var code = request.payload.code

			if(!code) return reply({error: 'missing source code'})

			BreadStick.findById(id, function (err, breadStick) {
				if(err) throw err

				else if(breadStick) {
					coderunner(breadStick.language, code, function (err, output) {
						if(err) return reply({error: err})

						User.findById(request.auth.credentials._id, 'breadsticks', function (err, user) {

							// this should be decided by testing submited code
							var hasCompleted = false

							// updates existing breadstick or creates new
							// updates hasCompleted state
							var breadstick = _.find(user.breadsticks, function (brd) {return brd.id === id})
							if(breadstick) breadstick.hasCompleted = hasCompleted
							else user.breadsticks.push({id: id, hasCompleted: hasCompleted})
							user.save()

							return reply(output)

						})
					})
				}

				else {
					reply({error: 'unknown'})
				}
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
		config: {auth: 'simple'},
		handler: function (request, reply) {

			var author = request.auth.credentials._id
			var source = request.payload.source
			var language = request.payload.language
			var difficulty = request.payload.difficulty
			var title = request.payload.title

			if(!source || !language || !difficulty || !title) {
				reply({error: 'source, title, language and difficulty are required params!'})
				return
			}

			var newBreadStick = new BreadStick({
				title: title,
				author: author,
				source: source,
				language: language,
				difficulty: difficulty
			})

			newBreadStick.save(function (err, breadStick) {
				if(err) throw err

				else if(breadStick) {
					reply({success: 'gj!'})
				}

				else {
					reply({error: 'unknown'})
				}
			})
		}
	})
}