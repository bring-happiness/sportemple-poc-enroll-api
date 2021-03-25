const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db;

function mongoConnect (callback) {
  const connection = MongoClient.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-chojn.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`)
    .then(client => {
      _db = client.db()
      callback()
    })
    .catch(error => {
      console.log(error)
      throw error
    })
}

function getDb () {
  if (_db) {
    return _db
  }

  throw 'No database find'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb
