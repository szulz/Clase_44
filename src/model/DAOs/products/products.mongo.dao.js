const productModel = require("../../schemas/product.schema");


class ProductDao {

    async find() {
        return await productModel.find()
    }

    async createProduct(newProd, role, user, picture) {
        newProd.owner = { createdBy: user, status: role }
        newProd.picture = picture
        const createdProduct = new productModel({
            title: newProd.title,
            description: newProd.description,
            price: newProd.price,
            stock: newProd.stock,
            owner: newProd.owner,
            picture_filename: newProd.picture,
        });
        return await createdProduct.save();
    };

    async updateProduct(id, newProperties) {
        try {
            const producto = await productModel.findByIdAndUpdate(id, {
                title: newProperties.title,
                description: newProperties.description,
                price: newProperties.price
            }, { new: true });
            return producto;
        } catch (e) {
            throw new Error('something went wrong in UPDATEPRODUCT');
        };
    };

    async deleteProduct(id) {
        try {
            return await productModel.deleteOne({ _id: id });
        } catch (e) {
            throw new Error('error en delete product');
        }
    }

    async decreaseStock(productId, foundProduct, foundCart) {
        let productToCheck = await productModel.findById(productId)
        if (productToCheck.stock > 0) {
            productToCheck.stock -= 1
            productToCheck.save()
            if (foundProduct) {
                foundProduct.quantity += 1;
            } else {
                foundCart.cart.push({ product: productId, quantity: 1 });
            }
            await foundCart.save()
            return foundCart
        }
        return
    }

    async findById(id) {
        return await productModel.findById(id)
    }

    async deleteMany(filter) {
        let products = await productModel.find(filter)
        await productModel.deleteMany(filter);
        return products
    }

    async findByIdAndUpdate(id, filter) {
        return await productModel.findByIdAndUpdate(id, filter, { new: true })
    }
}

module.exports = ProductDao