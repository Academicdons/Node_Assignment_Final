//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserDataSchema = new Schema({
    firstName: {type: String, required: true},
    lastName:  {type: String, required: true},
    userId:  {type: String, required: true},
    DOB:  {type: String, required: true},
    address:  {type: String, required: true},
    carDetails:  {type: String, required: true},
    LicenceNumber:  {type: String, required: true},
}, {collection: 'User_Data'});

// Compile model from schema
var UserDatamodel = mongoose.model('UserData', UserDataSchema );
module.exports = UserDatamodel;

