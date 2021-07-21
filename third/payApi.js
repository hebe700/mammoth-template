const qs=require('querystring');
const fs=require('fs');
const path=require('path');

const Service=require('../service/service');

//支付宝支付配置
const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData=require('alipay-sdk/lib/form').default;
const alipayFormData = new AlipayFormData();
const alipaySdk = new AlipaySdk({
    appId: '2019070165749307', 
    //应用私钥
    privateKey: 'MIIEowIBAAKCAQEArOoWl2unr4PVHri20ShzwKBj4Z9QB8XBqdUZB0FQLJswUs2xmvme1WQIIm6bElarNuvpaK1jviXfmKgBmn+Z4Oai1mIZLX6tuCRDjkAzLIHXs9xGCEaPp5hKAqbgGJs9QzpuwKZEoQx8sfWqCpRlBlfRT/ypoBJlOr9hW/xHifoBw2PhCj8gut69N+lF7e4mSP74gzpMxrzHeZLNU5kb0fSysYdFY/DKSgiNCR3+j/mCKVF80RVgWz+XJE/XrijXNO0xsciydJw0NXBcl0ubRjv/kJnxsDJG5C791ZII3GJUsakHvE5+PmNhNGLR9Mo2b5KVeTnGbUA80ruM0n3vvQIDAQABAoIBAFFzZzbmkDOeHwr8qak2q+fl5YbHO7Sdk89DQSnouzJ327h1ih7dTNNp7mcBwOxPhRE26VjUrDJKttu68B5t0vdczQG9bey/Smd+NZBRb4mclBX2QcruKgchNmOvZcpRffcoFDmNWLCgKDDP7sxTAI+PWFqcQu7TG3oj4mGpIa29H00BUAJpgOKkp5dZ7SmqI2tLaU/fKIjUTIneSN6OBSA5g6fYskzhG/TaNBYtRIE/WIaesExqXfbF3+KRE3Qdxm8aoYWcYvjql5JhjptfWaHPEB1a2REqalh3WYgw/wY7aen4IiMtMVCy+3CGFK/fZzryuvN35G7lHazeF6jLzqECgYEA1oCMznRtktdTH0Nhu/jAlaFH300+L7QJbGfSZOpNCEiqEcr2Oa5znmOqCEbCuPflbBCdMLpayFiljFOUe/IS/EmowDtCIls2vhUy7/2w50XmEByc5KT2Rmvo/oWmZiXQPo5YEionAtBiLV4si35SS3fIJ5+3Z/Mhnnc2fRn60EUCgYEAzl3cS/r708tEvyq5tGcKcgCQMWgAcF0embwj+pxWwGJ3+0llAK7vNllNjXA5VT8EeSjsOzZoxrAZqvMWnBEfsaGcuIMBuCZaWodKaRWlHDq1qlscb1GtAB9c7SFgzs+pDCJJnpRKfUNlHli1OXf8N3joCu8nd3j8vRtDNsm5RRkCgYAjfgnOb31h+rcKST/2tmZHW/RkgodzpTqZ8WPixtIQONXLM+YiDTecUalkzTCTIpGXm/gmg+9ZjzF1Uq8TAy8ZB6cgh62dubIJKcDP7Q5EdlBnAhUD0Dff1yMqWjr6U+9tKmhwOQFTed+E2jxMqI49Zoh75fWXAafibJ9be90AcQKBgQCn5aV+C80nG5HrFo/QPqU460xlZgA1aw2idnevRdMu4u5K/AO48pqc1TtLf6qluIejK7BG3JWSUWQQuYYDo8rtcldXpv6XHF0WmkvoAzw6I2n6F/aiewkNuHaaVzW0DS+0N5E9+9g+4b47WmDXSM9jMnNXsguiIEVAdhXRVX3uwQKBgCz4WWkbSGz+uWoBN4NWFXrYqXqUbXDBrYk+ke6rawWMCGs2VEFwcbDJOlWjoMMQMP0WEA+C45mBHSiSBhIVY+oEH0cjawzPigv1nhMwM4pwzRvfPnTgj0PtMYYBbmcCxIxjDm+6rZzRaKokVOiVd1cfgyRoxUS8qandAtWs6CBi',
    //支付宝公钥（需要对结果验签时必填）
    alipayPublicKey:'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhgnIZMtUbA2O0QbQDQlUNjdI8O9fl917o8VG0uhRKJGyms0+FUxE1LRYD6QXrFQheE1E2hTLnX53EqF1VHOXIIyNAMyICn5VAhfjE8t945u1/oQs+rP93HRSK2heZMSNyHLKrLfprbULwRb4HLQ3PtlOSnWfOqyf5uUJoYeK6QyosTmJDoGHaKDFIjd9FLOlXk8YxkDXBTQFIf4NTqykrf+2sVPbunq2RDx+YbNOy8EeVp35chPdbRXKKHZ0YihEFyvuSgn752QiN+PzyEGZyYYhewSEHcLaM820TeRtj/TQy0Ef9qVTi98X6548YrV4HKewtmmn71L4VUGza8O4DQIDAQAB' 
});

/**
 * 支付类第三方服务
 */
class PayApi extends Service{
    constructor(props){ 
        super(props);
    }

    /**
     * 微信统一支付签名算法
     */
    wechatPaySign(data,key,lowerCase=false){
        const queryStr=this.util.objToQuery(data,true,lowerCase);
        const str=`${queryStr}&key=${key}`;
        return this.util.md5(str).toUpperCase();
    }
    

    /**
     * 微信支付服务商下单
     */
    async wechatServicePay(args={
        type:'',
        openid:'',
        orderNo:'',
        payPrice:''
    },merchant={
        appid:'',
        mchid:'',
        ip:''
    }){
        const data={
            appid:this.config.wechatPayServiceAppid,
            mch_id:this.config.wechatPayServiceMchid,
            sub_appid:merchant.appid,
            sub_mch_id:merchant.mchid,
            sub_openid:args.openid,
            spbill_create_ip:merchant.ip,
            nonce_str:this.util.randomNoncestr(32),
            notify_url:args.type==='group'?`https://api.${this.config.host}/order/group/wechatpay/callback`:`https://api.${this.config.host}/order/delivery/wechatpay/callback`,
            body:args.type==='group'?`拼团订单 ${args.orderNo}`:`配送订单 ${args.orderNo}`,
            out_trade_no:args.orderNo,
            total_fee:Number((args.payPrice*100).toFixed(0)),
            trade_type:'JSAPI'
        }
        const paySign=this.wechatPaySign({
            appid:data.appid,
            mch_id:data.mch_id,
            sub_appid:data.sub_appid,
            sub_mch_id:data.sub_mch_id,      
            sub_openid:data.sub_openid,
            spbill_create_ip:data.spbill_create_ip,
            nonce_str:data.nonce_str,
            notify_url:data.notify_url,
            body:data.body,
            out_trade_no:data.out_trade_no,
            total_fee:data.total_fee,
            trade_type:data.trade_type
        },this.config.wechatPayServiceMchkey);
        //构造统一下单xml
        let bodyData = '<xml>';
        bodyData += '<appid>' + data.appid + '</appid>';  // 小程序ID
        bodyData += '<mch_id>' + data.mch_id + '</mch_id>'; // 商户号
        bodyData += '<sub_appid>' + data.sub_appid + '</sub_appid>';  // 小程序ID
        bodyData += '<sub_mch_id>' + data.sub_mch_id + '</sub_mch_id>'
        bodyData += '<sub_openid>' + data.sub_openid + '</sub_openid>'; // 用户标识
        bodyData += '<body>' + data.body + '</body>'; // 商品描述
        bodyData += '<nonce_str>' + data.nonce_str + '</nonce_str>'; // 随机字符串
        bodyData += '<notify_url>' + data.notify_url + '</notify_url>'; // 支付成功的回调地址 
        bodyData += '<out_trade_no>' + data.out_trade_no + '</out_trade_no>'; // 商户订单号
        bodyData += '<spbill_create_ip>' + data.spbill_create_ip + '</spbill_create_ip>'; // 终端IP
        bodyData += '<total_fee>' + data.total_fee + '</total_fee>'; // 总金额 单位为分
        bodyData += '<trade_type>'+data.trade_type+'</trade_type>'; // 交易类型 小程序取值如下：JSAPI
        bodyData += '<sign>' + paySign + '</sign>';
        bodyData += '</xml>';

        //请求微信统一下单接口
        const unifiedorderRes=await this.pro(cb=>{
            this.Request({
                url:'https://api.mch.weixin.qq.com/pay/unifiedorder',
                method:'POST',
                body:bodyData,
            },(err,response,body)=>{
                if(err || response.statusCode!==200){
                    return cb(this.rs(false,this.msg('请求错误')));
                }
                this.xmlParse(body,{trim: true},(err,res)=>{
                    if(res!==undefined && res!==null){
                        res=res.xml;
                        if(res.return_code && res.return_code[0]==='SUCCESS'){
                            cb(this.rs(true,res));
                        }else{
                            cb(this.rs(false,this.msg(res.return_msg && res.return_msg[0])));  
                        }   
                    }else{
                        cb(this.rs(false,this.msg('处理失败')));
                    }
                })
            });
        });
        if(!unifiedorderRes.status){
            return unifiedorderRes;
        }
        if(unifiedorderRes.result.return_code[0].toUpperCase()!=='SUCCESS'){
            return this.rs(false,unifiedorderRes.result.return_msg[0]);
        }
        if(unifiedorderRes.result.err_code_des!==undefined){
            return this.rs(false,unifiedorderRes.result.err_code_des[0]);
        }
        //返回微信端支付需要的参数
        const prepay_id=unifiedorderRes.result.prepay_id[0];
        const timeStamp=String(new Date().getTime()).slice(0,-3);
        //返回支付书，同时返回订单号。用户取消了支付，再次，返回订单号与拼单号
        return this.rs(true,{
            //prepay_id,
            orderNo:args.orderNo,
            timeStamp,
            nonceStr:data.nonce_str,
            package:`prepay_id=${prepay_id}`,
            paySign:this.wechatPaySign({
                appId:data.sub_appid,
                timeStamp,
                nonceStr:data.nonce_str,
                package:`prepay_id=${prepay_id}`,
                signType:'MD5'
            },this.config.wechatPayServiceMchkey),
        });
    }

