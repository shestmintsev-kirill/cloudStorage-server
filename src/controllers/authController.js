const User = require('../models/User')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const config = require('config')
const jwt = require('jsonwebtoken')
const fileService = require('../services/fileService')
const File = require('../models/File')
const fs = require('fs')

class AuthController {
	async registration(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Uncorrected request', errors })
			}

			const { email, password } = req.body

			const regUser = await User.findOne({ email })
			if (regUser) {
				return res.status(400).json({ message: `User with email ${email} already` })
			}

			const hashPassword = await bcrypt.hash(password, 8)
			const user = new User({ email, password: hashPassword })
			await user.save()

			await fileService.createDir(req, new File({ user: user.id, name: '' }))
			fs.writeFileSync(`src/files/${user.id}/index.json`, JSON.stringify({}))
			res.json({ message: 'User was created' })
		} catch (error) {
			console.log(error)
			res.send({ message: 'Server error' })
		}
	}

	async login(req, res) {
		try {
			const { email: reqEmail, password: reqPassword } = req.body

			const user = await User.findOne({ reqEmail })
			if (!user) {
				return res.status(404).json({ message: 'User not found' })
			}

			const { id, email, diskSpace, usedSpace, avatar } = user

			const isPassValid = bcrypt.compareSync(reqPassword, user.password) // compare passwords
			if (!isPassValid) {
				return res.status(400).json({ message: 'Invalid password' })
			}

			const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' })

			return res.json({ token, email, diskSpace, usedSpace, avatar, id })
		} catch (error) {
			console.log(error)
			res.send({ message: 'Server error' })
		}
	}

	async auth(req, res) {
		try {
			const user = await User.findOne({ _id: req.user.id })
			const { id, email, diskSpace, usedSpace, avatar } = user

			const token = jwt.sign({ id }, config.get('secretKey'), { expiresIn: '1h' })

			return res.json({ token, email, diskSpace, usedSpace, avatar, id })
		} catch (error) {
			console.log(error)
			res.send({ message: 'Server error' })
		}
	}
}

module.exports = new AuthController()
