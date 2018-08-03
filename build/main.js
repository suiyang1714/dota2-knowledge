require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = require("mongoose");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(24);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

var mongoose = __webpack_require__(0);
var bcrypt = __webpack_require__(18);

var SALT_WORK_FACTOR = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 2 * 60 * 60 * 1000;
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  user: String,
  password: String,
  nickname: String,
  role: {
    type: String,
    default: 'user'
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
});

AdminSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }

  next();
});

AdminSchema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (error, hash) {
      if (error) return next(error);

      user.password = hash;
      next();
    });
  });
});

AdminSchema.methods = {
  comparePassword: function comparePassword(_password, password) {
    return new Promise(function (resolve, reject) {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch);else reject(err);
      });
    });
  },

  incLoginAttempts: function incLoginAttempts(user) {
    var that = this;

    return new Promise(function (resolve, reject) {
      if (that.lockUntil && that.lockUntil < Date.now()) {
        that.update({
          $set: {
            loginAttempts: 1
          },
          $unset: {
            lockUntil: 1
          }
        }, function (err) {
          if (!err) resolve(true);else reject(err);
        });
      }
      var updates = {
        $inc: {
          loginAttempts: 1
        }
      };
      if (that.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !that.isLocked) {
        updates.$set = {
          lockUntil: Date.now() + LOCK_TIME
        };
      }

      that.update(updates, function (err) {
        if (!err) resolve(true);else reject(err);
      });
    });
  }
};

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

var mongoose = __webpack_require__(0);
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  issue: String,
  options: {
    type: Array
  },
  answer: {
    type: Number
  },
  completed: [{
    type: String,
    ref: 'MinaUser'
  }],
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
});

QuestionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }

  next();
});

var Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

var mongoose = __webpack_require__(0);
var Schema = mongoose.Schema;

var RecordSchema = new Schema({
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
});

RecordSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }

  next();
});

var Record = mongoose.model('Record', RecordSchema);

module.exports = Record;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

var mongoose = __webpack_require__(0);
var Schema = mongoose.Schema;

var TemporaryRecordSchema = new Schema({
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
});

TemporaryRecordSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }

  next();
});

var TemporaryRecord = mongoose.model('TemporaryRecord', TemporaryRecordSchema);

module.exports = TemporaryRecord;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

var mongoose = __webpack_require__(0);
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  openid: String,
  avatarUrl: String,
  nickname: String,
  role: {
    type: String,
    default: 'user'
  },
  unionid: String,
  province: String,
  country: String,
  city: String,
  gender: String,
  record: {
    type: String,
    ref: 'Record'
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
});

UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }

  next();
});

var MinaUser = mongoose.model('MinaUser', UserSchema);

module.exports = MinaUser;

/***/ },
/* 7 */
/***/ function(module, exports) {

var config = {
  db: 'mongodb://127.0.0.1/dotamina',
  appid: 'wxff809823ead99d17',
  appsecret: '0d1ce506638e6f1c0b05f99417775121'
};

module.exports = config;

/***/ },
/* 8 */
/***/ function(module, exports) {

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'starter',
    meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { hid: 'description', name: 'description', content: 'Nuxt.js project' }],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
  ** Global CSS
  */
  css: ['~assets/css/main.css', 'element-ui/lib/theme-chalk/reset.css', 'element-ui/lib/theme-chalk/index.css'],
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
   ** Build configuration
   */
  plugins: ['~plugins/element-ui'],
  build: {
    /*
     ** Run ESLINT on save
     */
    extend: function extend(config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
    }
  }
};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator__);


var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = __webpack_require__(21);
var resolve = __webpack_require__(23).resolve;
var mongoose = __webpack_require__(0);
var config = __webpack_require__(7);

/*const models = resolve(__dirname, './schema')
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => require(resolve(models, file)))*/
var models = resolve(__dirname, '../database/schema');
fs.readdirSync(models).filter(function (file) {
  return ~file.search(/^[^\.].*js$/);
}).forEach(function (file) {
  __webpack_require__(17)("./" + file);
  // require(resolve(models,file))
});

