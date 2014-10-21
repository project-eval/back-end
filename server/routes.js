module.exports = function (server) {

	server.route({
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			reply('static file')
		},
		config: {auth: 'simple'}
	})

}