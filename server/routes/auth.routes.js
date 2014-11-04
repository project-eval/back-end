
var User = require('../models/user')
var Joi = require('joi')

module.exports = function (server) {

	/*
	 * @route
	 */
	server.route({
		method: 'POST',
		path: '/api/register',
		config: {
			description: 'register a new account',
			tags: ['auth'],
			validate: {
				payload: {
					username: Joi.string().required().alphanum().min(4).max(20),
					password: Joi.string().required().min(8).max(100)
				}
			},
			pre: [
				{
					method: function (request, reply) {
						User.findOne({username: request.payload.username}, function (err, user) {
							if(err) throw err
							else if(user) return reply(true)
							else return reply(false)
						})
					},
					assign: 'isUsernameIsTaken'
				}
			]
		},
		handler: function (request, reply) {

			if(request.pre.isUsernameIsTaken) return reply({error: 'username is taken'})

			var username = request.payload.username
			var password = request.payload.password

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

	/*
	 * @route
	 */
	server.route({
		method: 'GET',
		path: '/api/me',
		config: {
			description: 'recive information about your current session (if any)',
			tags: ['auth'],
		},
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
	 */
	server.route({
		method: 'POST',
		path: '/api/login',
		config: {
			description: 'authenticate user and begin session',
			tags: ['auth'],
			validate: {
				payload: {
					username: Joi.string().required().alphanum().min(4).max(20),
					password: Joi.string().required().min(8).max(100)
				}
			},
		},
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

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
	 */
	server.route({
		method: 'POST',
		path: '/api/logout',
		config: {
			description: 'terminate session',
			tags: ['auth'],
		},
		handler: function (request, reply) {
			
			if(request.auth.session) {
				request.auth.session.clear()
			}

			reply({success: true})
		}
	})
}