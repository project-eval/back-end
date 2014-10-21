var Hapi = require('hapi')
var db = require('./db')

var server = Hapi.createServer('0.0.0.0', 9000)

server.start(function () {
	console.log('server started @', server.info.uri)
})