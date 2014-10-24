var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var userRoles = require('../routingConfig').userRoles

/**
 * @schema
 */
var UserSchema = mongoose.Schema({

	email:      String,
	password:   String,
	username:   String,
	createdOn:  {type: Date, default: Date.now},

	role:       {
					bitMask: {type: Number, default: userRoles.user.bitMask},
					title:   {type: String, default: userRoles.user.title}
				},

	status:     {type: Number, default: 1},

	points:     {type: Number, default: 0},

	breadsticks : [{type: Number, ref: 'BreadStick'}],

})

/**
 * @method
 */
UserSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(), null)
}

/**
 * @method
 */
UserSchema.methods.isValidPassword = function (password) {
	return bcrypt.compareSync(password, this.password)
}

/**
 * @model
 */
var User = mongoose.model('User', UserSchema)


module.exports = User