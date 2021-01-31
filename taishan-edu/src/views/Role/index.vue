<template>
	<div>
		<el-row :gutter="25">
			<el-col v-for="item in roleList" :key="item.role_id" :span="6">
				<el-card shadow="hover">
					<span v-text="item.role_name"></span>
					<div class="button-wrapper">
						<el-tooltip class="item" effect="dark" content="分配功能" placement="bottom">
							<el-button type="text" @click="beginRoleFuncConfig(item.role_id)"><i class="el-icon-s-help"></i></el-button>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="修改" placement="bottom">
							<el-button type="text" @click="beforeUpdate(item)"><i class="el-icon-edit-outline"></i></el-button>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="删除" placement="bottom">
							<el-button type="text" @click="remove(item)"><i class="el-icon-delete"></i></el-button>
						</el-tooltip>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card class="btn-add" @click.native="beforeAddRoles"><i class="el-icon-plus"></i></el-card>
			</el-col>
		</el-row>
		<el-drawer :visible.sync="edit2.isEdit" size="450px"
		                        :modal="false" :show-close="false" class="custom-drawer">
			<h3 slot="title">角色功能分配</h3>
			<el-tree class="custom-tree" :data="edit2.treeData" default-expand-all :expand-on-click-node="false">
				<span class="custom-tree-node" slot-scope="{node, data}" :class="{parent:data.func_key===''}">
					<span>
						<i v-if="data.func_key!==''" class="el-icon-paperclip"></i>
						<span v-text="data.func_name"></span>
					</span>
					<span class="switch-wrapper">
						<el-switch v-model="data.open" @change="switchChangeHandler(data)"></el-switch>
					</span>
				</span>
			</el-tree>
			<el-footer>
				<div class="drawer-footer">
					<el-button type="primary" @click="roleFuncConfig">确定</el-button>
					<el-button @click="edit2.isEdit=false">取消</el-button>
				</div>
			</el-footer>
		</el-drawer>
		<!--新增、编辑弹窗-->
		<el-dialog :modal="false" title="角色管理编辑" :visible.sync="edit.show">
			<el-form :model="edit.model" :rules="edit.rules" ref="form">
				<el-form-item label="角色名称：" prop="role_name">
					<el-input v-model.trim="edit.model.role_name" placeholder="请输入角色名称"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
					<el-button @click="edit.show=false">取消</el-button>
					<el-button  type="primary" @click="save">确定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	//只适用于一对一
