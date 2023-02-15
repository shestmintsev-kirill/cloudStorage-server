const Router = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const config = require('config')
const authValidation = require('../validations/authValidation')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../services/fileService')
const File = require('../models/File')
const fs = require('fs')

const router = new Router()

router.post('/registration', authValidation, async (req, res) => {
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
		fs.writeFileSync(`files/${user.id}/index.json`, JSON.stringify({}))
		res.json({ message: 'User was created' })
	} catch (error) {
		console.log(error)
		res.send({ message: 'Server error' })
	}
})

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}
		const isPassValid = bcrypt.compareSync(password, user.password) // compare passwords
		if (!isPassValid) {
			return res.status(400).json({ message: 'Invalid password' })
		}
		const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' })
		return res.json({
			token,
			email: user.email,
			diskSpace: user.diskSpace,
			usedSpace: user.usedSpace,
			avatar: user.avatar,
			id: user.id
		})
	} catch (error) {
		console.log(error)
		res.send({ message: 'Server error' })
	}
})

router.get('/auth', authMiddleware, async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.user.id })
		const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' })
		return res.json({
			token,
			email: user.email,
			diskSpace: user.diskSpace,
			usedSpace: user.usedSpace,
			avatar: user.avatar,
			id: user.id
		})
	} catch (error) {
		console.log(error)
		res.send({ message: 'Server error' })
	}
})

module.exports = router
