
	/*
	* 配置文件
	* */

	//域名
	exports.host='abc.com'; 

	//mongodb数据库
	exports.mongodbDatabase='test';
	//是否开启mongoose调试模式
	exports.mongooseDebug=process.env.NODE_ENV==='development';
	//mongodb域名
	exports.dataHost=process.env.NODE_ENV==='development'?'0.0.0.0':'localhost';
	//mongodb端口


	
	
	
	
	
	
	