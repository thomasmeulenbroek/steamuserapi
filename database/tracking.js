const { disabled } = require('express/lib/application')
const db = require('./connection')
/**
 * @openapi
 * definitions:    
 *   Game:
 *     type: object
 *     properties: 
 *       _id: 
 *         type: integer
 *         format: bson
 *         default: 626fcf77a03e511b72bdd9f5
 *       name: 
 *         type: string
 *         default: Factorio
 *       header: 
 *         type: string
 *         default: https://cdn.cloudflare.steamstatic.com/steam/apps/427520/header.jpg?t=1648824588
 *       appid: 
 *         type: integer  
 *         default: 427520        
 */
/**
 * Get a list of all currently tracked games
 * @returns Promise
 */
exports.getAllGames = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.connect()
            resolve(await conn.collection('games').find({}).toArray())
        } catch (error) {
            reject(error)
        }
    })
}


/**
 * @openapi
 * definitions:    
 *   Log:
 *     type: object
 *     properties: 
 *       _id: 
 *         type: integer
 *         format: bson
 *         default: 627919f1c68b386a3fad4ad0
 *       _gameid: 
 *         type: integer
 *         format: bson
 *         default: 626fcf77a03e511b72bdd9f5
 *       appid: 
 *         type: integer  
 *         default: 427520    
 *       name: 
 *         type: string
 *         default: Factorio
 *       datetime:
 *         type: string
 *         format: ISODate
 *         default: 2022-05-09T13:41:05.138Z
 *       activeusers: 
 *         type: integer
 *         default: 12513
 *    
 */
/**
 * Get logs from a specific game between certain dates
 * @param {number} appid
 * @param {Datetime} from
 * @param {Datetime} to
 * @returns Promise
 */
exports.getGameLogs = async (id,from,to) => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.connect()
            const search = {
                appid: parseInt(id),
                datetime: {
                    '$gte': new Date(from).toISOString(),
                    '$lte': new Date(to).toISOString(),
                }
            }
            resolve(await conn.collection('tracking').find(search).toArray())
        } catch (error) {
            reject(error)
        }
    })
}

exports.getCurrentPlayerCount = async (id) =>{
    return new Promise( async(resolve, reject)=>{
        try{
            const conn = await db.connect()
            const search = {
                appid: parseInt(id)
            }

            resolve(await conn.collection('tracking').find({appid: parseInt(id)}).sort({_id: -1}).limit(1).toArray())
        }
        catch(error){
            reject(error)
        }
    })
}

/**
 * Get all tracking logs
 * @returns Promise
 */
exports.getAllLogs = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.connect()
            resolve(await conn.collection('tracking').find({}).toArray())
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Insert new log into tracking collection
 * @returns Promise
 */
exports.insertTracking = async (log) => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.connect()
            resolve(await conn.collection('tracking').insertOne(log))
        } catch (error) {
            reject(error)
        }
    })
}