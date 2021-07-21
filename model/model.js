/*
* 模型基类
* */
const mongoose=require('mongoose');

// var mysql= require('mysql');
// var connection = mysql.createConnection({
//   host     : '47.96.173.6',
//   user     : 'root',
//   password : 'Fengye1945',
//   database : 'mysql'
// });
 
// connection.connect();


//超类
const SuperClass=require('../common/class.js');

class Model extends SuperClass{
    constructor(props){
        super(props);
        //数据库连接
        if(Model.mongoose===null){
            //console.log('执行连接')
            //连接数据库
            Model.mongoose=mongoose;
            // mongoose.Promise=Promise;
            // mongoose.connect(`mongodb://${this.config.dataHost}:27017/${this.config.mongodbDatabase}`,{
            //     useNewUrlParser:true,
            //     poolSize: 5,
            //     keepAlive:true,
            //     auto_reconnect: false,
            //     useUnifiedTopology: true
            // }).then(()=>{},()=>{});
            // mongoose.connect(`mongodb://localhost:30001`,{
            //     //useMongoClient:true
            // });
            // //连接到副本集
            // mongoose.connect('mongodb://localhost:30001,localhost:30002/test?rs_name=app',{
            //     useMongoClient:true
            // });
            // mongoose.connection.on('connected',()=>{
            //    // console.log('mongodb已连接');
            // })
            // mongoose.connection.on('error',(err)=>{
            //     console.log('mongodb连接错误：',err);
            // });
            // mongoose.connection.on('disconnected',(err)=>{
            //     console.log('mongobd已断开连接');
            // });
            
        }
        this.mongoose=Model.mongoose;
        this.mongoose.set('debug', this.config.mongooseDebug);
    }

    //全表统计
    async findCountAll(){
			return this.mongoWrapper(this.model.estimatedDocumentCount());
    }

    //全表扫描
    async findAll(condition={},fields=''){
      return this.mongoWrapper(this.model.find(condition,fields));
    }

    //单个查询
    async findOne(condition,fields=''){
        return this.mongoWrapper(this.model.findOne({
        '_id':condition.id
        },this.mongoFields(fields)));
    }
    
    //单个创建
    async createOne(body){
      return this.mongoWrapper(this.model.create(body));
    }

    //批量创建
    async createMany(body){
    	return this.mongoWrapper(this.model.insertMany(body));
    }

    //单个删除
    async deleteOne(condition){
        return this.mongoWrapper(this.model.deleteOne({
            '_id':this.mongoose.mongo.ObjectId(condition.id)
        }));
    }

    //批量删除
    async deleteMany(condition){
			return this.mongoWrapper(this.model.deleteMany({
				'_id':this.mongoose.mongo.ObjectId(condition.id)
			}));
    }

    //单个修改
    async updateOne(condition,body){
			return this.mongoWrapper(this.model.updateOne({
				'_id':this.mongoose.mongo.ObjectId(condition.id)
			},body),true);
    }

    //批量修改
    async updateMany(condition,body){
			return this.mongoWrapper(this.model.updateMany({
				'_id':this.mongoose.mongo.ObjectId(condition.id)
			},body),true);
    }

}

Model.mongoose=null;
module.exports=Model;
