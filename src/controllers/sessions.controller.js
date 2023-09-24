class SessionsController {
    user(req, res, next) {
        req.session.user = req.user
        next()
    }

    returnUser(req, res) {
        let user = req.user
        return res.status(200).send({
            status: 'Success',
            payload: user
        });
    }
}

module.exports = SessionsController