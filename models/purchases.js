const mongoose = require('mongoose');
const { Schema } = mongoose;


const purchaseSchema = new Schema({
	name: { type: String, required: true },
	datePurchased: { type: String, required: true }
});

const Purchase = new mongoose.model('Purchases', purchaseSchema);

module.exports = Purchase;