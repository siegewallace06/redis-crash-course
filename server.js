// simple express server to test redis

// import express
const express = require('express');
// import axios
const axios = require('axios');
// import cors
const cors = require('cors');
// import redis
const redis = require('redis');

// Default Expiration time for redis cache
const EXPIRATION_TIME = 3600;

// create redis client
const redisClient = redis.createClient();

const app = express();
app.use(cors());

// photos endpoint
// GET request from: https://jsonplaceholder.typicode.com/photos
app.get('/photos', async (req, res) => {
    // set albumId
    const albumId = req.query.albumId;
    // make the request
    const { data } = await axios.get(
        'https://jsonplaceholder.typicode.com/photos',
        { params: { albumId } }
    );
    // Set data to Redis
    redisClient.SETEX('photos', EXPIRATION_TIME, JSON.stringify(data));


    // send the response
    res.json(data);
    // Check if photos is in redis cache
    redisClient.GET('photos', async (err, photos) => {
        if (err) console.log(err);  

        if (photos !== null) {
            console.log('photos is in redis cache');
            // if photos is in cache, return photos from cache
            res.json(JSON.parse(photos));
        }
        else {
            console.log('photos is not in redis cache');
            // make the request
            const { data } = await axios.get(
                'https://jsonplaceholder.typicode.com/photos',
                { params: { albumId } }
            );
            // Set data to Redis
            redisClient.SETEX('photos', EXPIRATION_TIME, JSON.stringify(data));

            // send the response
            res.json(data);
        }
    })
});

// GET request from: https://jsonplaceholder.typicode.com/:id
app.get('/photos/:id', async (req, res) => {
    const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    )
    res.json(data);
});

// start the server
app.listen(3000, () => {
    // console log listening to localhost:3000
    console.log('Listening on localhost:3000');
})
