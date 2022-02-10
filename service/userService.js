const Service=require('./service.js');

/**
 * 用户服务
 */
class UserService extends Service{
    constructor(props){
        super(props);
    }

    /**
     * 测试
     */
    async test(query,body,ctx){
        return this.succ('okkk')
    }

}

module.exports=UserService;
