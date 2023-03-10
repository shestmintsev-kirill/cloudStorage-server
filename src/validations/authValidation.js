const { check } = require('express-validator')

const authValudation = [
	check('email', 'Uncorrect email').isEmail(),

	check(
		'password',
		'Invalid password, length must be longer than 3 and shorter than 12'
	).isLength({
		min: 3,
		max: 12
	})
]

module.exports = authValudation