var database = function database() {

  mongoose.set('debug', true);

  mongoose.Promise = global.Promise;

  mongoose.connect(config.db);

  mongoose.connection.on('disconnected', function () {
    mongoose.connect(config.db);
  });
  mongoose.connection.on('error', function (err) {
    console.error(err);
  });

  mongoose.connection.on('open', _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee() {
    var Admin, user;
    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            console.log('Connected to MongoDB ', config.db);

            Admin = mongoose.model('Admin');
            _context.next = 4;
            return Admin.findOne({
              user: 'admin'
            });

          case 4:
            user = _context.sent;

            if (user) {
              _context.next = 10;
              break;
            }

            console.log('写入管理员数据');

            user = new Admin({
              user: 'admin',
              password: '123456',
              role: 'superAdmin',
              nickname: 'Aditya Sui'
            });

            _context.next = 10;
            return user.save();

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  })));
};

module.exports = database;
/* WEBPACK VAR INJECTION */}.call(exports, "server\\database"))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator__);


var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var router = __webpack_require__(22)();
var WXBizDataCrypt = __webpack_require__(16);
var config = __webpack_require__(7);
var flyio = __webpack_require__(20);
var fly = new flyio();

var Admin = __webpack_require__(2);
var MinaUser = __webpack_require__(6);
var Record = __webpack_require__(4);
var Question = __webpack_require__(3);
var TemporaryRecord = __webpack_require__(5);

