const Router = require('express')
const repositoryController = require('../controllers/repositoryController')
const authMiddleware = require('../middleware/auth.middleware')

const router = new Router()

router.get('/', authMiddleware, repositoryController.getRepository)
router.put('/update', authMiddleware, repositoryController.updateRepository)

module.exports = router
