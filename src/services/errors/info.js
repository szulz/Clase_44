class GenerateErrorCauses {
    userEmail(email) {
        return `The email you typed '${email}' does not correspond to an email scheme. Here is an example of how an email should look like: 'example@gmail.com'`
    }

    login() {
        return 'Error en login'
    }

    register() {
        return 'Error en register'
    }

    duplicatedEmail() {
        return 'This email has already been used, please try again with another email'
    }

    invalidPassword() {
        return 'Invalid password!'
    }

    invalidEmail() {
        return 'Email not found in data base'
    }

    authFailure() {
        return 'unexpected error'
    }

    notAdmin(){
        return 'You have no permission to perform this action, you must have the admin role'
    }

    blockAdminChat(){
        return 'Admins cant use the chat room / addproducts on cart'
    }

}


module.exports = GenerateErrorCauses