const Redis=require('ioredis');
const Config=require('../config');

const redis=Redis.createClient(6379,Config.dataHost,{
    password:'Victory2019RedisNode',
    reconnect: false,
    retryStrategy:()=>{
        return 20000;
    }
});

module.exports=redis;