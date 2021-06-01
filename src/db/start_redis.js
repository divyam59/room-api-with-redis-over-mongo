const redis = require('redis')

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);

client.on('connect',()=>console.log('connected to redis'));

module.exports =client