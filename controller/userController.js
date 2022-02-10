const Controller=require('./controller');

const that=new Controller({
    prefix:"/user"
});

/**
 * 测试
 */
that.reqGet(
    '/test',
    // {
		// 	'email':{
		// 		empty:[null,'email不能为空'],
		// 		type:['string','email类型不合法'],
		// 		maxLength:[30,'email不能超过30个字符'],
		// 		email:[null,'email格式不合法']
		// 	},
		// 	'password':{
		// 		empty:[null,'password不能为空'],
		// 		type:['string','password类型不合法'],
		// 		maxLength:[16,'password不能超过16个字符']
		// 	}
)()

module.exports=that;