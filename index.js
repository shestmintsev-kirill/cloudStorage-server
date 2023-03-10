const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const fileUpload = require('express-fileupload')
const authRouter = require('./src/routes/auth.routes.js')
const fileRouter = require('./src/routes/file.routes.js')
const repositoryRouter = require('./src/routes/repository.routes.js')
const cors = require('cors')
const filePathMiddleWare = require('./src/middleware/filePath.middleware')
const path = require('path')

const app = express()
const PORT = process.env.PORT || config.get('serverPort')

// const corsOptions = {
// 	origin: ['http://localhost:8080']
// }

// app.use(function (req, res, next) {
// 	setTimeout(next, 1000)
// })
app.use(fileUpload({}))
app.use(cors())
app.use(filePathMiddleWare(path.resolve(__dirname, 'src/files')))
app.use(express.json())
app.use(express.static('src/static'))
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)
app.use('/api/repository', repositoryRouter)

const start = async () => {
	try {
		await mongoose.connect(config.get('dbUrl'))
		app.listen(PORT, () => {
			console.log('server started on port ', PORT)
		})
	} catch (error) {
		console.log(error)
	}
}

start()
