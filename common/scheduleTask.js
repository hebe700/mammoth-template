const Service=require('../service/service.js');
const schedule=require('node-schedule');

class ScheduleTask extends Service{
    constructor(props){
        super(props);
        
        //每天凌晨零点半启动背景图的下载更新
        schedule.scheduleJob('0 30 0 * * *',()=>{
            this.pushTaskQueue('bingDownload');
        });

        //每天的凌晨一点启动对所有商户商品销量的统计
        schedule.scheduleJob('0 0 1 * * *',()=>{
            this.pushTaskQueue('caculateAllMerchantGoodsUpsaleSales');
        }); 
        
        //凌晨四点启动七牛冗余图片清除
        schedule.scheduleJob('0 0 4 * * *',()=>{
            this.pushTaskQueue('qiniuClean');
        }); 

        //每天凌晨三点刷新蜂鸟token

        //每天下午三点刷新蜂鸟token
    }
}

module.exports=new ScheduleTask();