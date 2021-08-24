const Request=require('request');
const fs=require('fs');
const path=require('path');

//超类
const SuperClass=require('../common/class.js');

//模型类
const UserModel=new (require('../model/userModel.js'))();

class Service extends SuperClass{
    constructor(props){
        super(props);
        //基础对象
        this.Request=Request;

        this.UserModel=UserModel;
    }

    /**
     * 加入任务队列
     */
    async pushTaskQueue(taskName,taskValue){
        return await this.io(this.redis.lpush('taskQueue',JSON.stringify({
            name:taskName,
            value:taskValue
        })));
    }

    //加入task延时任务
    async addTaskDelay(delayKey,taskTime,taskName,taskValue){
        //加入延时任务
        const delayDataKey=`0_delayData:${delayKey}`;
        const resRedis=await Promise.all([
            //任务
            this.io(this.redis.zadd('delayQueue',taskTime,delayDataKey)),
            //任务数据
            this.io(this.redis.set(delayDataKey,JSON.stringify({
                name:taskName,
                value:taskValue
            })))
        ]);         
        if(!resRedis[0].status || !resRedis[1].status){
            return this.rs(false,this.redisErr);
        }   
        return this.rs(true);
    }

    //删除task延时任务
    async delTaskDelay(delayKey){
        const keyDelayTask=`0_delayData:${delayKey}`;
        const redisRes=await Promise.all([
            //删除任务数据
            this.io(this.redis.zrem('delayQueue',keyDelayTask)),
            //删除数据
            this.io(this.redis.del(keyDelayTask))
        ]);
        if(!redisRes[0].status || !redisRes[1].status){
            return this.rs(false,this.redisErr);
        }
        return this.rs(true);
    }

    //获取task延时任务数据
    async getTaskDelay(delayKey){
        const keyDelayTask=`0_delayData:${delayKey}`;
        const resRedis=await Promise.all([
            //获取任务数据
            this.io(this.redis.get(keyDelayTask)),
            //取任务时间
            this.io(this.redis.zscore('delayQueue',keyDelayTask)),
        ]);
        if(!resRedis[0].status || !resRedis[1].status){
            return this.rs(false,this.redisErr);
        }
        if(resRedis[0].result===null && resRedis[1].result===null){
            return this.rs(true,null);
        }else if(resRedis[0].result===null || resRedis[1].result===null){
            //只要有一个为空，那么任务及时无效的，执行删除
            await Promise.all([
                //删除任务
                this.io(this.redis.zrem('delayQueue',keyDelayTask)),
                //删除任务数据
                this.io(this.redis.del(keyDelayTask))
            ])
            return this.rs(true,null);
        }
        return this.rs(true,{
            data:resRedis[0].result && JSON.parse(resRedis[0].result),
            date:resRedis[1].result && JSON.parse(resRedis[1].result)
        });
    }

    /**
     * 存储任务结果
     */
    async saveAsyncRes(key,status,data=null){
        return await Promise.all([
            //存储任务结果
            this.io(this.redis.set(key,JSON.stringify({
                status,
                result:data
            }))),
            //设置任务结果过期时间
            this.io(this.redis.expire(key,this.redisExpire.oneHour))
        ]);
    }
    
    /**
     * 生成编号，18位，用于商品订单号、拼单号、小程序订单号
     */
    generateOrderNo(){
        const dt=new Date();
        const dtYear=dt.getFullYear();
        let dtMonth=dt.getMonth()+1;
        let dtDate=dt.getDate();
        dtMonth=String(dtMonth).length===1?`0${dtMonth}`:dtMonth;
        dtDate=String(dtDate).length===1?`0${dtDate}`:dtDate;
        //获取秒数
        let seconds=String(dt.getHours()*3600+dt.getMinutes()*60+dt.getSeconds());
        let n=5-seconds.length;
        let zero='';
        while(n>0){
            zero+='0';
            n--;
        }
        seconds=`${zero}${seconds}`;
        return `${String(dtYear).substr(-2)}${dtMonth}${dtDate}${seconds}${this.util.randomLength(11)}`;
    }

    /**
     * 数据加解密，flag为true加密，false解密
     */
    cipherReversible(str,flag=true){
        if(!flag){
            return this.util.aesDecode(str,this.config.key);
        }
        return this.util.aesEncode(str,this.config.key);
    }

