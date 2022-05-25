require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const router = require('./routes/index')
const swaggerUI = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    definition: {
        swagger: "2.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "A simple Express Library API",
        },
        servers: [
            {
                url: `http://${process.env.API_ADRESS}:${process.env.API_PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js','./database/*.js','index.js'],
};


app.use(cors())
app.use('/api',router)
app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(options)));

console.log(`Listening on http://${process.env.API_ADRESS}:${process.env.API_PORT}`)
app.listen(process.env.API_PORT)