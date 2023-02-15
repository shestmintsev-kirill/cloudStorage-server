const fileService = require('../services/fileService')
const User = require('../models/User')
const File = require('../models/File')
const fs = require('fs')
const config = require('config')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

class FileController {
	async createDir(req, res) {
		try {
			const { name, type, parent } = req.body
			const file = new File({ name, type, parent, user: req.user.id })
			const parentFile = await File.findOne({ _id: parent })
			if (!parentFile) {
				file.path = name
				await fileService.createDir(req, file)
			} else {
				file.path = `${parentFile.path}/${file.name}`
				await fileService.createDir(req, file)
				parentFile.children.push(file._id)
				await parentFile.save()
			}
			await file.save()
			return res.json(file)
		} catch (error) {
			console.log(error)
			return res.status(400).json(error)
		}
	}

	async getFiles(req, res) {
		try {
			const { sort, parent } = req.query
			let files
			switch (sort) {
				case 'name':
					files = await File.find({ user: req.user.id, parent }).sort({ name: 1 })
					break
				case 'type':
					files = await File.find({ user: req.user.id, parent }).sort({ type: 1 })
					break
				case 'date':
					files = await File.find({ user: req.user.id, parent }).sort({ date: 1 })
					break
				default:
					files = await File.find({ user: req.user.id, parent })
					break
			}

			return res.json(files)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Can not get files' })
		}
	}

	async uploadFile(req, res) {
		try {
			const file = req.files.file
			const fileName = req.body.fileName
			const parent = await File.findOne({ user: req.user.id, _id: req.body.parent })
			const user = await User.findOne({ _id: req.user.id })
			if (user.usedSpace + file.size > user.diskSpace) {
				return res.status(400).json({ message: 'No space on disk' })
			}

			user.usedSpace = user.usedSpace + file.size

			const path = `${req.filePath}/${user._id}${parent ? '/' + parent.path : ''}/${fileName}`

			if (fs.existsSync(path)) {
				return res.status(400).json({ message: 'File already exists' })
			}
			file.mv(path)
			const type = fileName.split('.').pop()
			let filePath = fileName
			if (parent) {
				filePath = parent.path + '/' + fileName
			}
			const dbFile = new File({
				name: fileName,
				type,
				size: file.size,
				path: filePath,
				parent: parent ? parent._id : null,
				user: user._id
			})
			await dbFile.save()
			await user.save()
			res.json(dbFile)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Uploading file failed' })
		}
	}

	async downloadFile(req, res) {
		try {
			const file = await File.findOne({ _id: req.query.id, user: req.user.id })
			const path = fileService.getPath(req, file)
			if (fs.existsSync(path)) {
				return res.download(path, file.name)
			}
			return res.status(400).json({ message: 'Download error' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Download error' })
		}
	}

	async deleteFile(req, res) {
		try {
			const file = await File.findOne({ _id: req.query.id, user: req.user.id })
			if (!file) {
				return res.status(400).json({ message: 'File not found' })
			}
			fileService.deleteFile(req, file)
			const parent = await File.findOne({ _id: file.parent, user: req.user.id })
			if (parent?.children?.length) {
				parent.children = parent.children.filter(
					child => child._id.toString() !== req.query.id
				)
				await parent.save()
			}
			await file.remove()
			return res.json({ message: 'File was deleted' })
		} catch (error) {
			console.log(error)
			res.status(400).json({ message: 'Dir is not empty' })
		}
	}

	async searchFile(req, res) {
		try {
			const { search } = req.query
			let files = await File.find({ user: req.user.id })
			files = files.filter(file => file.name.includes(search))
			return res.json(files)
		} catch (error) {
			console.log(error)
			res.status(400).json({ message: 'Search error' })
		}
	}

	async uploadAvatar(req, res) {
		try {
			const file = req.files.file
			const user = await User.findById(req.user.id)
			const avatarName = uuidv4() + '.jpg'
			file.mv(path.resolve('static') + '/' + avatarName)
			user.avatar = avatarName
			await user.save()
			return res.json(user)
		} catch (error) {
			console.log(error)
			res.status(400).json({ message: 'Upload avatar error' })
		}
	}

	async deleteAvatar(req, res) {
		try {
			const user = await User.findById(req.user.id)
			fs.unlinkSync(path.resolve('static') + '/' + user.avatar)
			user.avatar = null
			await user.save()
			return res.json(user)
		} catch (error) {
			console.log(error)
			res.status(400).json({ message: 'Delete avatar error' })
		}
	}
}

module.exports = new FileController()
