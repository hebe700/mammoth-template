const Service=require('../service/service.js');

class businessMiddlewarService extends Service{
    constructor(props){
        super(props);

        this.rs=(status,result=undefined)=>{
            if(result===undefined || result===undefined===null){
                return {
                    status
                }
            }
            return {
                status,
                result
            } 
        }
        this.msg=(str)=>{
            return {
                message:str,
            };
        }
        this.noLogin='身份验证失败'
        this.noAuth='暂无权限'

        //验证规则，query与body通用
        this.rulesVali={
            emptyValidate:(value,ruleValue)=>{
                if(value!==undefined && value!==''){
                    if(this.util.trim(String.value)===''){
                        return false;
                    }
                    return true;
                }
                return false;
            },
            //数据类型验证
            typeValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                const valueType=this.util.getType(value);
                if(this.util.getType(ruleValue)==='array'){
                    if(ruleValue.indexOf(valueType.toLowerCase())!==-1){
                        return true;
                    }
                }else{
                    if(valueType===ruleValue.toLowerCase()){
                        return true;
                    }
                }
                return false;
            },
            //整形数字验证，包括Number类型与String类型
            intValidate:(value,ruleVal)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(/^\d+$/gi.test(String(value))){
                    return true
                }
                return false;
            },
            //相等验证
            equalValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(ruleValue===undefined || ruleValue===''){
                    return true;
                }
                //相等就要返回tue
                return value===ruleValue;
            },
            //不相等验证
            notEqualValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(ruleValue===undefined || ruleValue===''){
                    return true;
                }
                return value!==ruleValue;
            },
            //字符串最小长度比较
            minLengthValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(this.util.trim(String(value)).length>=ruleValue){
                    return true;
                }
                return false;
            },
            //字符串最大长度比较
            maxLengthValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(this.util.trim(String(value)).length<=ruleValue){
                    return true;
                }
                return false;
            },
            //字符串等值长度比较
            eqLengthValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(this.util.trim(String(value)).length===ruleValue){
                    return true;
                }
                return false;
            },
            //数字范围比较
            minNumberValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                //value以数组传值，需要值为number类型
                if(typeof value!=='number'){
                    return false;
                }
                //获取判断符号
                const operator=ruleValue[0];
                const ruleVal=ruleValue[1];
                if(operator==='gt'){
                    if(value>ruleVal){
                        return true;
                    }
                    return false;
                }
                if(operator==='gte'){
                    if(value>=ruleVal){
                        return true;
                    }
                    return false;
                }
            },
            //数字范围比较
            maxNumberValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                //value以数组传值，需要值为number类型
                if(typeof value!=='number'){
                    return false;
                }
                //获取判断符号
                const operator=ruleValue[0];
                const ruleVal=ruleValue[1];
                if(operator==='lt'){
                    if(value<ruleVal){
                        return true;
                    }
                    return false;
                }
                if(operator==='lte'){
                    if(value<=ruleVal){
                        return true;
                    }
                    return false;
                }
            },
            //是否在数组中
            inValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                if(ruleValue.indexOf(value)!==-1){
                    return true;
                }
                return false;
            },
            //手机格式验证
            phoneValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                return /^1\d{10}$/g.test(value);
            },
            //电子邮箱验证
            emailValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                return /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/gi.test(value);
            },
            //金额格式验证
            moneyValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                return /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/gi.test(value);
            },
            //正则验证
            regValidate:(value,ruleValue)=>{
                if(value===undefined || value===''){
                    return true;
                }
                return new RegExp(ruleValue).test(value);
            },
        }
    }

    //数据响应中间件
    async response(ctx,next){
        ctx.body=await next();
    }

    //query参数验证中间件，外部普通函数，返回中间件函数
    valiParams(type,paramsObj){
        //node启动阶段就提取出传入的参数
        const arr=Object.entries(paramsObj);
        return async (ctx,next)=>{
            let param;
            if(type==='query'){
                param=ctx.request.query;
            }else{
                param=ctx.request.body;
            }
            let res;
            //外层字段循环
            for(let i=0,len=arr.length;i<len;i++){
                const item=arr[i];
                //验证函数里定义merchant.cover.url然后值为验证对象，需要取出merchant对象下cover对象url的属性值
                //这就需要一层层遍历下去，直到最后一层，找到url这个属性的值，然后赋给这里的变量
                //有可能传递的数据中，按照指定的格式遍历到中间，可能就提示为undefined，这会引起系统错误，此时直接要停止遍历，并返回验证失败
                let val;
                if(item[0].indexOf('.')!==-1){
                    const fieldsArr=this.util.split(item[0],'.');
                    let tempVal=param[fieldsArr[0]];
                    if(tempVal===undefined){
                        //结束当前字段的处理，进入下一个大循环处理下一个字段，这是祭祀就放任过去了，这里要返回错误
                        return this.rs(false,this.msg(`${item[0]}验证失败：无法读取目标值`));
                    }
                    try{
                        for(let i=1,len=fieldsArr.length;i<len;i++){
                            const itemField=fieldsArr[i];
                            //有可能读取不到值，提示为undefined，再往下读取会报错。也有可能就是最后一个属性，值本身就是undefined
                            //如果最后一个属性的值为undefined那是正常的，但如果中间出现undefined导致无法而抛出错误，那就表明验证失败
                            tempVal=tempVal[itemField];
                        }
                    }catch(error) {
                        return this.rs(false,this.msg(`${item[0]}验证失败：无法读取目标值`));
                    }
                    //值读取成功正常赋值
                    val=tempVal;
                }else{
                    val=param[item[0]];
                }
                //内层规则循环
                let outerBreak=false;
                let outerContinue=false;
                const fieldObj=item[1];//字段对象
                const ruleKeys=Object.keys(fieldObj);
                //检查是否有disabled函数，就则将其提到第一个数组第一个
                const disableValIndex=ruleKeys.indexOf('disabled');
                if(disableValIndex!==-1){
                    const spliceArr=ruleKeys.splice(disableValIndex,1);
                    ruleKeys.unshift(spliceArr[0]);
                }
                //遍历验证名和验证值
                for(let i=0,len=ruleKeys.length;i<len;i++){
                    const ruleKey=ruleKeys[i];
                    const ruleVal=fieldObj[ruleKey];
                    if(ruleKey==='disabled'){
                        //执行禁用函数，如果return true则表示禁用这个字段验证
                        //此时需要终止内层规格组的循环，跳出到外层循环，然后continue让外层循环遍历下一个字段
                        let res;
                        try {
                            res=await ruleVal(val,type==='query'?ctx.request.query:ctx.request.body,ctx);
                        } catch (error) {
                            if(process.env.NODE_ENV==='development'){
                                console.log('中间件disabled函数错误',error)
                            }
                            //如果验证错误， 那么就当作不禁用
                            res=false;
                        }
                        //disabled返回true，则表示禁用
                        if(res){
                            outerContinue=true;
                            break;
                        }
                    }else if(ruleKey==='validate'){
                        //自定义验证函数，这里是有可出错的
                        if(val==='' || val===undefined){
                            continue ;
                        }
                        let validateFnRes;
                        try {
                            validateFnRes=await ruleVal(val,type==='query'?ctx.request.query:ctx.request.body,ctx);
                        } catch (error) {
                            if(process.env.NODE_ENV==='development'){
                                console.log('中间件validate函数错误',error)
                            }
                            validateFnRes='errFn 请检查值是否有效';
                        }
                        if(validateFnRes!==true){
                            res=this.rs(false,this.msg(`${type}验证失败：${validateFnRes}`))
                            outerBreak=true;
                            break;
                        }      
                    }else{
                        //常规规则验证
                        const rule=this.rulesVali[`${ruleKey}Validate`];
                        if(ruleKey==='empty' && ruleKey,ruleVal[2]!==undefined){
                            const resEmptyDisabled=ruleVal[2](val,type==='query'?ctx.request.query:ctx.request.body,ctx);
                            if(resEmptyDisabled){
                                continue ;
                            }
                        }
                        if(rule!==undefined && !rule(val,ruleVal[0])){
                            res=this.rs(false,this.msg(`${type}验证失败：${ruleVal[1]}`))
                            outerBreak=true;
                            break ;
                        }
                        
                    }
                }
                if(outerContinue){
                    continue;
                }
                //里层循环终结了，那么也结束外层循环
                if(outerBreak){
                    break;
                }
            }
            if(res===undefined){
                let bodyFormat={}
                if(type==='body'){
                    try {
                        const body=ctx.request.body;
                        const fields=Object.keys(paramsObj);
                        for(let i=0,len=fields.length;i<len;i++){
                            const item=fields[i];
                            if(item.indexOf('.')!==-1){
                                const arr=item.split('.');
                                //检查内嵌对象是否存在
                                if(bodyFormat[arr[0]]===undefined){
                                    bodyFormat[arr[0]]={
                                        [arr[1]]:body[arr[0]][arr[1]]
                                    }
                                }else{
                                    bodyFormat[arr[0]][arr[1]]=body[arr[0]][arr[1]];
                                }
                            }else{
                                if(bodyFormat[item]!==undefined){
                                    continue ;
                                }else{
                                    bodyFormat[item]=body[item];
                                }    
                            }
                        }
                    } catch (error) {
                        return res;
                    }
                }
                ctx.bodyFormat=this.copy(bodyFormat);
                return await next();
            }else{
                return res;
            }
        }
    }
}

module.exports=businessMiddlewarService;
