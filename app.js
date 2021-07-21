const http=require('http');
const koa=require('koa');

global.Promise = require('bluebird');

//http服务 
const httpServer=new koa();
http.createServer(httpServer.callback()).listen(9999);
//mqtt服务
// const mqttServer=new mosca.Server({
//     http:{
//         port:6666,
//         bundle:true,
//         static:'./'
//     }
//     //port:1883 
// });
// mqttServer.on('ready',()=>{
//     console.log('mqtt connect');
// });

//开发环境，需要fork创建出消息队列和延时任务的子进程
// if(process.env.NODE_ENV==='development'){
//     const childProcess=require('child_process');
//     childProcess.fork('./common/queueDelayDispatch.js'); 
//     childProcess.fork('./common/queueTaskDispatch.js');
//     childProcess.fork('./common/queueOrderDispatch.js');
//     childProcess.fork('./common/scheduleTask.js');
//     console.log('development，fork process');  
// }
//请求体中间件
const koaBody = require('koa-body');
httpServer.use(koaBody());
// //连接数据库
// //const Model=require('./model/model.js');
// //new Model();
// //redis连接
// //require('./common/redis.js');

//全局中间件
httpServer.use(async (ctx,next)=>{
    /*开启跨域*/
    ctx.set({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'POST,DELETE,PUT,GET,OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type,Appid'
    });
    //options预检请求通过
    if(ctx.request.method==='OPTIONS'){
        ctx.body=null;
        return ;
    }
    await next();
});

// //系统中间件
// const systemMiddleware=new (require(__dirname+'/middleware/systemMiddleware.js'))();
// httpServer.use(systemMiddleware.log);

// /*
// * 控制器路由
// * */
httpServer.use(require(__dirname+'/controller/userController.js').routes());
