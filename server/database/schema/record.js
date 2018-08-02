const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RecordSchema = new Schema({
  openid: String,
  victory: {
    type: Number,
    default: 0
  },
  failure: {
    type: Number,
    default: 0
  },
  highLadder: {
    type: Number,
    default: 1000
  },
  winStreak: {
    type: Number,
    default: 0
  },
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

RecordSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

const Record = mongoose.model('Record', RecordSchema)

module.exports = Record
