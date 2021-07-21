const redis=require('./redis.js');
const util=require('./util');

//启动时候缓存脚本
let timeStart=0,timeEnd=0;
const scriptStr="local valArr=redis.call('zrangebyscore','delayQueue',KEYS[1],KEYS[2]);redis.call('zremrangebyscore','delayQueue',KEYS[1],KEYS[2]);return valArr;";
const scriptSha=util.sha1(scriptStr);
//初次执行并缓存脚本
redis.eval(scriptStr,2,timeStart,timeEnd);

/**
 * 不能简单的用时间循环，可能会产生大量的任务堆积没处理完，下一次轮询就到了
 * 需要一次处理执行完以后5秒钟后，再执行下一次，如果这一次处理比较耗时，那么下一次也会往后延
 */
let loading=false;
const delayFn=async ()=>{
    loading=true;
    //每无效从有序集合里取出一次数据，当前时间到一个月之前
    const dt=new Date();
    timeStart=new Date(dt.setMonth(dt.getMonth()-12)).getTime();
    timeEnd=new Date().getTime();
    const res=await redis.evalsha(scriptSha,2,timeStart,timeEnd);
    //取出来的是数组，可能同一秒中又很多延时任务要处理
    const len=res.length;
    if(len){
        for(let i=0,len=res.length;i<len;i++){
            const item=res[i];
            if(item[0]==='0'){
                await redis.lpush('taskQueue',item);
            }else{
                await redis.lpush('orderQueue',item);
            }
        }
    } 
    loading=false;
}
//执行
(async ()=>{
    setInterval(async ()=>{
        if(!loading){
            delayFn();
        }
    },5000);
})(); 