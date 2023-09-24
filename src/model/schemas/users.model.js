const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')

const userCollection = 'users'

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, max: 100 },
    last_name: { type: String, required: true, max: 100 },
    email: { type: String, required: true, max: 100, unique: true },
    age: { type: Number, required: false, max: 100, default: 18 },
    password: { type: String, required: true, max: 100 },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'carts', default: [] },
    role: { type: String, required: true, max: 100, default: 'USER' },
    documents: {
        type: [{
            name: { type: String },
            reference: { type: String }
        }], default: []
    },
    last_connection: { type: Date, default: Date.now() },
    recovery_code: {
        type: [
            {
                code: { type: String },
                createdAt: { type: Date }
            }
        ],
        default: []
    },
})

userSchema.plugin(mongoosePaginate);

const userModel = mongoose.model(userCollection, userSchema);
module.exports = userModel;