const qs=require('querystring');
const Service=require('../service/service');

/**
 * 文件类第三方服务
 */
class FileApi extends Service{
    constructor(props){ 
        super(props);
    }

    /**
     * 第三方服务测试代码
     */
    async test(param){
        
    }
}

module.exports=FileApi;
