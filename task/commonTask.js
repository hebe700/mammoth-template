const Service=require('../service/service.js');

const fileApi=require('../third/fileApi');

/**
 * 通用任务
 */
class CommonTask extends Service{
    constructor(props){
        super(props);

        this.FileApi=new fileApi();
    }

    /**
     * bing每日图片下载 
     */
    async bingDownload(){
        const url='http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1';
        const resRequest=await this.pro(cb=>{
            this.Request({
                url,
                method:'GET',
                json:true
            },(err,response,data)=>{
                if(!err && response.statusCode===200){
                    if(data.errcode===undefined){
                        cb(this.rs(true,data));
                    }else{
                        cb(this.rs(false));
                    }
                }else{
                    cb(this.rs(false));
                }
            });
        });
        //图片抓取成功就存入redis，抓取失败就酸了
        if(resRequest.status){
            let imgData={
                url:'',
                text:'',
                startDate:'',
                endDate:''
            }
            try {
                const item=resRequest.result.images[0]
                imgData.url=`https://s.cn.bing.net${item.url}`
                imgData.text=item.copyright;
                imgData.startDate=item.startdate;
                imgData.endDate=item.enddate;
                
                //数据存储redis并设置3天有效期
                const bingKey='bingDaliy';
                await this.redis.set(bingKey,JSON.stringify(imgData));
                this.redis.expire(bingKey,this.redisExpire.threeDay);
            } catch (error) {}
        }
        return this.rs(true);
    }

    /**
     * 异常错误记录
     */
    async errToMongo(val){
        const key=this.util.md5(val.stack);
        //检查是否有相同的错误
        const resMongoOne=await this.ErrLogModel.findOneByKey({
            key
        },{
            '_id':false,
            'key':true
        });
        if(!resMongoOne.status){
            return resMongoOne;
        }
        if(resMongoOne.result!==null){
            return this.rs(false,this.msg('该错误信息已存在'));
        }
        const currentDt=this.util.getDate();
        return await this.ErrLogModel.createOne({
            key,
            name:val.name!=undefined?val.name:'',
            stack:val.stack!=undefined?val.stack:'',
            createdate:{
                stamp:currentDt.stamp,
                year:currentDt.year,
                month:currentDt.month,
                date:currentDt.date
            }
        });
    }
}

module.exports=new CommonTask();