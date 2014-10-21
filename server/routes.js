var User = require('./models/user')

module.exports = function (server) {

	server.route({
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			reply('static file')
		},
		config: {auth: 'simple'}
	})

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
				reply({success: 'gj!'})
			})
		}
	})

	server.route({
		method: 'POST',
		path: '/login',
		handler: function (request, reply) {

			var username = request.payload.username
			var password = request.payload.password

			//TODO validate payload

			User.findOne({username: username}, function (err, user) {
				if(err) console.log(err)
				if(user.isValidPassword(password)) reply({success: 'gj!'})
				console.log(user)
			})
		}
	})

	server.route({
		method: 'POST',
		path: '/breadsticks',
		handler: function (request, reply) {

			var start = request.payload.start
			var end = request.payload.end

			//TODO get breadsticks from 'start' to 'finish'
		}
	})
}