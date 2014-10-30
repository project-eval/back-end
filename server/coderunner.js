
var SandBox = require('sandbox')
var sandbox = new SandBox()
var testapi = require('./testapi')()

module.exports = function (language, test, code, cb) {

	if(!language || !code) {
		cb('missing language or code params', null)
	}

	else if(language === 'javascript') {
		sandbox.run(testapi + ';' + test + ';' + code, cb.bind(null, null))
	}

	else {
		cb('language is not yet supported!', null)
	}

}