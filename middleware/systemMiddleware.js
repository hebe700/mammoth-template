const Service=require('../service/service.js');
let that=null


class SystemMiddlewarService extends Service{
    constructor(props){
        super(props);
        that=this;
    }

    /**
     * 请求日志中间件
     */
    async log(ctx,next){
        const stampStart=new Date().getTime();
        await next();
        const stampEnd=new Date().getTime();
        const request=ctx.request;

        if(process.env.NODE_ENV==='production'){
            that.ReqLogModel.createOne({
                method:request.method,
                url:request.url,
                body:(request.method==='POST' || request.method==='PUT')?JSON.stringify(request.body):'',
                duration:stampEnd-stampStart,
                ip:request.header['x-real-ip'] || '127.0.0.1',
                userAgent:request.header['user-agent'],
                createdate:stampStart
            });
        }
    }
}

module.exports=SystemMiddlewarService;


