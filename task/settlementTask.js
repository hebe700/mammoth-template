const Service=require('../service/service.js');

const phoneApi=require('../third/phoneApi');

/**
 * 结算任务
 */
class SettlementTask extends Service{
    constructor(props){
        super(props);

        this.PhoneApi=new phoneApi();
    }

}
module.exports=new SettlementTask();