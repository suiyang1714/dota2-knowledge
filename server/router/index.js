const router = require('koa-router')()
const WXBizDataCrypt = require('../middleware/WXBizDataCrypt')
const config = require('../config')
const flyio = require("flyio/src/node")
const fly = new flyio

const Admin = require('../database/schema/admin')
const MinaUser = require('../database/schema/user')
const Record = require('../database/schema/record')
const Question = require('../database/schema/question')
const TemporaryRecord = require('../database/schema/temporaryrecord')

router.post('/api/UserWechat/login', async (ctx, next) => {
  const { code } = ctx.request.body
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appid}&secret=${config.appsecret}&js_code=${code}&grant_type=authorization_code`

  const callback = await fly.get(url)
  const openId = JSON.parse(callback.data).openid
  let user
  user = await MinaUser
    .findOne({openid: openId})
    .exec()
  if (!user) {
    let user = await new MinaUser({
      openid: openId
    })

    await user.save()

    ctx.body = {
      success: true,
      stored: false,
      errmsg: `新建用户 openid`,
      data: JSON.parse(callback.data)
    }
  } else {
    user = await MinaUser
      .findOne({openid: openId})
      .populate('record')
      .exec()
    ctx.body = {
      success: true,
      stored: true,
      errmsg: `该用户信息已存在`,
      data: user
    }
  }
})

router.post('/api/UserWechat/ValidateUser', async (ctx, next) => {
  const { encryptedData, iv, sessionKey } = ctx.request.body
  const pc = new WXBizDataCrypt(config.appid, sessionKey)
  const data = pc.decryptData(encryptedData , iv)
  let user
  user = await MinaUser
    .findOne({openid: data.openId})
    .exec()

  if (user) {
    let record = new Record({
      openid: data.openId
    })
    user.nickname = data.nickName
    user.gender = data.gender
    user.city = data.city
    user.province = data.province
    user.country = data.country
    user.avatarUrl = data.avatarUrl
    user.unionId = data.unionId
    user.record = record._id

    await user.save()
    await record.save()

    user = await MinaUser
      .findOne({openid: data.openId})
      .populate('record')
      .exec()

    ctx.body = {
      success: true,
      errmsg: `用户信息存储成功`,
      data: user
    }
  } else {
    ctx.body = {
      success: false,
      errmsg: `用户信息存储失败`,
      data: null
    }
  }
})
router.post('/api/question/new', async (ctx, next) => {
  const issueMsg = ctx.request.body

  let issue = await new Question(issueMsg)

  issue.save()

  ctx.body = {
    success: true,
    data: `提交成功，感谢您的题目！`
  }

})
router.get('/api/getQuestion', async (ctx, next) => {
  const { openid } = ctx.query
  let issueIdArray
  let questions

  const temporaryrecord = await TemporaryRecord
    .find({userId: openid})
    .exec()

  if (temporaryrecord.length > 0) {
    issueIdArray = temporaryrecord.map(item => {
      return item.issueId
    })
    console.log(issueIdArray)
    questions = await Question
      .find({
        completed: {
          $nin: [openid]
        },
        _id: {
          $nin: issueIdArray
        }
      })
      .exec()
  } else {
    questions = await Question
      .find({
        completed: {
          $nin: [openid]
        }
      })
      .exec()
  }

  if (questions.length > 0) {
    const random = Math.floor(Math.random() * questions.length)

    const newTemporaryRecord = await new TemporaryRecord({
      issueId: questions[random]._id,
      userId: openid
    })

    await newTemporaryRecord.save()

    ctx.body = {
      success: true,
      errmsg: `这是第${issueIdArray ? issueIdArray.length + 1 : 1}道题`,
      data: questions[random]
    }
  } else {
    ctx.body = {
      success: true,
      errmsg: `我周雄谁都不服就服你`,
      data: null
    }
  }

})
router.get('/api/updateRecord', async (ctx, next) => {
  const { openid, result, issueId } = ctx.query

  let record = await Record
    .findOne({openid: openid})
    .exec()

  if (result === 'true') {
    let issue = await Question
      .findById({_id: issueId})
      .exec()

    record.victory += 1
    record.highLadder += issue.level * 1

    issue.completed.push(openid)
    await issue.save()
  } else if (result === 'false') {
    record.failure += 1
    record.highLadder -= 1
  }
  await record.save()

  ctx.body = {
    success: true,
    data: record
  }

})
router.get('/api/delete/temporary', async (ctx, next) => {
  const { openid } = ctx.query

  await TemporaryRecord
    .remove({userId: openid})
    .exec()

  ctx.body = {
    success: true,
    errmsg: `临时记录清除成功`,
    data: null
  }
})
// 登录
router.post('/api/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  let user,
    match

  try {
    user = await Admin.findOne({ user: username }).exec()
    if (user) {
      match = await user.comparePassword(password, user.password)
    }
  } catch (e) {
    throw new Error(e)
  }

  if (match) {
    ctx.session.user = {
      _id: user._id,
      username: user.user,
      nickname: user.nickname,
      role: user.role
    }

    return (ctx.body = {
      success: true,
      data: {
        username: user.user,
        nickname: user.nickname
      }
    })
  }

  return (ctx.body = {
    success: false,
    err: '密码错误'
  })
})
module.exports = router
