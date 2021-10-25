const mongoose = require('mongoose');
const { Schema } = mongoose;


const tokenSchema = new	 Schema({
	code: String
});

const Token = new mongoose.model('Tokens', tokenSchema);


module.exports = Token;