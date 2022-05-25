const  {MongoClient}  = require('mongodb')
let client,cachedDb

exports.connect = async () => {
    if (cachedDb) { return cachedDb }
    try {
      const url = `mongodb://${process.env.db_username}:${process.env.db_password}@${process.env.db_url}/?authMechanism=DEFAULT`
      client = await MongoClient.connect(url)
      
      const db = await client.db(process.env.db_name)
  
      cachedDb = db
      return db
    } 
    catch (error) {
      throw error.errmsg }
  }