//	import {createNamespacedHelpers} from 'vuex';
//	let {mapActions,mapState} = createNamespacedHelpers('role');

	//一对多
        import {createNamespacedHelpers} from 'vuex';
        let {mapActions: mapActionsFromRole, mapState: mapStateFromRole} = createNamespacedHelpers('role');
        let {mapGetters: mapGettersFromFunc, mapActions: mapActionsFromFunc} = createNamespacedHelpers('func');



        export default {
                name: "Role",
	        data(){
                        return {
//                                roles:[],
	                        edit: {
                                        mode:true,             //判断处于什么状态，默认添加状态，false为编辑
                                        show: false,          //添加显示添加框
                                        model:{
                                                role_id: 0,
	                                        role_name: ""
                                        },
                                        rules: {
                                                role_name:[
	                                                {
                                                                validator:(rule,value,callback) => {
                                                                        //ES6中的解构赋值：前提：声明的变量=解构的键名
                                                                        let{ role_name}=this.edit.model;
                                                                        if(value.length===0)
                                                                                callback(new Error('* 角色名称不能为空'));
                                                                        else if(value.length<2 || value.length>50)
                                                                                callback(new Error('* 角色名称长度为2 - 50'));
                                                                        else if(this.roleList.some(item => item.role_name === role_name))
                                                                                callback(new Error('* 角色名称已经存在'));
                                                                        else
                                                                                callback();                     //直接调用callback不给参数，标识通过验证
                                                                },
                                                                trigger:"blur"
	                                                }
                                                ]
                                        },
	                        },
	                        /*角色功能分配*/
	                        edit2:{
	                                isEdit: false,                   //表示有没有进行角色分配
					model:{
	                                        role_id: 0,
						role_func_ids: "",
					},
                                        treeData: [],
	                        }

                        };
	        },
	        computed:{
	                ...mapStateFromRole(['roleList']),
		        ...mapGettersFromFunc(['listToTree'])
	        },
	        methods:{
		        ...mapActionsFromRole(['initRole','removeRole','addRole','updateRole']),
		        ...mapActionsFromFunc({'initFunc': 'init'}),
	               remove(node){           //删除
                                this.$confirm(`你确定要删除“${node.role_name}”节点吗？`,'警告',{type:'warning'})
                                        .then(async () => {
                                                await this.removeRole(node.role_id);
                                                this.$message({
                                                        message:`您已经删除“${node.role_name}”角色，请查看新菜单`,
                                                        type:'success'
                                                })
                                        })
                                        .catch(()=>{})
	                },
                        beforeAddRoles(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.role_name="";
                                this.edit.model.role_id=0;
                                this.edit.show=true;
                                this.edit.mode=true;
                        },
                        beforeUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.role_name=node.role_name;
                                this.edit.model.role_id=node.role_id;
                                this.edit.show=true;
                                this.edit.mode=false;
                        },
			save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode){          //添加
	                                        await this.addRole(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message:`您已经添加“${this.edit.model.role_name}”角色，请查看新菜单`,
                                                        type:'success'
                                                })
                                        }else{                  //编辑
	                                        await this.updateRole(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message:`您已经修改“${this.edit.model.role_name}”角色，请查看新菜单`,
                                                        type:'success'
                                                });
                                        }
                                        this.edit.show=false;
                                });
			},
                        async beginRoleFuncConfig(role_id){
				let roleFuncs = await this.$http({url:"/role_function/list/"+role_id});
				let roleFuncIds = roleFuncs.reduce((result,item) => {
				        result.push(item.func_id);
				        return result;
				},[]);
				this.updateTreeDate(roleFuncIds);

				this.edit2.model.role_func_ids = "";
				this.edit2.model.role_id = role_id;
			        this.edit2.isEdit=true;
                        },
		        //根据最新的listToTree和roleFuncIds去更新treeData
		        updateTreeDate(roleFuncIds){
                                let result = JSON.parse(JSON.stringify(this.listToTree));
                                result.forEach(item => {
                                        item.open = roleFuncIds.indexOf(item.func_id)!==-1;
                                        item.children && item.children.forEach(item2 => item2.open = roleFuncIds.indexOf(item2.func_id)!==-1);
                                });
                                this.edit2.treeData =result;
		        },
                        switchChangeHandler(node){
				if(node.func_key === ""){               //非叶子节点
				        node.children && node.children.forEach(item => item.open = node.open);
				}else{                                         //叶子节点
				        let parent = this.edit2.treeData.find(item => item.func_id === node.func_fid);
                                        if(node.func_fid === 0) return;
				        parent.open = parent.children.some(item => item.open);
				}
                        },
                        async roleFuncConfig(){
                                //发Ajax前统计树中所有节点的func_id
                                let func_ids = [];
                                this.edit2.treeData.forEach(item => {
                                        if(item.open) func_ids.push(item.func_id);
                                        item.children && item.children.forEach(item2 => {
                                                if(item2.open) func_ids.push(item2.func_id);
                                        })
                                });
                                this.edit2.model.role_func_ids=func_ids.join(',');
                                //发Ajax
                                await this.$http({
		                        method: "post",
	                                url: "/role_function/config",
	                                data: this.edit2.model
	                        });
                                //Ajax成功返回后的相应界面变化
                                this.edit2.isEdit =false;
                                this.$message({message: "角色功能分配成功！",type: "success"});
                        }
	        },
	        watch:{
	                listToTree(){
	                        this.edit2.isEdit =false;
	                        //listToTree改变且抽屉隐藏时，没有角色处于编辑状态，所以要传一个空数组
	                        this.updateTreeDate([]);
	                }
	        },
	       created(){
	                this.initRole();
	                this.initFunc();
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-col
		margin-top: 30px
		.el-card
			text-align center
			padding 10% 0
			background-color #99f;
			color #fff;
			font-weight bold
			font-size 22px
			cursor pointer
			position relative
			&.btn-add
				background-color transparent
				color #00994f
				border 2px dashed #00994f
			.button-wrapper
				position absolute
				right 10px
				bottom 0
				.el-button
					font-size 22px
					color #fff
	.el-drawer
		overflow hidden
		.el-tree
			overflow auto
			height: 400px
			.custom-tree
				width: 350px
				margin: 20px 0 50px 50px
				span.custom-tree-node
					flex: 1
					display: flex
					justify-content: space-between
					align-items: center
					&.parent
						padding-right: 50px
						color: #0094ff
			.drawer-footer
				text-align: center

</style>