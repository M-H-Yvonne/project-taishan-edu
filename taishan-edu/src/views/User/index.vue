<template>
	<el-container>
		<el-header>
			<el-form>
				<el-col :span="9">
					<!--input中change：失去焦点或回车时触发-->
					<el-form-item label="用户名字" label-width="100px">
						<el-input placeholder="请输入用户名" clearable prefix-icon="el-icon-search" v-model="model.user_name"
						          @change="sendAjax"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="13">
					<el-form-item label="用户角色" label-width="100px">
						<el-select v-model="model.role_id" placeholder="- 请选择 -" @change="chooseRoles">
							<el-option
								v-for="item in selectRole"
								:key="item.role_id"
								:label="item.role_name"
								:value="item.role_id"></el-option>

						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="1">
					<el-button type="success" @click="beforeAdd"><i class="el-icon-plus"></i>新增</el-button>
				</el-col>

			</el-form>
		</el-header>
		<el-main>
			<el-table :data="users.list" stripe border style="width: 100%">
				<el-table-column
					label="#"
					type="index" :index="indexMethod"
					width="180"></el-table-column>
				<el-table-column
					prop="user_name"
					label="姓名"
					width="180"></el-table-column>
				<el-table-column
					label="角色"
					width="180">
					<template slot-scope="{row}">
						<span v-if="row.role_id!==null && roleList.length>0" v-text="roleList.find(item=>item.role_id===row.role_id).role_name"></span>
						<span v-else class="no-role">无角色</span>
					</template>
				</el-table-column>
				<el-table-column
					label="操作"
					width="300">
					<template slot-scope="scope">
						<el-button
							size="mini"
							type="success" @click="beforeUpdate(scope.row)">编辑</el-button>
						<el-button
							size="mini"
							type="danger" @click="remove(scope.row)">删除</el-button>
						<!--添加角色-->
						<el-popover placement="right" width="400" trigger="click" :title="`${scope.row.user_name}用户的角色分配`">
							<el-form>
								<el-form-item label="角色：">
									<el-select v-model="edit.role_id2" placeholder="- 暂无角色 -">
										<el-option
											v-for="item in chooseTheRole"
											:key="item.role_id"
											:label="item.role_name"
											:value="item.role_id"></el-option>
									</el-select>
									<el-button type="warning" @click="give(scope.row)">分配</el-button>
								</el-form-item>
							</el-form>
							<el-button
								size="mini"
								type="primary" slot="reference" @click="beforeGive(scope.row)">角色分配</el-button>
						</el-popover>

					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:page-sizes="[5, 8, 12, 15]"
				:page-size="model.pageSize"
				:current-page.sync="currentPage"
				layout="prev, pager, next, jumper,->,total, sizes"
				:total="users.total">
			</el-pagination>
		</el-footer>

		<!--新增、编辑-->
		<el-dialog :modal="false" title="用户管理编辑" :visible.sync="edit.isEdit">
			<el-form :model="edit" :rules="edit.rules" ref="form" status-icon @validate="formValidateHandler">
				<el-form-item label="用户名：" prop="addUserName" v-show="edit.mode">
					<el-input v-model.trim="edit.addUserName" placeholder="请输入用户名"></el-input>
				</el-form-item>
				<el-form-item label="密码：" prop="user_pwd">
					<el-input v-model.trim="edit.user_pwd" placeholder="请输入密码"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
					<el-button @click="edit.isEdit=false">取消</el-button>
					<el-button  type="primary" @click="save">确定</el-button>
			</span>
		</el-dialog>
		<!--分页-->

	</el-container>
</template>

