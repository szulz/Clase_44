const cartsModel = require("../../schemas/carts.schema");
const ProductDao = require("../products/products.mongo.dao");
const productDao = new ProductDao

class CartsDao {
    async create() {
        let newcart = new cartsModel();
        return newcart.save();
    }

    async findById(id) {
        return await cartsModel.findById(id).populate('cart.product')
    }

    async addProduct(cartId) {
        let existingCart = await this.findById(cartId)
        return existingCart
    }

    async deleteById(cartId, productId) {
        let targetCart = await this.findById(cartId)
        const productInCart = await targetCart.cart.find((item) => item.product._id == productId);
        if (productInCart.quantity > 1) {
            productInCart.quantity -= 1
            targetCart.message = 'The desired product has been decreased by 1'
        } else {
            //elimino el producto del carro
            await targetCart.cart.pull({ product: productInCart.product._id })
            targetCart.message = 'The desired product has been removed from your cart'
        }
        await productDao.findByIdAndUpdate(productInCart.product._id, { $inc: { stock: 1 } })
        await targetCart.save();
        return targetCart
    }

    async delete(id, i) {
        return await cartsModel.findByIdAndDelete(id[i])
    }

}

module.exports = CartsDao