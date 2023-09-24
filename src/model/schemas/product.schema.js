const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')

const productCollection = 'products'

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, max: 100 },
    description: { type: String, required: true, max: 100 },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    owner: {
        type: [{
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            status: { type: String }
        }], default: [{ createdBy: null, status: 'ADMIN' }]
    },
    picture_filename: { type: String, default: null }
});

/*
productSchema.pre('save', function (next) {
    this.populate('owner.createdBy');
    next();
});
*/

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model(productCollection, productSchema);

module.exports = productModel