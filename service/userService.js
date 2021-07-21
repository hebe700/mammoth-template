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
    async test(body,query,ctx){
			//发送账号激活邮件
			//ctx.third.EmailApi.sendEmail(body.email)
			return this.succ('success')
    }

}

module.exports=UserService;