router.post('/api/UserWechat/login', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee(ctx, next) {
    var code, url, callback, openId, user, _user;

    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            code = ctx.request.body.code;
            url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + config.appid + '&secret=' + config.appsecret + '&js_code=' + code + '&grant_type=authorization_code';
            _context.next = 4;
            return fly.get(url);

          case 4:
            callback = _context.sent;
            openId = JSON.parse(callback.data).openid;
            user = void 0;
            _context.next = 9;
            return MinaUser.findOne({ openid: openId }).exec();

          case 9:
            user = _context.sent;

            if (user) {
              _context.next = 19;
              break;
            }

            _context.next = 13;
            return new MinaUser({
              openid: openId
            });

          case 13:
            _user = _context.sent;
            _context.next = 16;
            return _user.save();

          case 16:

            ctx.body = {
              success: true,
              stored: false,
              errmsg: '\u65B0\u5EFA\u7528\u6237 openid',
              data: JSON.parse(callback.data)
            };
            _context.next = 23;
            break;

          case 19:
            _context.next = 21;
            return MinaUser.findOne({ openid: openId }).populate('record').exec();

          case 21:
            user = _context.sent;

            ctx.body = {
              success: true,
              stored: true,
              errmsg: '\u8BE5\u7528\u6237\u4FE1\u606F\u5DF2\u5B58\u5728',
              data: user
            };

          case 23:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

router.post('/api/UserWechat/ValidateUser', function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee2(ctx, next) {
    var _ctx$request$body, encryptedData, iv, sessionKey, pc, data, user, record;

    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _ctx$request$body = ctx.request.body, encryptedData = _ctx$request$body.encryptedData, iv = _ctx$request$body.iv, sessionKey = _ctx$request$body.sessionKey;
            pc = new WXBizDataCrypt(config.appid, sessionKey);
            data = pc.decryptData(encryptedData, iv);
            user = void 0;
            _context2.next = 6;
            return MinaUser.findOne({ openid: data.openId }).exec();

          case 6:
            user = _context2.sent;

            if (!user) {
              _context2.next = 27;
              break;
            }

            record = new Record({
              openid: data.openId
            });

            user.nickname = data.nickName;
            user.gender = data.gender;
            user.city = data.city;
            user.province = data.province;
            user.country = data.country;
            user.avatarUrl = data.avatarUrl;
            user.unionId = data.unionId;
            user.record = record._id;

            _context2.next = 19;
            return user.save();

          case 19:
            _context2.next = 21;
            return record.save();

          case 21:
            _context2.next = 23;
            return MinaUser.findOne({ openid: data.openId }).populate('record').exec();

          case 23:
            user = _context2.sent;


            ctx.body = {
              success: true,
              errmsg: '\u7528\u6237\u4FE1\u606F\u5B58\u50A8\u6210\u529F',
              data: user
            };
            _context2.next = 28;
            break;

          case 27:
            ctx.body = {
              success: false,
              errmsg: '\u7528\u6237\u4FE1\u606F\u5B58\u50A8\u5931\u8D25',
              data: null
            };

          case 28:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.post('/api/question/new', function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee3(ctx, next) {
    var issueMsg, issue;
    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            issueMsg = ctx.request.body;
            _context3.next = 3;
            return new Question(issueMsg);

          case 3:
            issue = _context3.sent;


            issue.save();

            ctx.body = {
              success: true,
              data: '\u63D0\u4EA4\u6210\u529F\uFF0C\u611F\u8C22\u60A8\u7684\u9898\u76EE\uFF01'
            };

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, _this);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
router.get('/api/getQuestion', function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee4(ctx, next) {
    var openid, issueIdArray, questions, temporaryrecord, random, newTemporaryRecord;
    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            openid = ctx.query.openid;
            issueIdArray = void 0;
            questions = void 0;
            _context4.next = 5;
            return TemporaryRecord.find({ userId: openid }).exec();

          case 5:
            temporaryrecord = _context4.sent;

            if (!(temporaryrecord.length > 0)) {
              _context4.next = 14;
              break;
            }

            issueIdArray = temporaryrecord.map(function (item) {
              return item.issueId;
            });
            console.log(issueIdArray);
            _context4.next = 11;
            return Question.find({
              completed: {
                $nin: [openid]
              },
              _id: {
                $nin: issueIdArray
              }
            }).exec();

          case 11:
            questions = _context4.sent;
            _context4.next = 17;
            break;

          case 14:
            _context4.next = 16;
            return Question.find({
              completed: {
                $nin: [openid]
              }
            }).exec();

          case 16:
            questions = _context4.sent;

          case 17:
            if (!(questions.length > 0)) {
              _context4.next = 27;
              break;
            }

            random = Math.floor(Math.random() * questions.length);
            _context4.next = 21;
            return new TemporaryRecord({
              issueId: questions[random]._id,
              userId: openid
            });

          case 21:
            newTemporaryRecord = _context4.sent;
            _context4.next = 24;
            return newTemporaryRecord.save();

          case 24:

            ctx.body = {
              success: true,
              errmsg: '\u8FD9\u662F\u7B2C' + (issueIdArray ? issueIdArray.length + 1 : 1) + '\u9053\u9898',
              data: questions[random]
            };
            _context4.next = 28;
            break;

          case 27:
            ctx.body = {
              success: true,
              errmsg: '\u6211\u5468\u96C4\u8C01\u90FD\u4E0D\u670D\u5C31\u670D\u4F60',
              data: null
            };

          case 28:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, _this);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
router.get('/api/updateRecord', function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee5(ctx, next) {
    var _ctx$query, openid, result, issueId, record, issue;

    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _ctx$query = ctx.query, openid = _ctx$query.openid, result = _ctx$query.result, issueId = _ctx$query.issueId;
            _context5.next = 3;
            return Record.findOne({ openid: openid }).exec();

          case 3:
            record = _context5.sent;

            if (!(result === 'true')) {
              _context5.next = 15;
              break;
            }

            _context5.next = 7;
            return Question.findById({ _id: issueId }).exec();

          case 7:
            issue = _context5.sent;


            record.victory += 1;
            record.highLadder += issue.level * 1;

            issue.completed.push(openid);
            _context5.next = 13;
            return issue.save();

          case 13:
            _context5.next = 16;
            break;

          case 15:
            if (result === 'false') {
              record.failure += 1;
              record.highLadder -= 1;
            }

          case 16:
            _context5.next = 18;
            return record.save();

          case 18:

            ctx.body = {
              success: true,
              data: record
            };

          case 19:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, _this);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
router.get('/api/delete/temporary', function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee6(ctx, next) {
    var openid, deleteMsg, record;
    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            openid = ctx.query.openid;
            _context6.next = 3;
            return TemporaryRecord.remove({ userId: openid }).exec();

          case 3:
            deleteMsg = _context6.sent;
            _context6.next = 6;
            return Record.findOne({ openid: openid }).exec();

          case 6:
            record = _context6.sent;

            if (!(deleteMsg.n > Number(record.winStreak))) {
              _context6.next = 11;
              break;
            }

            record.winStreak = deleteMsg.n;

            _context6.next = 11;
            return record.save();

          case 11:

            ctx.body = {
              success: true,
              errmsg: '\u4E34\u65F6\u8BB0\u5F55\u6E05\u9664\u6210\u529F',
              data: record
            };

          case 12:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, _this);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());
// 登录
router.post('/api/login', function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee7(ctx, next) {
    var _ctx$request$body2, username, password, user, match;

    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _ctx$request$body2 = ctx.request.body, username = _ctx$request$body2.username, password = _ctx$request$body2.password;
            user = void 0, match = void 0;
            _context7.prev = 2;
            _context7.next = 5;
            return Admin.findOne({ user: username }).exec();

          case 5:
            user = _context7.sent;

            if (!user) {
              _context7.next = 10;
              break;
            }

            _context7.next = 9;
            return user.comparePassword(password, user.password);

          case 9:
            match = _context7.sent;

          case 10:
            _context7.next = 15;
            break;

          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7['catch'](2);
            throw new Error(_context7.t0);

          case 15:
            if (!match) {
              _context7.next = 18;
              break;
            }

            ctx.session.user = {
              _id: user._id,
              username: user.user,
              nickname: user.nickname,
              role: user.role
            };

            return _context7.abrupt('return', ctx.body = {
              success: true,
              data: {
                username: user.user,
                nickname: user.nickname
              }
            });

          case 18:
            return _context7.abrupt('return', ctx.body = {
              success: false,
              err: '密码错误'
            });

          case 19:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, _this, [[2, 12]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());
module.exports = router;

/***/ },
/* 11 */
/***/ function(module, exports) {

module.exports = require("koa");

/***/ },
/* 12 */
/***/ function(module, exports) {

module.exports = require("koa-bodyparser");

/***/ },
/* 13 */
/***/ function(module, exports) {

module.exports = require("koa-session");

/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports = require("koa2-cors");

/***/ },
/* 15 */
/***/ function(module, exports) {

module.exports = require("nuxt");

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

var crypto = __webpack_require__(19);

function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId;
  this.sessionKey = sessionKey;
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode
  var sessionKey = new Buffer.from(this.sessionKey, 'base64');
  encryptedData = new Buffer.from(encryptedData, 'base64');
  iv = new Buffer.from(iv, 'base64');

  try {
    // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    var decoded = decipher.update(encryptedData, 'binary', 'utf8');
    decoded += decipher.final('utf8');

    decoded = JSON.parse(decoded);
  } catch (err) {
    throw new Error('Illegal Buffer');
  }

  if (decoded.watermark.appid !== this.appId) {
    throw new Error('Illegal Buffer');
  }

  return decoded;
};

module.exports = WXBizDataCrypt;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

var map = {
	"./admin": 2,
	"./admin.js": 2,
	"./question": 3,
	"./question.js": 3,
	"./record": 4,
	"./record.js": 4,
	"./temporaryrecord": 5,
	"./temporaryrecord.js": 5,
	"./user": 6,
	"./user.js": 6
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 17;


/***/ },
/* 18 */
/***/ function(module, exports) {

module.exports = require("bcryptjs");

/***/ },
/* 19 */
/***/ function(module, exports) {

module.exports = require("crypto");

/***/ },
/* 20 */
/***/ function(module, exports) {

module.exports = require("flyio/src/node");

/***/ },
/* 21 */
/***/ function(module, exports) {

module.exports = require("fs");

/***/ },
/* 22 */
/***/ function(module, exports) {

module.exports = require("koa-router");

/***/ },
/* 23 */
/***/ function(module, exports) {

module.exports = require("path");

/***/ },
/* 24 */
/***/ function(module, exports) {

module.exports = require("regenerator-runtime");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_koa__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_koa___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_koa__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nuxt__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nuxt___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_nuxt__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_koa_session__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_koa_session___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_koa_session__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_koa2_cors__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_koa2_cors___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_koa2_cors__);


var start = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee2() {
    var _this = this;

    var app, host, port, config, nuxt, builder, CONFIG;
    return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            app = new __WEBPACK_IMPORTED_MODULE_1_koa___default.a();
            host = process.env.HOST || '127.0.0.1';
            port = process.env.PORT || 7278;

            // Import and Set Nuxt.js options

            config = __webpack_require__(8);

            config.dev = !(app.env === 'production');

            // Instantiate nuxt.js
            nuxt = new __WEBPACK_IMPORTED_MODULE_2_nuxt__["Nuxt"](config);

            // Build in development

            if (!config.dev) {
              _context2.next = 10;
              break;
            }

            builder = new __WEBPACK_IMPORTED_MODULE_2_nuxt__["Builder"](nuxt);
            _context2.next = 10;
            return builder.build();

          case 10:
            app.use(__WEBPACK_IMPORTED_MODULE_4_koa2_cors___default()({
              origin: function origin(ctx) {
                return 'http://127.0.0.1:7278';
              },
              exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
              maxAge: 5,
              credentials: true,
              allowMethods: ['GET', 'POST', 'DELETE'],
              allowHeaders: ['Content-Type', 'Authorization', 'Accept']
            }));
            // body-parser
            app.use(bodyParser());

            // mongodb
            mongodb();

            // session
            app.keys = ['some session'];

            CONFIG = {
              key: 'SESSION', /** (string) cookie key (default is koa:sess) */
              /** (number || 'session') maxAge in ms (default is 1 days) */
              /** 'session' will result in a cookie that expires when session/browser is closed */
              /** Warning: If a session cookie is stolen, this cookie will never expire */
              maxAge: 86400000,
              overwrite: true, /** (boolean) can overwrite or not (default true) */
              httpOnly: true, /** (boolean) httpOnly or not (default true) */
              signed: true, /** (boolean) signed or not (default true) */
              rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
            };

            app.use(__WEBPACK_IMPORTED_MODULE_3_koa_session___default()(CONFIG, app));

            // routes
            app.use(filmApi.routes(), filmApi.allowedMethods());

            app.use(function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.mark(function _callee(ctx, next) {
                return __WEBPACK_IMPORTED_MODULE_0_E_DOTA2Mina_dota2minaAdmin_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return next();

                      case 2:
                        ctx.status = 200; // koa defaults to 404 when it sees that status is unset
                        ctx.req.session = ctx.session;
                        return _context.abrupt('return', new Promise(function (resolve, reject) {
                          ctx.res.on('close', resolve);
                          ctx.res.on('finish', resolve);
                          nuxt.render(ctx.req, ctx.res, function (promise) {
                            // nuxt.render passes a rejected promise into callback on error.
                            promise.then(resolve).catch(reject);
                          });
                        }));

                      case 5:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function (_x, _x2) {
                return _ref2.apply(this, arguments);
              };
            }());

            app.listen(port, host);
            console.log('Server listening on ' + host + ':' + port); // eslint-disable-line no-console

          case 20:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function start() {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }




// after end





var filmApi = __webpack_require__(10);
var mongodb = __webpack_require__(9);
var bodyParser = __webpack_require__(12);

start();

/***/ }
/******/ ]);
//# sourceMappingURL=main.map