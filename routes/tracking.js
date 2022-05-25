const express = require('express')
const router = express.Router()
const trackingdb = require('../database/tracking')
const fetch = require('node-fetch')

/**
 * @openapi
 * paths:
 *   /api/tracking/:
 *     get:
 *       tags:
 *       - tracking
 *       summary: Get a list of all game logs
 *       operationId: gettracklogs
 *       produces: 
 *         - application/json
 *       responses:
 *         '200':
 *           description: succesfully retrieved list
 *           schema: 
 *             type: array
 *             items: 
 *               $ref: '#/definitions/Log'
 *         '400':
 *           description: unable to reach database 
 */
 router.get('/', (req,res)=>{ 
    trackingdb.getAllLogs().then( result =>{
        res.send(result)
    }).catch(error =>{
        res.status(401).send(error)
    })
    
})

/**
 * @openapi
 * paths:
 *   /api/tracking/current/{appid}:
 *     get:
 *       tags:
 *       - tracking
 *       summary: Get the current playercount for given appid
 *       operationId: getcurrentcount
 *       produces: 
 *         - application/json
 *       parameters:
 *         - name: appid
 *           in: path
 *           description: unique appid
 *           required: true
 *           default: 427520
 *       responses:
 *         '200':
 *           description: succesfully retrieved item
 *           schema: 
 *               $ref: '#/definitions/Log'
 *         '400':
 *           description: unable to reach database 
 */
 router.get('/current/:id', (req,res)=>{ 
    trackingdb.getCurrentPlayerCount(req.params.id).then( result =>{
        res.send(result)
    }).catch(error =>{
        res.status(401).send(error)
    })
    
})

/**
 * @openapi
 * paths:
 *   /api/tracking/games:
 *     get:
 *       tags:
 *       - tracking
 *       summary: Get a list of all games that are currently being tracked
 *       operationId: gettrackgames
 *       produces: 
 *         - application/json
 *       responses:
 *         '200':
 *           description: succesfully retrieved list
 *           schema: 
 *             type: array
 *             items:
 *               $ref: '#/definitions/Game'
 *         '400':
 *           description: unable to reach database 
 */
 router.get('/games', (req,res)=>{ 
    trackingdb.getAllGames().then( result =>{
        res.send(result)
    }).catch(error =>{
        res.status(401).send(error)
    })
    
})

/**
 * @openapi
 * paths:
 *   /api/tracking/{appid}?from={from}&to={to}:
 *     get:
 *       tags:
 *       - tracking
 *       summary: Get a list of logs from a specific appid
 *       operationId: gettracklogsbyid
 *       produces: 
 *         - application/json
 *       parameters:
 *         - name: appid
 *           in: path
 *           description: unique appid
 *           required: true
 *           default: 427520
 *         - name: from
 *           in: query
 *           description: start search date
 *           required: true
 *           default: 2022-05-11T16:11:05Z
 *         - name: to
 *           in: query
 *           description: end search date
 *           required: true
 *           default: 2022-05-11T17:15:00Z
 *       responses:
 *         '200':
 *           description: succesfully retrieved list
 *           schema: 
 *             $ref: '#/definitions/Log'
 *         '400':
 *           description: unable to reach database 
 */
router.get('/:id', (req,res)=>{
    const {from,to} = req.query
    const id = parseInt(req.params.id)  
    if(from == undefined || to == undefined) return res.status(401).send("missing from and/or to date range")
    trackingdb.getGameLogs(id,from,to).then( result =>{
        res.send(result)
    }).catch( error => res.send(error))
})


/**
 * Function that gets all current active player counts for the games specified in the games collection
 * and inserts those numbers in the database
 */
const crontask = async () =>{
    try {
        trackingdb.getAllGames().then( gamelist =>{
            gamelist.forEach(async game=> {
                const url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.appid}` 
                try {
                    const response = await fetch(url)
                    const body = await response.json() 
                    const q = await trackingdb.insertTracking({
                        "_gameid": game._id,
                        "appid": game.appid,
                        "name": game.name,
                        "datetime" : new Date().toISOString(),
                        "activeusers" : body.response.player_count  
                    })
                }catch (error){ console.log(error) }
            }) 
        })
    } catch(error){ console.log(error) }
}

//interval that determines how often active playercounts are updated
setInterval( ()=>{
    crontask()
} , 1000*60*15)  ///ms, seconds,minutes

module.exports = router