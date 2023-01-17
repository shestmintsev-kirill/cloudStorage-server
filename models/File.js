const { Schema, model, ObjectId } = require('mongoose')

const File = new Schema({
	name: { type: 'string', required: true },
	type: { type: 'string', required: true },
	accessLink: { type: 'string' },
	size: { type: 'number', default: 0 },
	path: { type: 'string', default: '' },
	date: { type: 'string', default: new Date().toLocaleString() },
	user: { type: ObjectId, ref: 'User' },
	parent: { type: ObjectId, ref: 'File' },
	children: [{ type: ObjectId, ref: 'File' }]
})

module.exports = model('File', File)
