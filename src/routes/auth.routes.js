const Router = require('express')
const authController = require('../controllers/authController')
const authValidation = require('../validations/authValidation')
const authMiddleware = require('../middleware/auth.middleware')

const router = new Router()

router.post('/registration', authValidation, authController.registration)
router.post('/login', authController.login)
router.get('/auth', authMiddleware, authController.auth)

module.exports = router
