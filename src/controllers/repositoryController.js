const fs = require('fs')
const path = require('path')

class RepositoryController {
	async getRepository(req, res) {
		try {
			const pathToRepoFile = path.resolve(`src/files/${req.user.id}/index.json`)
			if (fs.existsSync(pathToRepoFile)) return res.sendFile(pathToRepoFile)
			else return res.status(400).send({ message: 'Repository not found' })
		} catch (error) {
			console.log(error)
			res.send({ message: 'Server error' })
		}
	}

	async updateRepository(req, res) {
		try {
			fs.writeFileSync(`src/files/${req.user.id}/index.json`, JSON.stringify(req.body))
			return res.send({ message: 'Repository has been updated' })
		} catch (error) {
			console.log(error)
			res.send({ message: 'Server error' })
		}
	}
}

module.exports = new RepositoryController()
