const path = require('path')
const fs = require('fs')

function filePath(filePath) {
	return function (req, res, next) {
		if (!fs.existsSync(path.resolve('src/files'))) {
			fs.mkdirSync('src/files')
		}
		req.filePath = filePath
		next()
	}
}

module.exports = filePath
