let express = require('express'),
  cors = require('cors'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  constants = require('./constants'),
  scheduler = require('./scheduler'),
  logger = require('./logger')

const serviceAPI = require('./routes/service.route')

mongoose.Promise = global.Promise
mongoose
  .connect(constants.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(
    () => {
      logger.info('MongoDB Connected')
      runApp()
    },
    (error) => {
      logger.error('MongoDB could not be connected due to: ' + error)
    }
  )

// We wait for DB to initialize, without it the app is useless
function runApp() {
  const app = express()
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  )
  app.use(cors())

  app.use('/api', serviceAPI)

  const port = process.env.APP_PORT || 4000

  app.listen(port, () => {
    logger.info('Super running on port: ' + port)
  })

  app.use((req, res, next) => {
    return res.status(404).send({ message: 'Route' + req.url + ' Not found.' })
  })

  app.use((err, req, res, next) => {
    logger.error(err.message)
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.message)
  })

  scheduler.startScheduler()
}