const Service=require('../service/service.js');
const schedule=require('node-schedule');

class ScheduleTask extends Service{
    constructor(props){
        super(props);
        
        //每天凌晨零点半启动背景图的下载更新
        schedule.scheduleJob('0 30 0 * * *',()=>{
            //this.pushTaskQueue('bingDownload');
        });


        //每天凌晨三点刷新蜂鸟token

        //每天下午三点刷新蜂鸟token
    }
}

module.exports=new ScheduleTask();