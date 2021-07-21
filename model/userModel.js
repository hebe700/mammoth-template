const Model=require('./model.js');


/**
 * {email:1}
 * //基于phoen的查询等操作
 */
class UserModel extends Model{
    constructor(props){
        super(props);
        if(UserModel.model===null){
            const schema=new this.mongoose.Schema({
                //用户邮箱
                email:{
									type:String,
									default:''
                },
								//密码
								password:{
									type:String,
									default:''
								},
								//账号是否激活
                active:{
									type:Number,
									default:0
								},
								//用户级别，0是普通用户，1是付费时间用户，2是永久用户
								level:{
									type:Number,
									default:0
								},
								//付费周期，时间戳
								period:{
									type:Object,
									default:{
										begin:'',
										end:''
									}
								},
                //创建时间
                createdate:{
									type:Object,
									default:{
										stamp:'',
										year:'',
										month:'',
										date:''
									}
                }
            },{
                toObject:{getters:true},
                id:false,
                versionKey:false
            },{collection:'user'})
            UserModel.model=this.mongoose.model('user',schema,'user');
        }
        this.model=UserModel.model;
    }
    
    async findOneByEmail(condition,fields=''){
        return this.mongoWrapper(this.model.findOne({
            'email':condition.email
        },this.mongoFields(fields)).hint({
            'email':1,
        }).limit(10).sort({
            'email':-1
        }));
    }
    
}

UserModel.model=null;
module.exports=UserModel;
//module.exports=class a {}
