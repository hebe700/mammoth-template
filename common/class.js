
/*
* 超类，该类会被controller基类，service基类，model基类继承
*
* */
//配置文件
const config=require('../config.js');
//工具函数
const util=require('./util.js');
//引入redis挂在
//const redis=require('../common/redis.js');
const xmlParse=require('xml2js').parseString;

class SuperClass{
    constructor(){
        this.config=config;
        this.util=util;
        //this.redis=redis;
        this.ctx=null;

        this.xmlParse=xmlParse;

        this.listLength=10; //分页列表数据长度
        this.listMaxLength=500;//分页允许查询的最大文档数量
        this.listMaxPage=50; //分页列表允许的最大页码数

        this.redisErr={message:'缓存系统错误'};
        this.redisNull={message:'缓存数据不存在，请刷新重试'};
        this.mongoErr={message:'数据处理失败'};
        this.mongoNull={message:'未匹配到目标数据'};
        this.weappErr={message:'小程序信息获取失败'};
        this.promiseErr={message:'promise err'}
        this.promiseNull={message:'promise null'}

        this.redisExpire={
            oneMinute:60,
            fiveMinute:300,
            tenMinute:600,
            fifteenMinute:900,
            oneHour:3600,
            twoHour:7200,
            halfDay:43200,
            oneDay:86400,
            twoDay:172800,
            threeDay:259200,
            tenDay:864000,
            oneWeek:604800,
            oneMonth:2592000 //一个月默认30天
        }
    }

    //promise容器，简化Promise的书写，返回promise对象，可以直接用于async/await，同步化书写时省去每次都new Promise
    async pro(fn){
        return await new Promise((resolve)=>{
            fn(resolve);
        });
    }

    //reids io
    async io(redis){
        return await redis.then((res)=>{
            return this.rs(true,res);
        },(err)=>{
            if(process.env.NODE_ENV==='development'){
                console.log(err);
            }
            return this.rs(false,this.redisErr);
        });
    }

    fail(err){
				return this.rs(false,{
            message:err??'请求失败'
        })
    }

    succ(data){
        return this.rs(true,data)
    }

    //生成回送对象
    rs(status,result=undefined){
        if(result===undefined){
            return {
                s:status
            }
        }
        return {
            s:status,
            r:result
        } 
    }

    //生成错误信息（验证码请求失败了，会返回剩余时间，以及错误字段）
    msg(str,obj={
        data:undefined,
        field:undefined
    }){
        if(obj.data!==undefined){
            return this.filterObj({
                message:str,
                field:obj.field,
                data:obj.data
            },['message','field','data'],true)
        }
        return this.filterObj({
            message:str,
            field:obj.field
        },['message','field'],true);
    }

    mongoWrapper(pro,update=false){
        return pro.then((res)=>{
            if(update){
                if(res.n){
                    return Promise.resolve(this.rs(true,res));
                }else{
                    return Promise.resolve(this.rs(false,this.msg('未匹配目标数据，无法修改')));
                }
            }else{
                return Promise.resolve(this.rs(true,res));
            }
        },(err)=>{
            if(process.env.NODE_ENV==='development'){
                console.log(err)
            }
            return Promise.resolve({
                s:false,
                r:{
                    message:'colleciton error'
                }
            });
        });
    }

		//将字符串字段处理为对象
    mongoFields(fields){
			const fieldsObj={}
      if(fields!==''){
				const arr=fields.split(' ')
				for(let i=0,len=arr.length;i<len;i++){
					const e=arr[i]
					fieldsObj[e]=1
				}
			}
			return fieldsObj
    }

    //创建副本
    copy(obj,...args){
        return JSON.parse(JSON.stringify(obj))
    }

    //列表最大页码处理
    queryPageFormat(condition,maxPageLimit=true){
        if(condition.page===undefined || !/\d+/gi.test(condition.page)){
            condition.page=1;
        }
        condition.page=Number(condition.page);
        if(condition.page===0){
            condition.page=1;
        }
        if(maxPageLimit && condition.page>this.listMaxPage){
            condition.page=this.listMaxPage;
        }
        return condition;
    }

    //对象字段过滤
    filterObj(obj={},fields=[],removeUndefined=false){
        //根据指定字段，返回过滤字段的对象，同时决定过滤后字段的值为undefined是否删除
        //如果数组为空，那么直接返回obj对象，需要是新的副本，也可以使用removeUndefined移除对象里值为undefined的属性
        const objNew=JSON.parse(JSON.stringify(obj));
        if(fields.length===0){
            //如果不需要移除直接返回副本对象
            if(!removeUndefined){
                return objNew;
            }
            //需要移除就需要遍历对象
            const entries=Object.entries(obj);
            for(let i=0,len=entries.length;i<len;i++){
                const item=entries[i];
                if(item[1]===undefined){
                    delete objNew[item[0]];
                }
            }
            return objNew;
        }
        //有过滤字段
        const objFilter={};
        const keys=Object.keys(obj);
        for(let i=0,len=fields.length;i<len;i++){
            const item=fields[i];
            //检查字段名是否在对象属性列表里，如果不在，也就是指定了其他的字段名，那么不会加入到新对象
            if(keys.indexOf(item)===-1){
                continue ;   
            }
            //检查是否需要移除undefined，需要就还要判断其值是否为undefiend
            if(removeUndefined){
                //如果值不为undefiend，那么就加入到新对象
                if(objNew[item]!==undefined){
                    objFilter[item]=objNew[item];
                }    
            }else{
                //不检查undefiend
                objFilter[item]=objNew[item];
            }
        }
        return objFilter;
    }

}

module.exports=SuperClass;