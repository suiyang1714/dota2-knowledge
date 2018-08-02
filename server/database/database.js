var fs = require('fs')
var resolve = require('path').resolve
var mongoose = require('mongoose')
var config = require('../config')

/*const models = resolve(__dirname, './schema')
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => require(resolve(models, file)))*/
const models = resolve(__dirname, '../database/schema')
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => {
    require(`../database/schema/${file}`)
    // require(resolve(models,file))
  })

const database = () => {

    mongoose.set('debug', true)

    mongoose.Promise = global.Promise

    mongoose.connect(config.db)

    mongoose.connection.on('disconnected', () => {
        mongoose.connect(config.db)
    })
    mongoose.connection.on('error', err => {
        console.error(err)
    })

    mongoose.connection.on('open', async () => {

      console.log('Connected to MongoDB ', config.db)

      const Admin = mongoose.model('Admin')
      let user = await Admin.findOne({
        user: 'admin'
      })

      if (!user) {
        console.log('写入管理员数据')

        user = new Admin({
          user: 'admin',
          password: '123456',
          role: 'superAdmin',
          nickname: 'Aditya Sui'
        })

        await user.save()
      }

    })

}

module.exports = database
