const cartsModel = require("../../schemas/carts.schema");

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
        const targetProduct = targetCart.cart.find((item) => item.product._id == productId);
        console.log(targetProduct);
        if (targetProduct.quantity > 1) {
            targetProduct.quantity -= 1
        } else {
            await targetCart.cart.pull({ product: targetProduct.product._id })
        }
        await targetCart.save();
        return targetCart
    }

}

module.exports = CartsDao