
/*
 * import all routes
 */
module.exports = function (server) {

	require('./auth.routes')(server)
	require('./project.routes')(server)
	require('./solution.routes')(server)
	require('./user.routes')(server)

	/*
	 * @route
	 */
	server.route({
		method: 'GET',
		path: '/{path*}',
		config: {
			description: 'serves client',
			tags: ['main'],
			notes: 'https://github.com/hapijs/hapi/issues/800'
		},
		handler: {
			directory: {
				path: './',
				listing: true,
				index: true
			},
		}
	})

}