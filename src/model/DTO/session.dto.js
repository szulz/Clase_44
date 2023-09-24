class SessionDTO {
    constructor(user) {
        //SACO LA BASURA DE EL USUARIO CREADO POR MONGOOSE
        this.name = user.first_name
        this.email = user.email
        this.role = user.role
        this.cartID = user.cart.toString()
        this.userID = user._id.toString()
    }
}

module.exports = SessionDTO