
module.exports = function (server) {

	server.pack.register(require('hapi-auth-cookie'), function (err) {
		if(err) console.log(err)

	    server.auth.strategy('simple', 'cookie', 'try', {
	        password : 'secret',
	        cookie : 'olive-garden',
	        redirectTo : false,
	        isSecure : false,
	        ttl : 60 * 1000 * 24
	    })
	})

}