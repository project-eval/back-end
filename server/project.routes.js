var _ = require('lodash')
var BreadStick = require('./models/breadstick')
var Solution = require('./models/solution')
var coderunner = require('./coderunner')
var Joi = require('joi')

module.exports = function (server) {

	/*
	 * @route
	 * query db for breadsticks
	 */
	server.route({
		method: 'GET',
		path: '/api/breadsticks',
		config: {
			validate: {
				query: {
					skip: Joi.number().min(0).default(0),
					limit: Joi.number().min(1).max(100).default(50),
					sort: Joi.string(),
					author: Joi.string(),
					language: Joi.string()
				}
			}
		},
		handler: function (request, reply) {

			// parsed query string
			var query = request.query
			var dbquery = BreadStick.find()

			if(query.author) dbquery.where('author').equals(query.author)
			if(query.language) dbquery.where('language').equals(query.language)
			if(query.sort) dbquery.sort(query.sort)

			dbquery.skip(query.skip)
			dbquery.limit(query.limit)

			dbquery.exec(function (err, breadSticks) {
				if(err) throw err
				else if(breadSticks) return reply(breadSticks)
				else return reply({error: 'not match found'})
			})
		}
	})

	/*
	 * @route
	 */
	server.route({
		method: 'GET',
		path: '/api/breadstick/{id}',
		config: {
			description: 'get a single breadstick by id',
			tags: ['project', 'id']
		},
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
	 * @TODO refactor
	 */
	server.route({
		method: 'POST',
		path: '/api/breadstick/{id}/{index}',
		config: {
			auth: 'local'
		},
		handler: function (request, reply) {

			var breadstick_id = request.params.id
			var challenge_index = request.params.index
			var code = request.payload.code
			var user_id = request.auth.credentials._id
			var username = request.auth.credentials.username

			if(!breadstick_id || !challenge_index || !code) {
				return reply({error: 'missing params'})
			}

			// $addToSet only pushes to array if item is unique
			User.update({_id: user_id}, {$addToSet:{breadsticks:breadstick_id}}, function (err) {
				if(err) throw err
			})
			BreadStick.update({_id: breadstick_id}, {$addToSet:{users:user_id}}, function (err) {
				if(err) throw err
			})

			// update solution at challenge_index
			// create new solution container if it doesn't already exists
			Solution.findOne({user: username, breadstick: breadstick_id}, function (err, solution) {
				if(err) throw err

				else if(solution) {
					solution.solution[challenge_index] = code
					Solution.findOneAndUpdate({user: username, breadstick: breadstick_id}, {'solution': solution.solution }, 
					function (err) { if(err) throw err })
				}

				else {
					var newSolution = new Solution({
						user: username,
						breadstick: breadstick_id,
						solution: [][challenge_index] = code
					}).save(function (err) { if(err) throw err })
				}
			})

			// test code
			BreadStick.findById(breadstick_id, function (err, breadstick) {
				if(err) throw err

				else if(breadstick) {

					var test = breadstick.challenges[challenge_index]

					coderunner(breadstick.language, test, code, function (err, output) {
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
		config: {
			auth: 'local'
		},
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
		config: {
			auth: 'local',
			validate: {
				payload: {
					id: Joi.string().required(),
					update: Joi.object().required()
				}
			}
		},
		handler: function (request, reply) {

			var id = request.payload.id
			var update = request.payload.update

			if(update['_id']) delete update._id

			BreadStick.findOneAndUpdate({'_id': id}, request.payload.update, function (err) {
				if(err) throw err
				else reply({success: 'gj!'})
			})
		}
	})
}