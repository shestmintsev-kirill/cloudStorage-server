const Router = require('express')
const fileController = require('../controllers/fileController')
const authMiddleware = require('../middleware/auth.middleware')

const router = new Router()

router.post('', authMiddleware, fileController.createDir)
router.get('', authMiddleware, fileController.getFiles)
router.delete('', authMiddleware, fileController.deleteFile)
router.post('/upload', authMiddleware, fileController.uploadFile)
router.get('/download', authMiddleware, fileController.downloadFile)
router.get('/search', authMiddleware, fileController.searchFile)
router.post('/avatar', authMiddleware, fileController.uploadAvatar)
router.delete('/avatar', authMiddleware, fileController.deleteAvatar)

module.exports = router