    /**
     * 微信支付统一下单
     */
    async wechatPay(args={
        type:'',
        openid:'',
        orderNo:'',
        payPrice:''
    },merchant={
        appid:'',
        mchid:'',
        ip:''
    }){
        const data={
            appid:merchant.appid,
            mch_id:merchant.mchid,
            openid:args.openid,
            spbill_create_ip:merchant.ip,
            nonce_str:this.util.randomNoncestr(32),
            notify_url:args.type==='group'?`https://api.${this.config.host}/order/group/wechatpay/callback`:`https://api.${this.config.host}/order/delivery/wechatpay/callback`,
            body:args.type==='group'?`拼团订单 ${args.orderNo}`:`配送订单 ${args.orderNo}`,
            out_trade_no:args.orderNo,
            total_fee:Number((args.payPrice*100).toFixed(0)),
            trade_type:'JSAPI'
        }
        //获取支付签名，这个支付签名，会和参与签名的所有参数数据，一起提交到微信统一下单接口，微信统一下单接口会将提交过来的从参数也进行加密，看生成的签名与提交过来的签名是否一致
        //当签名是一致的，那么微信统一下单接口就会返回prepay_id。然后使用这个prepay_id再与其他参数生成另一个签名，这些参与和这个签名一起返回给小程序端。
        //小程序再使用wx.requestPayment提交这些参与和签名验证是否一致，一致那么小程序端才会最终唤起支付窗口
        const paySign=this.wechatPaySign({
            appid:data.appid,
            mch_id:data.mch_id,
            openid:data.openid,
            spbill_create_ip:data.spbill_create_ip,
            nonce_str:data.nonce_str,
            notify_url:data.notify_url,
            body:data.body,
            out_trade_no:data.out_trade_no,
            total_fee:data.total_fee,
            trade_type:data.trade_type
        },this.config.defaultWeappMchkey);
        //构造统一下单xml
        let bodyData = '<xml>';
        bodyData += '<appid>' + data.appid + '</appid>';  // 小程序ID
        bodyData += '<mch_id>' + data.mch_id + '</mch_id>'; // 商户号
        bodyData += '<openid>' + data.openid + '</openid>'; // 用户标识
        bodyData += '<body>' + data.body + '</body>'; // 商品描述
        bodyData += '<nonce_str>' + data.nonce_str + '</nonce_str>'; // 随机字符串
        bodyData += '<notify_url>' + data.notify_url + '</notify_url>'; // 支付成功的回调地址 
        bodyData += '<out_trade_no>' + data.out_trade_no + '</out_trade_no>'; // 商户订单号
        bodyData += '<spbill_create_ip>' + data.spbill_create_ip + '</spbill_create_ip>'; // 终端IP
        bodyData += '<total_fee>' + data.total_fee + '</total_fee>'; // 总金额 单位为分
        bodyData += '<trade_type>'+data.trade_type+'</trade_type>'; // 交易类型 小程序取值如下：JSAPI
        bodyData += '<sign>' + paySign + '</sign>';
        bodyData += '</xml>';
    
        //请求微信统一下单接口
        const unifiedorderRes=await this.pro(cb=>{
            this.Request({
                url:'https://api.mch.weixin.qq.com/pay/unifiedorder',
                method:'POST',
                body:bodyData,
            },(err,response,body)=>{
                if(err || response.statusCode!==200){
                    return cb(this.rs(false,this.msg('请求错误')));
                }
                this.xmlParse(body,{trim: true},(err,res)=>{
                    if(res!==undefined && res!==null){
                        res=res.xml;
                        if(res.return_code && res.return_code[0]==='SUCCESS'){
                            cb(this.rs(true,res));
                        }else{
                            cb(this.rs(false,this.msg(res.return_msg && res.return_msg[0])));  
                        }   
                    }else{
                        cb(this.rs(false,this.msg('处理失败')));
                    }
                })
            });
        });
        if(!unifiedorderRes.status){
            return unifiedorderRes;
        }
        if(unifiedorderRes.result.return_code[0].toUpperCase()!=='SUCCESS'){
            return this.rs(false,unifiedorderRes.result.return_msg[0]);
        }
        if(unifiedorderRes.result.err_code_des!==undefined){
            return this.rs(false,unifiedorderRes.result.err_code_des[0]);
        }
        //返回微信端支付需要的参数
        const prepay_id=unifiedorderRes.result.prepay_id[0];
        const timeStamp=String(new Date().getTime()).slice(0,-3);
        //返回支付书，同时返回订单号。用户取消了支付，再次，返回订单号与拼单号
        return this.rs(true,{
            prepay_id,
            orderNo:args.orderNo,
            timeStamp,
            nonceStr:data.nonce_str,
            package:`prepay_id=${prepay_id}`,
            paySign:this.wechatPaySign({
                appId:data.appid,
                timeStamp,
                nonceStr:data.nonce_str,
                package:`prepay_id=${prepay_id}`,
                signType:'MD5'
            },this.config.defaultWeappMchkey),
        });
    }

