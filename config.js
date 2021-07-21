
	/*
	* 配置文件
	* */
	const fs=require('fs');
	
	//域名（订单二维码图片）
	exports.host='abc.com'; 
	//是否启用接口请求的权限验证
	exports.apiAuth=true;

	//mongodb数据库
	exports.mongodbDatabase='test';
	//是否开启mongoose调试模式
	exports.mongooseDebug=process.env.NODE_ENV==='development';
	//mongodb域名
	exports.dataHost=process.env.NODE_ENV==='development'?'0.0.0.0':'localhost';
	//mongodb端口
	
	//私钥(用于md5加密)
	exports.key='21ljbg4r8atz0q2rxvhqkeqt98hhvt20';


	
	
	
	
	
	
	