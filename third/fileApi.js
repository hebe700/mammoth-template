const qiniu=require('qiniu');
const qr=require('qr-image');
const qs=require('querystring');

const Service=require('../service/service');

//七牛云上传配置
const  cdnQiniu={
    ak:'mdUM3_3g00WiNR305trb0E4EynBIhjdfcUMyznWM',
    sk:'_W4heqW9uzZCWJTY6HJvZ12qkNSEDx3akhnS-dXR',
    bucket:'kawasaki'  
}
const mac=new qiniu.auth.digest.Mac(cdnQiniu.ak,cdnQiniu.sk);
const config=new qiniu.conf.Config();
config.zone=qiniu.zone.Zone_z0;
const bucketManager=new qiniu.rs.BucketManager(mac,config);

/**
 * 文件类第三方服务
 */
class FileApi extends Service{
    constructor(props){ 
        super(props);
    }

    /**
     * 获取七牛web端上传token
     */
    qiniuToken(){
        const options = {
            scope: 'kawasaki',
            returnBody:'{"key":$(key),"name":$(fname),"size":$(fsize),"w":$(imageInfo.width),"h":$(imageInfo.height)}'
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);  
        return putPolicy.uploadToken(mac);
    }

    /**
     * 七牛文件上传
     */
    async qiniuUpload(key,fileStream){
        const options={
            scope:cdnQiniu.bucket+':'+key,//加key实现覆盖
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","w":"$(imageInfo.width)","h":"$(imageInfo.height)"}'
        }
        const formUploader=new qiniu.form_up.FormUploader(config);
        const putExtra=new qiniu.form_up.PutExtra();
        const putPolicy=new qiniu.rs.PutPolicy(options);
        const uploaderToken=putPolicy.uploadToken(mac);
        return await this.pro(cb=>{
            formUploader.putStream(uploaderToken,key,fileStream,putExtra,(err,body,info)=>{
                if(info.statusCode===200){
                    if(err!==null){
                        cb(this.rs(false,this.msg('资源处理错误,err')));
                    }else{
                        cb(this.rs(true,body));
                    }
                }else{
                    cb(this.rs(false,this.msg(`请求响应失败，状态码${info.statusCode}`)));
                }
            });
        })
    }

    /**
     * 七牛单个文件删除
     */
    async qiniuDelete(key,bucket='kawasaki'){
        return await this.pro(cb=>{
            bucketManager.delete(bucket,key,(err,body,info)=>{
                if(info.statusCode===200){
                    if(err!==null){
                        cb(this.rs(false,this.msg('资源处理错误,err')));
                    }else{
                        cb(this.rs(true,body));
                    }
                }else{
                    cb(this.rs(false,this.msg(`请求响应失败，状态码${info.statusCode}`)));
                }
            });
        });
    }

    /**
     * 七牛文件批量删除
     */
    async qiniuBatch(keys,bucket='kawasaki'){
        //将keys转换为七牛批量删除格式，一次批量删除数组不能超过1000个
        const deleteOperations=[];
        for(let i=0,len=keys.length;i<len;i++){
            const key=keys[i];
            deleteOperations.push(qiniu.rs.deleteOp(bucket,key));
        }
        return await this.pro(cb=>{
            bucketManager.batch(deleteOperations,(err,body,info)=>{
                if(info.statusCode===200){
                    if(err!==null){
                        cb(this.rs(false,this.msg('资源处理错误,err')));
                    }else{
                        cb(this.rs(true,body));
                    }
                }else{
                    cb(this.rs(false,this.msg(`请求响应失败，状态码${info.statusCode}`)));
                }
            });
        });
    }

    /**
     * 七牛文件枚举
     */
    async qiniuEnumerate(marker='',limit=1000,bucket='kawasaki'){
        return await this.pro(cb=>{
            bucketManager.listPrefix(bucket,{
                marker,
                limit,
                prefix:''
            },(err,body,info)=>{
                //body:{marker:'如果后面还有图片未枚举，会有这个属性，后续没有图片可以检索了，这个属性不存在'，items:[{key,hash,fsize,mimeType,putTIme,type,status,md5}]}
                if(info.statusCode===200){
                    if(err!==null){
                        cb(this.rs(false,this.msg('资源处理错误,err')));
                    }else{
                        cb(this.rs(true,body));
                    }
                }else{
                    cb(this.rs(false,this.msg(`请求响应失败，状态码${info.statusCode}`)));
                }
            });
        })
    }

    /**
     * 生成订单二维码数据并上传七牛
     */
    async generateOrderQrcode(param={
        pid:'',
        orderNo:'',
        type:'',//0是配送订单，1是拼团订单
    }){
        let filename;
        if(param.type===0){
            filename=`0_${this.cipherIrreversible(param.pid)}_${this.cipherReversible(param.orderNo)}`;
        }else{
            filename=`1_${this.cipherIrreversible(param.pid)}_${this.cipherReversible(param.orderNo)}`;
        }
        const qrcodeStream=qr.image(filename,{type:'svg'});
        return await this.qiniuUpload(this.util.md5(filename),qrcodeStream);
    }
}

module.exports=FileApi;
