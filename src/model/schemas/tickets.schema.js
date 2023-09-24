const mongoose = require('mongoose');

const ticketsCollection = 'tickets'

const ticketsSchema = new mongoose.Schema({
    code: { type: String, default: [] },
    purchase_datetime: { type: Date },
    amount: { type: String, default: [] },
    purchaser: { type: String, default: [] },
});

const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);

module.exports = ticketsModel