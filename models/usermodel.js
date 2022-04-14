//Require Mongoose
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
const UserSchema = new Schema({
username: {
    type: String,
    required: true,
    unique:true,
    trim: true,
},
password: {
    type: String,
    required: true
},
role: {
    type: String,
    required:true
}
});

const newUserModel = mongoose.model('userlogindata', UserSchema);

module.exports = newUserModel;