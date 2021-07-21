const Service=require('../service/service');
const Core = require('@alicloud/pop-core');

var client = new Core({
  accessKeyId: 'LTAIaQJSXMnSw2Lv',
  accessKeySecret: 'uOma2KTNlFqLS9yBWCUEgDDSa8cXZd',
  endpoint: 'https://dm.aliyuncs.com',
  apiVersion: '2015-11-23'
});


class EmailApi extends Service{
  
  async sendEmail(email){
    const params = {
      "AccountName": 'account@qingp.net',
      "AddressType": 1,
      "ReplyToAddress": false,
      "ToAddress": email,
      "Subject": '青苹—账号注册',
      "HtmlBody": `<div><h3>感谢您注册青苹</h3><div>请点击&nbsp;<a style="text-decoration:underline;" href="http://www.qingp.net/user/active?code=${this.cipherReversible(email,true)}">此处</a>&nbsp;激活您的账号。</div></div>`
    }
    
    const requestOption = {
      method: 'POST'
    };

    await client.request('SingleSendMail', params, requestOption)
  }
}
module.exports=EmailApi