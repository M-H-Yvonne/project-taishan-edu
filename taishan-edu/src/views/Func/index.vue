<template>
	<div>
		<el-tree :data="funcData" default-expand-all class="custom-tree" :expand-on-click-node="false">
			<span slot-scope="{node, data}" class="custom-tree-node">
				<span v-text="data.func_name" :class="{root:data.func_id===0, unleaf: data.func_key==='',leaf:data.func_key!==''}"></span>
				<span>
					<el-button type="text" v-if="data.func_key===''" @click="addNodes(data)"><i class="el-icon-plus"></i></el-button>
					<el-button type="text" v-if="data.func_id!==0" @click="beginUpdate(data)"><i class="el-icon-edit"></i></el-button>
					<el-button type="text" v-if="[0,44,45].indexOf(data.func_id)===-1" :disabled="Boolean(data.children)"
							@click="remove(data)">
						<i class="el-icon-delete"></i>
					</el-button>
				</span>
			</span>
		</el-tree>
		<el-dialog :modal="false" :visible.sync="edit.isEdit" title="新增" width="600px">
			<el-form :model="edit.model" :rules="edit.rules" label-width="150px" ref="form">
				<el-form-item label="节点类型：">
					<el-radio v-model="edit.isLeaf" :label="false"
					          :disabled="!(edit.mode && edit.model.func_fid===0)">非叶子节点</el-radio>
					<el-radio v-model="edit.isLeaf" :label="true"
					          :disabled="!(edit.mode && edit.model.func_fid===0)">叶子节点</el-radio>
				</el-form-item>
				<el-form-item label="父节点名称：">
					<el-select v-model="edit.model.func_fid" :disabled="edit.mode || !edit.isLeaf">
						<el-option
							v-for="item in selectData"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统功能名称" prop="func_name">
					<el-input v-model.trim="edit.model.func_name" placeholder="请输入功能名称"></el-input>
				</el-form-item>
				<el-form-item label="系统功能关联组件" v-show="edit.isLeaf" prop="func_key">
					<el-select v-model="edit.model.func_key">
						<el-option
							v-for="item in Object.keys(views)"
							:key="item"
							:label="item"
							:value="item"
							:disabled="list.findIndex(func =>func.func_key===item)!==-1">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
					<el-button @click="edit.isEdit=false">取消</el-button>
					<el-button @click="sure" type="primary">确定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import views from '../../views';
	import { createNamespacedHelpers } from 'vuex';
	let { mapState, mapGetters,mapActions } = createNamespacedHelpers('func');

        export default {
                name: "Func",
	        data(){
                        return {
                                funcs:[],
	                        edit:{
                                        mode: true,                     //true标识新增，false标识修改
                                        isLeaf: false,                  //是否是叶子节点
                                        isEdit: false,                   //编辑是否隐藏
		                        model: { func_id: 0, func_name: "", func_key: "", func_fid: -1},
                                        rules: {
                                                func_name: [
	                                                {
	                                                        validator:(rule,value,callback) => {
	                                                                //ES6中的解构赋值：前提：声明的变量=解构的键名
		                                                        let{ func_id, func_name, func_fid}=this.edit.model;
	                                                                if(value.length===0)
	                                                                        callback(new Error('* 功能名称不能为空'));
	                                                                else if(value.length<2 || value.length>50)
	                                                                        callback(new Error('* 功能名称长度为2 - 50'));
	                                                                else if(this.list.some(item => item.func_id !==func_id &&item.func_name===func_name&&item.func_fid===func_fid))
	                                                                        callback(new Error('* 功能名称在当前父级中已经存在'));
	                                                                else
	                                                                        callback();                     //直接调用callback不给参数，标识通过验证
	                                                        },
		                                                trigger:"blur"
	                                                },
                                                ],
                                                func_key: [
	                                                {
	                                                        validator:(rule,value,callback)=>{
	                                                                //如果是新增节点，且是叶子节点，且没有选定绑定的组件
		                                                        if(this.edit.mode && this.edit.isLeaf && value === "")
		                                                                callback(new Error('* 叶子节点，必须绑定组件'));
		                                                        else
		                                                                callback();
	                                                        },
		                                                trigger: "blur"
	                                                }
                                                ]
                                        }
	                        },
				views,


                        }
	        },
	        computed:{
		        ...mapState(['list']),
			...mapGetters(['listToTree']),
	                //递归的方法
	                funcData(){
	                        return [{
	                                func_id: 0,
		                        func_name: "Root",
		                        func_key: "",
		                        func_fid: -1,
		                        children: this.listToTree
		                        //children: this.$store.getters['func/listToTree']
	                        }];

	                },
//			funcsTreeData(){
//			        let result=[];
//			        this.funcs.filter(item => item.func_fid===0).forEach(item => {
//					let node = Object.assign({},item);
//					let children =this.funcs.filter(func => func.func_fid===item.func_id);
//					if(children.length>0){
//					        node.children=[];
//					        children.forEach(func => node.children.push(Object.assign({},func)));
//					        result.push(node);
//					}
//			        });
//			        return result;
//			}
		        selectData(){
	                        let result = [{ label: "Root", value: 0}];
	                        this.list.filter(item => item.func_key === "").forEach(item => {
	                                result.push({label: item.func_name, value: item.func_id});
	                        });
			        return result;
		        }
	        },
	        methods:{
		        ...mapActions(['init','removeFunc','addFunc','updateFunc']),
	                remove(node){
	                        this.$confirm(`你确定要删除“${node.func_name}”节点吗？`,'警告',{type:'warning'})
		                        .then(async () => {
		                                //await this.$store.dispatch('func/removeFunc',node.func_id);
                                                await this.removeFunc(node.func_id);
                                                this.$message({
				                        message:`您已经删除“${node.func_name}”节点，请刷新页面查看新菜单`,
				                        type:'success'
			                        })
		                        })
		                        .catch(()=>{})
	                },
		        //增加
		        addNodes(parentNode){
	                        //重置表单
	                        this.$refs.form && this.$refs.form.resetFields();
	                        //打开对话框的准备工作
                                this.edit.mode = true;
	                        //重置
			        this.edit.isLeaf= parentNode.func_id !== 0;
                                this.edit.model.func_id=0;
                                this.edit.model.func_name="";
                                this.edit.model.func_key="";
                                this.edit.model.func_fid=parentNode.func_id;
                                //打开对话框开始新增
                                this.edit.isEdit = true;
		        },
		        //修改
                        beginUpdate(node){
                                //重置表单
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框的准备工作
                                this.edit.mode = false;
                                //重置
                                this.edit.isLeaf= node.func_key !== "";
                                this.edit.model.func_id=node.func_id;
                                this.edit.model.func_name=node.func_name;
                                this.edit.model.func_key=node.func_key;
                                this.edit.model.func_fid=node.func_fid;
                                //打开对话框开始修改
                                this.edit.isEdit = true;
                        },
		        sure(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid)return;
                                        if(this.edit.mode){                     //新增
	                                        //await this.$store.dispatch('func/addFunc', Object.assign({},this.edit.model));
                                                await this.addFunc(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message:`您已经添加“${this.edit.model.func_name}”节点，请刷新页面查看新菜单`,
                                                        type:'success'
                                                })
                                        }else{                  //修改
                                                //await this.$store.dispatch('func/updateFunc', Object.assign({},this.edit.model));
                                                await this.updateFunc(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message:`您已经修改“${this.edit.model.func_name}”节点，请刷新页面查看新菜单`,
                                                        type:'success'
                                                });
                                        }

                                        this.edit.isEdit=false;              //关闭编辑对话框
                                });



		        },
	        },
	        created(){
	               //this.$store.dispatch('func/init');
                        this.init();
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.custom-tree
		width: 500px
		span.custom-tree-node
			flex: 1
			display: flex
			justify-content: space-between
			align-items: center
			span.root
				color: rgb(255,45,75) !important
			span.unleaf
				color: #67c23a
				font-weight bold
			span.leaf
				color blue
</style>