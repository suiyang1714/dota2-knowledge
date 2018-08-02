const mongoose = require('mongoose')
const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  issue: String,
  options: {
    type: Array
  },
  answer: {
    type: Number
  },
  completed: [
    {
      type: String,
      ref: 'MinaUser'
    }
  ],
  level: {
    type: Number,
    default: 1
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

QuestionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

const Question = mongoose.model('Question', QuestionSchema)

module.exports = Question
