var mongoose = require('mongoose')
var Schema = mongoose.Schema
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
    role:       {type: Schema.Types.Mixed, default: userRoles.user},
    status:     {type: Number, default: 1},

    points:     {type: Number, default: 0},

    breadsticks : [{
        id: String,
        hasCompleted: {type: Boolean, default: false}
    }]

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