    /**
     * 服务商微信支付退款
     */
    async wechatServiceRefund(param={
        orderNo:'',//订单号
        refundNo:'',//退款单号
        payFee:0,//订单金额
        refundFee:0,//退款金额
        reason:'',
        appid:'',
        mchid:''
    }){
        const data={
            appid:this.config.wechatPayServiceAppid,
            mch_id:this.config.wechatPayServiceMchid,
            sub_appid:param.appid,
            sub_mch_id:param.mchid,
            nonce_str:this.util.randomNoncestr(32),
            out_trade_no:param.orderNo,
            out_refund_no:param.refundNo,
            total_fee:Number(param.payFee)*100,
            refund_fee:Number(param.refundFee)*100,
            refund_desc:param.reason
        };
        const sign=this.wechatPaySign(data,this.config.wechatPayServiceMchkey);
        
        let bodyData = '<xml>';
            bodyData += '<appid>' + data.appid + '</appid>'; 
            bodyData += '<mch_id>' + data.mch_id + '</mch_id>';
            bodyData += '<sub_appid>' + data.sub_appid + '</sub_appid>'; 
            bodyData += '<sub_mch_id>' + data.sub_mch_id + '</sub_mch_id>';
            bodyData += '<nonce_str>' + data.nonce_str + '</nonce_str>'; 
            bodyData += '<out_trade_no>' + data.out_trade_no + '</out_trade_no>'; 
            bodyData += '<out_refund_no>' + data.out_refund_no + '</out_refund_no>'; 
            bodyData += '<total_fee>' + data.total_fee + '</total_fee>'; 
            bodyData += '<refund_fee>' + data.refund_fee + '</refund_fee>';
            bodyData += '<refund_desc>' + data.refund_desc + '</refund_desc>';
            bodyData += '<sign>' + sign + '</sign>';
            bodyData += '</xml>';

        const resRefund=await this.pro(cb=>{
            this.Request({
                url:'https://api.mch.weixin.qq.com/secapi/pay/refund',
                method:'POST',
                cert:this.config.wechatPayServiceCert,
                key:this.config.wechatPayServiceKey,
                body:bodyData,
            },(err,response,body)=>{
                if(err || response.statusCode!==200){
                    return cb(this.rs(false,this.msg('请求错误')));
                }
                this.xmlParse(body,{trim: true},(err,res)=>{
                    if(res!==undefined && res!==null){
                        res=res.xml;
                        if(res.return_code && res.return_code[0]==='SUCCESS'){
                            if(res.result_code[0]!=='SUCCESS'){
                                cb(this.rs(false,this.msg(res.err_code_des[0])));
                            }else{
                                cb(this.rs(true,res));
                            }
                        }else{
                            cb(this.rs(false,this.msg(res.return_msg && res.return_msg[0])));  
                        }   
                    }else{
                        cb(this.rs(false,this.msg('处理失败')));
                    }
                })
            });
        });
        return resRefund;
    }


