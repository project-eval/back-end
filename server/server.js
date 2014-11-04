var Hapi = require('hapi')
var Path = require('path')

var server = Hapi.createServer('0.0.0.0', 9000, {
	cors: {
		origin: ['http://localhost:3000', 'http://0.0.0.0:3000'],
		credentials: true
	},
	files: {
		relativeTo: Path.join(__dirname, '../front-end/build')
	},
	debug: {
		request: ['*']
	}
})

// connect to db
require('./db')

// import auth pack
require('./auth')(server)

// import routes
require('./routes/routes')(server)

// logger
server.ext('onRequest', function (request, next) {
	console.log(request.method.toUpperCase(), request.path)
	console.log('params:', request.params, ' ~  payload:', request.payload)
	next()
})

server.start(function () {
	console.log('server started @', server.info.uri)
})