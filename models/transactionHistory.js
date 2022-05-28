const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionListScheme = new Schema({
	soldBy	: { type: String, required: true },
	itemName 	: 	{ type: String, required: true },
	srp 	: 	{ type: Number, required: true },
	date	: 	{ type: String, required: true },
	year	: 	{ type: String, required: true },
	month	: 	{ type: String, required: true },
});

const TransactionList = new mongoose.model('TransactionLists', transactionListScheme);

module.exports = TransactionList;