var Hapi = require('hapi')
var server = Hapi.createServer('0.0.0.0', 9000, {
	cors: true
})

// connect to db
require('./db')

// import auth pack
require('./auth')(server)

// import routes
require('./routes')(server)

server.start(function () {
	console.log('server started @', server.info.uri)
})