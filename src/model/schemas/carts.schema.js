const mongoose = require('mongoose');

const cartsCollection = 'carts'

const cartsSchema = new mongoose.Schema({
    cart: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                },
                quantity: {
                    type: Number
                }
            },
        ],
        default: []
    }
});

cartsSchema.pre('save', function (next) {
    this.populate('cart.product');
    next();
});

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

module.exports = cartsModel