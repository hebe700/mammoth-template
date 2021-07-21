const crypto=require('crypto');

//md5加密
const md5=(str)=>{
    let md5=crypto.createHash('md5');
    return md5.update(str).digest('hex');
}

//sha1加密
const sha1=(str)=>{
    const sha1=crypto.createHash('sha1');
    return sha1.update(str).digest('hex');
}

//sha1加密
const sha256=(str)=>{
    const sha1=crypto.createHash('sha256');
    return sha1.update(str).digest('hex');
}

//base64处理
const base64Encode=(str)=>{
    //合法的base64是不应该手动去掉末尾的等号的
    return (Buffer.from(str)).toString('base64');
}

const base64Decode=(base64)=>{
    //可用utf-8，也可用utf8
    return (Buffer.from(base64,'base64')).toString('utf8');
}

//可逆加密
const aesEncode=(str,key,iv=undefined)=>{
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv || '85b0bqn3xujqga2j');
    var crypted = cipher.update(str, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

//可逆解密
const aesDecode=(encrypted,key,iv=undefined)=>{
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv || '85b0bqn3xujqga2j');
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

//对象转为&拼接的字符串
const objToQuery=(obj,sort=false,lowerCase=false)=>{
    let keys=Object.keys(obj);
    //是否进行字典排序
    if(sort){
        keys=keys.sort();
    }
    let str='';
    for(let i=0,len=keys.length;i<len;i++){
        const k=keys[i];
        str+=`&${lowerCase?k.toLowerCase():k}=${obj[k]}`;
    }
    str=str.substr(1);
    return str;
}

//生成指定数字的随机数
const randomNumber=(min,max)=>{
    max++;
    return parseInt(Math.random()*(max-min)+min,10);
}

//生成指定长度的随机字符串
const randomNoncestr=(len)=>{
    //26个字母与10个数字
    const arr=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
    let str='';
    for(let i=0;i<len;i++){
        str+=arr[Math.floor(Math.random()*36)];
    }
    return str;
}

//生成指定长度的随机数
const randomLength=(len)=>{
    let str='';
    for(let i=0;i<len;i++){
        let num=parseInt(Math.random()*10);
        if(!num){
            i--;
            continue;
        }
        str+=num.toString();
    }
    return parseInt(str);
}

//获取数据类型
const getType=(data)=>{
    if(data===null){
        return 'null'
    }
    if(data===undefined){
        return 'undefined'
    }
    if(typeof data==='object'){
        if(data instanceof Array){
            return 'array';
        }
        return 'object';
    }
    return typeof data;
}

//去除字符串两边空格
const trim=(val,flag=false)=>{
    const str=String(val).replace(/(^\s*)|(\s*$)/g,'');
    if(flag){
        return str.replace(/\s{2,}/g,' ');
    }
    return str;
}

//字符串分割为数组
const split=(str,separator)=>{
    //分割出来的数组，开头和结尾有可能是空字符串就要去掉
    const arr=String(str).split(separator);
    if(arr[0]===''){
        arr.splice(0,1);
    }
    const len=arr.length;
    if(arr[len-1]===''){
        arr.splice(len-1,1);
    }
    return arr;
}

//获取客户端ip
const fetcIp=(ctx)=>{
    const req=ctx.req;
    return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '127.0.0.1';
}

//获取日期
const getDate=(stamp)=>{
    let dt;
    if(stamp!==undefined && stamp!==null && stamp!==''){
        dt=new Date(stamp);
    }else{
        dt=new Date()
    }
    const year=dt.getFullYear();
    const month=dt.getMonth()+1;
    const date=dt.getDate();
    const hour=dt.getHours();
    const minute=dt.getMinutes();
    const second=dt.getSeconds();
    const day=dt.getDay();

    return {
        dt,
        year,
        month,
        date,
        hour,
        minute,
        second,
        day,
        stamp:dt.getTime()
    }
}

//获取零点日期
const getDateZeroPoint=(stamp)=>{
    let dt;
    if(stamp!==undefined && stamp!==null && stamp!==''){
        dt=new Date(stamp);
    }else{
        dt=new Date()
    }
    const year=dt.getFullYear();
    const month=dt.getMonth()+1;
    const date=dt.getDate();
    dt=new Date(`${year}/${month}/${date} 0:0:0`);
    
    return {
        dt,
        year,
        month,
        date,
        stamp:dt.getTime()
    }
}    

//获取长度加减的日期
const getDateLen=(type='date',len=0,stamp)=>{
    let dt;
    if(stamp!==undefined && stamp!==null && stamp!==''){
        dt=new Date(stamp);
    }else{
        dt=new Date()
    }
    let stampNew;
    switch(type){
        case 'year':
            stampNew=dt.setFullYear(dt.getFullYear()+len);
            break;
        case 'month':
            stampNew=dt.setMonth(dt.getMonth()+len);
            break;
        case 'date':
            stampNew=dt.setDate(dt.getDate()+len);
            break;
        case 'hour':
            stampNew=dt.setHours(dt.getHours()+len);
            break;
        case 'minute':
            stampNew=dt.setMinutes(dt.getMinutes()+len);
            break;
        case 'second':
            stampNew=dt.setSeconds(dt.getSeconds()+len);
            break;
        default:
    } 
    dt=new Date(stampNew);
    return {
        dt,
        year:dt.getFullYear(),
        month:dt.getMonth()+1,
        date:dt.getDate(),
        hour:dt.getHours(),
        minute:dt.getMinutes(),
        second:dt.getSeconds(),
        day:dt.getDay(),
        stamp:stampNew
    }
}

//日期的月份和日格式为带0的字符串
const dateZeroFormat=(num)=>{
    const str=String(num);
    if(str.length===1){
        return `0${str}`;
    }
    return str;
}

const moneyFormat=(money)=>{
    if(money==='' || money===undefined || money===null){
        return '-';
    }
    const val=Number(money);
    if(val===0){
        return '0';
    }
    return val.toFixed(2);
}

/**
 * 获取日期范围
 * 参数为今天往前的几天，默认往前一天，也就是到昨天
 */
const getDateRange=(startStamp='today',days=1)=>{
    let dt;
    if(startStamp==='today'){
        dt=new Date();
    }else{
        dt=new Date(startStamp);
    }
    const nowStamp=dt.getTime();
    const nowDt=new Date(nowStamp);
    dt=getDate(dt.setDate(dt.getDate()+1)).dt;

    const rightStampOrigin=dt.getTime();
    const leftStampOrigin=dt.setDate(dt.getDate()-days-1);

    const rightDt=new Date(rightStampOrigin);
    const leftDt=new Date(leftStampOrigin);
    
    const rightYear=rightDt.getFullYear();
    const rightMonth=rightDt.getMonth()+1;
    const rightDate=rightDt.getDate();
    
    const leftYear=leftDt.getFullYear();
    const leftMonth=leftDt.getMonth()+1;
    const leftDate=leftDt.getDate();

    const rightDateFormat=`${rightYear}/${rightMonth}/${rightDate}`;
    const leftDateFormat=`${leftYear}/${leftMonth}/${leftDate}`;
    
    const rightStamp=new Date(`${rightDateFormat} 0:0:0`).getTime();
    const leftStamp=new Date(`${leftDateFormat} 0:0:0`).getTime();

    return {
        leftStamp,
        rightStamp,
        
        leftDateFormat,
        rightDateFormat,
        
        nowDateFormat:`${nowDt.getFullYear()}/${nowDt.getMonth()+1}/${nowDt.getDate()}`
    }
}

/**
 * 获取字节数
 * 汉字2个字节，英文字母与其他符号是一个字节
 */
const getByte=(str)=>{
    let length=0;
    const reg = /[\u4e00-\u9fa5]/;
    for(let i=0;i<str.length;i++){
        if(reg.test(str.charAt(i))){
            length+=2;
        }else{
            length++;
        }
    }
    return length;
}

//手机号码格式化
const phoneFormat=(phone)=>{
    if(phone==='' || phone===undefined || phone===null){
        return '-';
    }
    phone=String(phone);
    return `${phone.slice(0,3)} ${phone.slice(3,7)} ${phone.slice(7,11)}`;
}

//手机号码隐藏
const phoneHide=(phone)=>{
    if(phone==='' || phone===undefined || phone===null){
        return '-';
    }
    phone=String(phone);
    return phone.replace(/^(\d{3})\d*(\d{4})$/gi,'$1****$2');
}

/**
 * 快速排序
 */
const quickSort=(arr=[])=>{
    if(arr.length<=1){
        return arr;
    }
    const middleIndex=Math.floor(arr.length/2);
    const middleValue=arr.splice(middleIndex,1)[0];
    const leftArr=[];
    const rightArr=[];
    for(let i=0,len=arr.length;i<len;i++){
        const item=arr[i];
        if(item<middleValue){
            leftArr.push(item);
        }else{
            rightArr.push(item);
        }
    }
    return quickSort(leftArr).concat([middleValue],quickSort(rightArr));
}

const isChinese=(str)=>{
    return /^[\u4E00-\u9FFF]+$/gi.test(str);
}

const chineseCut=(str)=>{
    let n=0
    let len=str.length;
    const arr=[];
    while(n<len){
        const item=str[n]
        if(isChinese(item)){
            arr.push(item);
        }
        n++;
    }
    return arr;
}

module.exports={
    md5,
    sha1,
    sha256,
    base64Encode,
    base64Decode,
    aesEncode,
    aesDecode,
    objToQuery,
    randomNumber,
    randomLength,
    randomNoncestr,
    getType,
    getByte,
    trim,
    split,
    fetcIp,
    getDate,
    getDateZeroPoint,
    getDateLen,
    getDateRange,
    dateZeroFormat,
    moneyFormat,
    phoneFormat,
    phoneHide,
    quickSort,
    isChinese,
    chineseCut
}