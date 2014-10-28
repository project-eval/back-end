
var SandBox = require('sandbox')
var sandbox = new SandBox()

module.exports = function (language, code, cb) {

	if(!language || !code) {
		cb('missing language or code params', null)
	}

	else if(language === 'javascript') {
		sandbox.run(code, cb.bind(null, null))
	}

	else {
		cb('language is not supported!', null)
	}

}