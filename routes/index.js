const express = require('express')
const router = express.Router()
const tracking = require('./tracking.js')

router.use('/tracking',tracking)

module.exports = router