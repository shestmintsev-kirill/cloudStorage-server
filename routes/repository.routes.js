const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const fs = require('fs')
const path = require('path')

const router = new Router()

router.get('/', authMiddleware, (req, res) => {
	try {
		const pathToRepoFile = path.resolve(`files/${req.user.id}/index.json`)
		if (fs.existsSync(pathToRepoFile)) return res.sendFile(pathToRepoFile)
		else return res.status(400).send({ message: 'Repository not found' })
	} catch (error) {
		console.log(error)
		res.send({ message: 'Server error' })
	}
})

router.put('/update', authMiddleware, (req, res) => {
	try {
		fs.writeFileSync(`files/${req.user.id}/index.json`, JSON.stringify(req.body))
		return res.send({ message: 'Repository has been updated' })
	} catch (error) {
		console.log(error)
		res.send({ message: 'Server error' })
	}
})

module.exports = router