    /**
     * cipherIrreversible
     */
    cipherIrreversible(str){
        return this.util.md5(`${this.config.key}${str}${this.config.key}`);
    }

    /**
     * 上传文件目录处理
     */
    async getUploadDirPath(){
        const dirPath=path.resolve(__dirname,'../../upload');
        //检查文件目录是否存在
        const resFsExists=await this.pro(cb=>{
            fs.exists(dirPath,(bool)=>{
                cb(bool);
            });
        });
        //没有目录则创建目录
        if(!resFsExists){
            await this.pro(cb=>{
                fs.mkdir(dirPath,()=>{
                    cb(true);
                });
            });
        }
        return dirPath
    }

    
    /**
     * 获取模型分页列表数据
     */
    async getPageList(modelName='',condition={},fields=''){
        condition=this.queryPageFormat(condition);
        const resMongoOne=await this[modelName].findMore(condition);
        if(!resMongoOne.s){
            return resMongoOne;
        }
        let totalPage;
        if(resMongoOne.r!==null){
            totalPage=this.listMaxPage;
        }else{
            //查询
            const resMongoTwo=await this[modelName].findCount(condition);
            if(!resMongoTwo.s){
                return resMongoTwo;
            }
            if(resMongoTwo.r===0){
                totalPage=1;
            }else{
                const page=Math.ceil(resMongoTwo.r/this.listLength);
                totalPage=page>this.listMaxPage?this.listMaxPage:page;
            }
        }
        const resMongoThree=await this[modelName].findMany(condition,fields);
        if(!resMongoThree.s){
            return resMongoThree;
        }
        return this.rs(true,{
            items:resMongoThree.r,
            totalPage
        });
    }
    
    /**
     * 七牛记录更新
     */
    async qiniuKeyRefresh(param={
        fid:'',
        type:'',
        key:'',
        typeDelete:false
    }){
        param=Object.assign({
            fid:'',
            type:'',
            key:'',
            typeDelete:false
        },param);
        const currentDt=this.util.getDate();
        const resMongoOne=param.typeDelete?await this.QiniuModel.deleteManyByFidType({
            fid:param.fid,
            type:param.type
        }):await this.QiniuModel.deleteManyByFid({
            fid:param.fid
        });
        if(!resMongoOne.status){
            return resMongoOne;
        }
        return await this.QiniuModel.createOne({
            fid:param.fid,
            type:param.type,
            key:param.key,
            createdate:{
                stamp:currentDt.stamp,
                year:currentDt.year,
                month:currentDt.month,
                date:currentDt.date
            }
        });
    }

    /**
     * 生成二维码
     */
    async generateRegisterKey(param={
        type:''//0是包年模式，1是费率模式
    }){
        const key=this.util.randomNoncestr(4);
        const keyRegisterKey=`key.register.${key}`;
        //写入
        await Promise.all([
            //写入
            this.io(this.redis.set(keyRegisterKey,JSON.stringify({
                type:param.type
            }))),
            //过期时间
            this.io(this.redis.expire(keyRegisterKey,this.redisExpire.threeDay))
        ]);
        return key;
    }  

    /**
     * 图片裁剪
     */
    async qiniuCrop(url,FileApi){
        const dirPath=await this.getUploadDirPath();
        const fileName=`${this.util.md5(url)}.png`;
        const filePath=`${dirPath}/${fileName}`;
        //将七牛图片url中的https改为http，避免七牛的Https
        //裁剪图片下载到本地再上传到七牛
        const resQiniu=await this.pro(cb=>{
            try {
                const stream=this.Request(url.replace(/^https/gi,'http')).pipe(fs.createWriteStream(filePath));
                stream.on('finish',async ()=>{
                    return cb(await FileApi.qiniuUpload(this.util.md5(fileName),fs.createReadStream(filePath)));
                });
            } catch (error) {
                return cb(this.rs(false,this.msg('图片上传错误')));   
            }
        });
        if(!resQiniu.status){
            return resQiniu;
        }
        //临时图片要删除
        fs.unlink(filePath,()=>{});
        resQiniu.result.w=Number(resQiniu.result.w);
        resQiniu.result.h=Number(resQiniu.result.h);
        return resQiniu;
    }

    
}

module.exports=Service;
