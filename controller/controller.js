const Router=require('koa-router');
const config=require('../config.js');
const util=require('../common/util.js');

const BusinessMiddleware=new (require('../middleware/businessMiddleware.js'))();

const UserService=new (require('../service/userService.js'))();

const fileApi=require('../third/fileApi');
const emailApi=require('../third/emailApi');

class Controlelr extends Router{
    constructor(props){
        super(props);
        this.config=config;
        this.util=util;

        this.response=BusinessMiddleware.response.bind(BusinessMiddleware);
        this.valiParams=BusinessMiddleware.valiParams.bind(BusinessMiddleware);
        // this.valiSystemAdmin=BusinessMiddleware.valiSystemAdmin.bind(BusinessMiddleware);
        // this.valiWebMerchant=BusinessMiddleware.valiWebMerchant.bind(BusinessMiddleware);
        // this.valiWechatConsumerWeapp=BusinessMiddleware.valiWechatConsumerWeapp.bind(BusinessMiddleware);
        // this.valiWechatConsumerUser=BusinessMiddleware.valiWechatConsumerUser.bind(BusinessMiddleware);
        // this.valiWechatMerchantWeapp=BusinessMiddleware.valiWechatMerchantWeapp.bind(BusinessMiddleware);
        // this.valiWechatMerchantUser=BusinessMiddleware.valiWechatMerchantUser.bind(BusinessMiddleware);
        
        this.UserService=UserService;   

				this.FileApi=new fileApi();
				this.EmailApi=new emailApi()
			
				this.prefix=props.prefix.slice(1).charAt(0).toUpperCase() + props.prefix.slice(2);
				this.service=`${this.prefix}Service`
    }

    //返回函数
    rs(status,result=undefined){
        if(result===undefined){
            return {
                status
            }
        }
        return {
            status,
            result
        } 
    }

		reqGet(path,validateQuery=null){
			return this.get(path,this.response,validateQuery!==null?this.valiParams('query',validateQuery):async (ctx,next)=>{
				return await next()
			},this.reqWrapper(this.service,path.slice(1)))
		}

		reqPost(path,validateBody=null,validateQuery=null){
			return this.post(path,this.response,validateQuery!==null?this.valiParams('query',validateQuery):async (ctx,next)=>{
				return await next()
			},validateBody!==null?this.valiParams('body',validateBody):async(ctx,next)=>{
				return await next()
			},this.reqWrapper(this.service,path.slice(1)))
		}

    reqWrapper(service,method,fn){
        return async (ctx)=>{
            ctx.hook={
                UserService,   
            }
            ctx.third={
                FileApi:this.FileApi,
								EmailApi:this.EmailApi
            }
            if(fn!==undefined){
                const resFn=fn(ctx);
                //如果有返回值，this.rs返回的响应对象，有响应对象就结束请求，无响应对象继续往后执行
                if(resFn!==undefined){
                    return {
                        status:resFn.s,
                        result:resFn.r
                    };
                }
            }
						let res
						try {
							res= await this[service][method](ctx.bodyFormat || ctx.request.body,ctx.request.query,ctx)
						} catch (error) {
							//console.log(error)
							if(process.env.NODE_ENV==='development'){
								console.log('!!!!!!!!!!!!!主线程错误!!!!!!!!!!!!!',error);
							}
							// await this[service].pushTaskQueue('errToMongo',{
							// 		name:String(error.name),
							// 		stack:String(error.stack)
							// });
							return {
								status:false,
								result:{
									message:'服务器500错误'
								}
							}
						}
            return {
                status:res?.s??false,
                result:res?.r??''
            }
        }
    }
}

module.exports=Controlelr;