    /**
     * 微信支付支付退款
     */
    async wechatRefund(param={
        orderNo:'',//订单号
        refundNo:'',//退款单号
        payFee:0,//订单金额
        refundFee:0,//退款金额
        reason:'',
        appid:'',
        mchid:'',
        mchkey:''
    }){
        const data={
            appid:param.appid,
            mch_id:param.mchid,
            nonce_str:this.util.randomNoncestr(32),
            out_trade_no:param.orderNo,
            out_refund_no:param.refundNo,
            total_fee:Number(param.payFee)*100,
            refund_fee:Number(param.refundFee)*100,
            refund_desc:param.reason
        };
        const sign=this.wechatPaySign(data,this.config.defaultWeappMchkey);
        
        let bodyData = '<xml>';
            bodyData += '<appid>' + data.appid + '</appid>'; 
            bodyData += '<mch_id>' + data.mch_id + '</mch_id>';
            bodyData += '<nonce_str>' + data.nonce_str + '</nonce_str>'; 
            bodyData += '<out_trade_no>' + data.out_trade_no + '</out_trade_no>'; 
            bodyData += '<out_refund_no>' + data.out_refund_no + '</out_refund_no>'; 
            bodyData += '<total_fee>' + data.total_fee + '</total_fee>'; 
            bodyData += '<refund_fee>' + data.refund_fee + '</refund_fee>';
            bodyData += '<refund_desc>' + data.refund_desc + '</refund_desc>';
            bodyData += '<sign>' + sign + '</sign>';
            bodyData += '</xml>';

        const resRefund=await this.pro(cb=>{
            this.Request({
                url:'https://api.mch.weixin.qq.com/secapi/pay/refund',
                method:'POST',
                cert:this.config.defaultWeappWechatRefundCert,
                key:this.config.defaultWeappWechatRefundKey,
                body:bodyData,
            },(err,response,body)=>{
                if(err || response.statusCode!==200){
                    return cb(this.rs(false,this.msg('请求错误')));
                }
                this.xmlParse(body,{trim: true},(err,res)=>{
                    if(res!==undefined && res!==null){
                        res=res.xml;
                        if(res.return_code && res.return_code[0]==='SUCCESS'){
                            if(res.result_code[0]!=='SUCCESS'){
                                cb(this.rs(false,this.msg(res.err_code_des[0])));
                            }else{
                                cb(this.rs(true,res));
                            }
                        }else{
                            cb(this.rs(false,this.msg(res.return_msg && res.return_msg[0])));  
                        }   
                    }else{
                        cb(this.rs(false,this.msg('处理失败')));
                    }
                })
            });
        });
        return resRefund;
    }

    /**
     * 支付宝支付
     */
    async aliPay(params={
        orderNo:'',
        payPrice:'',
        title:''
    }){
        // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
        alipayFormData.setMethod('get');
        alipayFormData.addField('returnUrl', `https://www.${this.config.host}/merchant`);
        alipayFormData.addField('notifyUrl', `https://api.${this.config.host}/fund/alipay/callback`);

        alipayFormData.addField('bizContent', {
            outTradeNo: params.orderNo,
            productCode: 'FAST_INSTANT_TRADE_PAY',
            totalAmount: params.payPrice,
            subject: `${params.title}`
        });
        //发起支付
        return await alipaySdk.exec('alipay.trade.page.pay',{},{ 
            formData: alipayFormData 
        }).then((res)=>{
            return Promise.resolve(this.rs(true,res));
        },(err)=>{
            return Promise.reject(this.rs(false,err));
        });
    }

    /**
     * 阿里支付订单检查
     */
    async alipayCheckHasPay(params={
        orderNo:''
    }){
        return await alipaySdk.exec('alipay.trade.query',{
            bizContent:{
                outTradeNo:params.orderNo
            }
        }).then((res)=>{
            return Promise.resolve(this.rs(true,res));
        },(err)=>{
            return Promise.reject(this.rs(false,err));
        });
    }

    /**
     * 阿里支付通知回调验签
     */
    async alipayCheckNotifySign(obj){
        return await alipaySdk.checkNotifySign(obj);
    }

}
module.exports=PayApi;