<script type="text/ecmascript-6">
        import {createNamespacedHelpers} from 'vuex';
        import ElContainer from "../../../node_modules/element-ui/packages/container/src/main.vue";
        let {mapState,mapActions} = createNamespacedHelpers('role');

        export default {
                components: {ElContainer},
                name: "User",
	        data(){
                        return {
				users: {},
                                result:0,
                                currentPage:1,
	                        model:{
                                        user_name: "",
		                        user_role:"",
                                        role_id: null,
                                        begin: 0,
                                        pageSize: 5
	                        },
	                        edit:{
				        isEdit: false,
		                        role_id2:null,
		                        mode:true,              //默认是新增
		                        addUserName:"",
                                        user_pwd: "",
		                        rules:{
                                                addUserName:[
					                {
                                                                validator:async(rule,value,callback) => {
                                                                        if(!this.edit.mode)
                                                                                callback();                     //直接调用callback不给参数，标识通过验证
	                                                                else if(!/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(value))
	                                                                        callback(new Error('* 用户名长度为2 - 20，且只能包含数字字母，且不能以数字开头'));
									 else if(await this.$http({url:"/user/valid_name",method:"post",data:{user_name:this.edit.addUserName}})){
	                                                                        callback(new Error('用户名已存在'));
                                                                        }else
                                                                                callback();
                                                                },
                                                                trigger:"blur"
					                }
				                ],
			                        user_pwd:[
				                        {
                                                                validator:(rule,value,callback) => {
                                                                        //ES6中的解构赋值：前提：声明的变量=解构的键名
                                                                        if(value.length===0)
                                                                                callback(new Error('* 用户密码不能为空'));
                                                                        else if(value.length<2 || value.length>20)
                                                                                callback(new Error('* 用户密码长度为2 - 20'));
                                                                        else
                                                                                callback();                     //直接调用callback不给参数，标识通过验证
                                                                },
                                                                trigger:"blur"
				                        }
			                        ]
		                        }
	                        },
                        };
	        },
	        computed:{
	                ...mapState(['roleList']),
		        selectRole(){
	                        let roles=[
	                                { role_id: null, role_name: '- 请选择 -'},
                                        { role_id: 0, role_name: '- 无角色 -'},
                                 ];
			        roles.push(...this.roleList);
	                        return roles;
		        },
                        chooseTheRole(){
                                let roles=[{
                                        role_id: null,
                                        role_name: '- 暂无角色 -'
                                }];
                                roles.push(...this.roleList);
                                return roles;
                        },

	        },
	        methods:{
                        ...mapActions(['initRole']),
	                //默认表格序号
                        indexMethod(index) {
                                return index+1;
                        },
		        //分页
                        handleSizeChange(val) {                 //多少条一页
                                this.model.begin=0;
                                this.model.pageSize=val;
                                this.currentPage=1;
                                this.sendAjax();
                        },
                        handleCurrentChange(val) {              //当前处于第几页
                                this.model.begin=(val-1)*this.model.pageSize;
                                this.sendAjax();
                        },
		        //获得角色名
                        chooseRoles(){
                                this.sendAjax();
                                this.model.user_role=this.selectRole.find(item => item.role_id===this.model.role_id).role_name;
                        },
		        //新增前
                        beforeAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.addUserName="";
                                this.edit.user_pwd="";
                                this.edit.mode=true;
                                this.edit.isEdit=true;
                        },
		        //编辑前
                        beforeUpdate(user){
                                //清除之前验证的残留
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.addUserName=user.user_name;
                                this.edit.role_id2=user.role_id;
                                this.edit.user_pwd=this.users.list.find(item => item.user_name===user.user_name).user_pwd;
                                this.edit.mode=false;
                                this.edit.isEdit=true;
                        },
		        //监听表单验证
                        formValidateHandler(prop,valid,message){
                                //为了点击确定时用到
                                if(prop === 'addUserName') this.userNameValidateResult =valid;
                        },
		        async save(){
                                if(this.edit.mode){
                                        if(this.userNameValidateResult === false) return;
                                        if(typeof this.userNameValidateResult === 'undefined'){
                                                await new Promise(resolve => this.$refs.form.validateField('addUserName',message =>{
                                                        if(message === '')resolve();
                                                }))
                                        }
                                }
                                await new Promise(resolve => this.$refs.form.validateField('user_pwd',message =>{
                                        if(message ==="") resolve();
                                }));
				//代码能执行到这里，说明用户名和密码都通过了验证，可以执行后续真正的新增与修改操作
                                if(this.edit.mode){          //添加
                                        await this.$http({
                                                url: "/user/add",
                                                method:"post",
                                                data:{
                                                        user_name: this.edit.addUserName,
	                                                user_pwd: this.edit.user_pwd
                                                }
                                        });
                                        let usermodel={
                                                user_name: this.edit.addUserName,
                                                user_pwd: this.edit.user_pwd,
                                                role_id: null,
                                                role_name:"暂无角色",
                                        };
                                        this.users.list.push(usermodel);
                                        this.users.total++;
                                        this.$message({
                                                message:`您已经添加“${this.edit.addUserName}”，请查看`,
                                                type:'success'
                                        })
                                }else{                  //编辑
                                        await this.$http({
                                                url: "/user/change_pwd",
                                                method: "post",
                                                data:{
                                                        user_name: this.edit.addUserName,
                                                        user_pwd: this.edit.user_pwd
                                                }
                                        });
                                        let usermodelUpdate={
                                                user_name: this.edit.addUserName,
                                                user_pwd: this.edit.user_pwd,
                                                role_id: this.edit.role_id2,
                                        };
                                        let i= this.users.list.findIndex(item => item.user_name === this.edit.addUserName);
                                        console.log(i);
                                        this.users.list.splice(i,1,usermodelUpdate);
                                        this.$message({
                                                message:`您已经修改“${this.edit.addUserName}”的密码，请查看新菜单`,
                                                type:'success'
                                        });
                                }
                                this.edit.isEdit=false;
		        },
		        //删除
                        remove(user){
                                this.$confirm(`你确定要删除“${user.user_name}”用户吗？`,'警告',{type:'warning'})
                                        .then(async () => {
                                                await this.$http({url: '/user/remove/'+user.user_name,method: "post"});
	                                        let i= this.users.list.findIndex(item => item.user_name===user.user_name);
                                                this.users.list.splice(i,1);
                                                this.$message({
                                                        message:`您已经删除“${user.user_name}”用户，请查看`,
                                                        type:'success'
                                                })
                                        })
                                        .catch(()=>{})
                        },
		        //分配角色前
                        beforeGive(user){
                                this.edit.role_id2=user.role_id;
                        },
		        //分配角色
                        async give(user){
                                await this.$http({
	                                url: "/user/config_role",
	                                method:"post",
	                                data:{
	                                        user_name: user.user_name,
		                                role_id: this.edit.role_id2
	                                }
                                });
                                let userRoleUpdate={
                                        user_name: user.user_name,
                                        user_pwd: user.user_pwd,
                                        role_id: this.edit.role_id2,
                                        role_name: this.chooseTheRole.find(role => role.role_id===this.edit.role_id2).role_name,
                                };
                                let i= this.users.list.findIndex(item => item.user_name === user.user_name);
                                console.log(i);
                                this.users.list.splice(i,1,userRoleUpdate);
                                this.$message({
                                        message:`您已经分配给“${user.user_name}”用户角色，请查看`,
                                        type:'success'
                                })
                        },
		        sendAjax(){
                                this.$http({
                                        url: '/user/list',
                                        method: "post",
                                        data: this.model
                                })
	                                .then( data =>{
		                                this.users=data;
	                                })
		        },
	        },
	        watch:{
			"edit.isEdit"(newValue){
				if(newValue===false) delete this.userNameValidateResult;
			}
	        },
	        created(){
//                        this.initRole();
                        this.$store.dispatch('role/initRole');
		        this.sendAjax();
	        }
        };
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		height 100%
		width 100%
		.el-main
			border-top:1px solid #b0b0b0
			border-bottom 1px solid #b0b0b0
			span.no-role
				color #b0b0b0
		.el-footer
			display flex
			align-items center
			.el-pagination
				flex-grow 1
</style>