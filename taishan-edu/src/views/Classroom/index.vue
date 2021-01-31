<template>
	<div>
		<div class="explain">
			<div class="use"><i></i><span>占用中</span></div>
			<div class="unuse"><i></i><span>闲置</span></div>
		</div>
		<el-row :gutter="25">
			<el-col :span="6" v-for="item in classroomList" :key="item.clsr_id">
				<el-card :class="{isUse: item.clsr_occupy!==0}">
					<span v-text="item.clsr_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click="beforeUpdate(item)"><i class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" @click="remove(item)" v-if="item.clsr_occupy===0"><i class="el-icon-delete"></i></el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card class="btn-add" @click.native="beforeAddClassroom"><i class="el-icon-plus"></i></el-card>
			</el-col>
		</el-row>
		<!--新增、编辑弹窗-->
		<el-dialog :modal="false" title="教室管理编辑" :visible.sync="edit.isEdit">
			<el-form :model="edit.model" :rules="edit.rules" ref="form">
				<el-form-item label="教室名称：" prop="clsr_name">
					<el-input v-model.trim="edit.model.clsr_name" placeholder="请输入教室名称"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
					<el-button @click="edit.isEdit=false">取消</el-button>
					<el-button  type="primary" @click="save">确定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
        import {createNamespacedHelpers} from 'vuex';
        let {mapState,mapActions} = createNamespacedHelpers('classroom');

        export default {
                name: "Classroom",
                data: function(){
                        return {
                                edit: {
                                        isEdit: false,                    //表示是否显示编辑状态
                                        mode: true,                     //表示当前处于编辑状态还是添加状态，默认为添加
                                        model: {
                                                clsr_id: 0,
                                                clsr_name: "",
                                                clsr_occupy: 0
                                        },
                                        rules: {
                                                clsr_name: [
                                                        {
                                                                validator: (rule, value, callback) =>{
                                                                        //ES6中的解构赋值：前提：声明的变量=解构的键名
                                                                        let {clsr_name} = this.edit.model;
                                                                        if(value.length === 0)
                                                                                callback(new Error('* 教室名称不能为空'));
                                                                        else if(value.length < 2 || value.length > 20)
                                                                                callback(new Error('* 教室名称长度为2 - 20'));
                                                                        else if(this.classroomList.some(item => item.clsr_name === clsr_name))
                                                                                callback(new Error('* 教室已经存在'));
                                                                        else
                                                                                callback();                     //直接调用callback不给参数，标识通过验证
                                                                },
                                                                trigger: "blur"
                                                        }
                                                ]
                                        },
                                }
                        };
                },
	        computed:{
		        ...mapState(['classroomList']),
	        },
	        methods:{
                        ...mapActions(['initClassroom','removeClassroom','addClassroom','updateClassroom']),
		        //添加教室的准备工作
                        beforeAddClassroom(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.clsr_name="";
                                this.edit.model.clsr_id=0;
                                this.edit.model.clsr_occupy=0;
                                this.edit.mode=true;            //当前处于添加状态
                                this.edit.isEdit=true;
                        },
                        beforeUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.clsr_name=node.clsr_name;
                                this.edit.model.clsr_id=node.clsr_id;
                                this.edit.model.clsr_occupy=node.clsr_occupy;
                                this.edit.mode=false;                       //当前处于编辑状态
                                this.edit.isEdit=true;
                        },
		        save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode){             //添加
                                                await this.addClassroom(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message:`您已经添加“${this.edit.model.clsr_name}”，请查看`,
                                                        type:'success'
                                                });
                                                this.edit.isEdit=false;
                                        }else{                                  //编辑
                                                await this.updateClassroom(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message:`您已经修改“${this.edit.model.clsr_name}”，请查看`,
                                                        type:'success'
                                                });
                                                this.edit.isEdit=false;
                                        }
                                })
		        },
                        remove(node){
                                this.$confirm(`你确定要删除“${node.clsr_name}”吗？`,'警告',{type:'warning'})
                                        .then(async () => {
                                                await this.removeClassroom(node.clsr_id);
                                                this.$message({
                                                        message:`您已经删除“${node.clsr_name}”，请查看`,
                                                        type:'success'
                                                })
                                        })
                                        .catch(()=>{})
                        }
	        },
	        created(){
	                this.initClassroom();
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.explain
		display flex
		.use
			line-height 50px
			padding 0 20px
			& i
				display: inline-block
				width: 20px
				height: 20px
				background-color: #f99
				vertical-align middle
				margin-right 10px
		.unuse
			line-height 50px
			& i
				display: inline-block
				width: 20px
				height: 20px
				background-color: #99f
				vertical-align middle
				margin-right 10px
	.el-col
		margin-top: 30px
		.el-card
			background-color: #99f
			text-align center
			padding 10% 0
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
		.el-card.isUse
			background-color: #f99


</style>