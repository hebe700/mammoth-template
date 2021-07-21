const redis=require('./redis.js');
const OrderGroupTask=require('../task/orderGroupTask.js');
const OrderDeliveryTask=require('../task/orderDeliveryTask.js');
const GoodsTask=require('../task/goodsTask.js');
const SettlementTask=require('../task/settlementTask.js');
const CommonTask=require('../task/commonTask.js');

//任务统一错误处理函数
const taskWrapper=async (taskFn)=>{
    await taskFn.catch(async (err)=>{
        if(process.env.NODE_ENV==='development'){
            console.log('!!!!!!!!!!!!!队列错误!!!!!!!!!!!!!',err);
        }
        //使用任务存储错误记录
        await redis.lpush('taskQueue',JSON.stringify({
            name:'errToMongo',
            value:{
                name:String(err.name),
                stack:String(err.stack)
            }
        }));
    });
}
//任务调度
(async ()=>{
    while(true){
        let res=await redis.brpop('taskQueue',30);
        if(res===null){
            continue ;
        }
        let task;
        try {
            //res是个数组，res[0]的值都是字符串task，这应该是brpop这个函数固定的返回形式，要将列表中的键和值一起返回
            if(/^\d_delayData.*/gi.test(res[1])){
                //取出延时任务的延时数据，延时数据是对象，name和value属性，其中name是任务名称，value是任务值
                const redisRes=await redis.get(res[1]).then((res)=>{return res;},()=>{return false});
                //延时任务数据不存在了，说明延时任务被删了，那么放弃本次延时任务执行
                if(redisRes===false || redisRes===null){
                    continue ;
                }
                task=JSON.parse(redisRes);
                //数据取出来后，将延时数据删除
                redis.del(res[1]);
            }else{
                task=JSON.parse(res[1]);
            }
        } catch (error) {
            continue ;
        }
        switch(task.name){            
            //创建结算订单
            case 'createSettlementOrder':
                await taskWrapper(SettlementTask.createSettlementOrder(task.value));
                break;
            //服务费用通知
            case 'sendSettlementMessage':
                await taskWrapper(SettlementTask.sendSettlementMessage(task.value));
                break;
            //服务单结算
            case 'paySettlementService':
                await taskWrapper(SettlementTask.paySettlementService(task.value));
                break;

            //代金券领取任务
            case 'getCouponCash':
                await taskWrapper(GoodsTask.getCouponCash(task.value));
                break;

            //bing每日图片下载
            case 'bingDownload':
                await taskWrapper(CommonTask.bingDownload(task.value));
                break;
            //七牛冗余图片清除
            case 'qiniuClean':
                await taskWrapper(CommonTask.qiniuClean(task.value));
                break;
            //所有商户所有在售商品销量统计任务
            case 'caculateAllMerchantGoodsUpsaleSales':
                await taskWrapper(CommonTask.caculateAllMerchantGoodsUpsaleSales(task.value));
                break;
            //单个商户所有在售商品销量统计任务
            case 'caculateOneMerchantGoodsUpsaleSales':
                await taskWrapper(CommonTask.caculateOneMerchantGoodsUpsaleSales(task.value));
                break;

            //异常错误同步
            case 'errToMongo':
                await taskWrapper(CommonTask.errToMongo(task.value));
                break;

            //
            case 'checkMchidOrderApply':
                await taskWrapper(CommonTask.checkMchidOrderApply(task.value));
                break;

            default:
        }
    }
})();