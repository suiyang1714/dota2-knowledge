const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TemporaryRecordSchema = new Schema({
  issueId: String,
  userId: String,
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

TemporaryRecordSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

const TemporaryRecord = mongoose.model('TemporaryRecord', TemporaryRecordSchema)

module.exports = TemporaryRecord
