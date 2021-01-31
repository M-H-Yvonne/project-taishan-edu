
<template>
	<el-container>
		<el-header>
			<el-form inline>
				<el-form-item label="班级名称：">
					<el-input size="small" prefix-icon="el-icon-search" placeholder="请输入搜索内容" clearable
					          v-model="search.cls_name" @change="searchClsHandler"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：">
					<el-select size="small" v-model="search.cls_dic_id_major" @change="searchClsHandler">
						<el-option label="- 所有专业 -" :value="0"></el-option>
						<el-option v-for="item in serchMajor" :key="item.dic_id" :label="item.dic_name" :value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级状态：">
					<el-select size="small" v-model="search.cls_status"  @change="searchClsHandler">
						<el-option label="- 所有 -" :value="0"></el-option>
						<el-option label="开课中" :value="1"></el-option>
						<el-option label="未开课" :value="2"></el-option>
						<el-option label="结课" :value="3"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="success" size="small"@click="beforAdd"><i class="el-icon-plus">新增</i></el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="classList" border>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column label="班级名称" prop="cls_name" width="120"></el-table-column>
				<el-table-column label="班级专业">
					<template slot-scope="{row}">
						<span v-text="serchMajor.find(item => item.dic_id===row.cls_dic_id_major).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教学老师">
					<template slot-scope="{row}">
						<span v-text="staff.teacher.length>0 && staff.teacher.find(item => item.stf_id===row.cls_stf_id_teacher).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教务老师">
					<template slot-scope="{row}">
						<span v-text="staff.admin.length>0 && staff.admin.find(item => item.stf_id===row.cls_stf_id_admin).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="就业老师">
					<template slot-scope="{row}">
						<span v-text="staff.job.length>0 && staff.job.find(item => item.stf_id===row.cls_stf_id_job).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教室" width="100">
					<template slot-scope="{row}">
						<span v-if="row.cls_clsr_id!=null && classroomList.length>0"
						      v-text="classroomList.find(item => item.clsr_id===row.cls_clsr_id).clsr_name"></span>
						<span v-else class="no-role">暂无教室……</span>
					</template>
				</el-table-column>
				<el-table-column label="开课时间" prop="cls_begin" width="100"></el-table-column>
				<el-table-column label="结课时间" prop="cls_end" width="100"></el-table-column>
				<el-table-column label="班级状态">
					<template slot-scope="{row}">
						<span v-if="row.cls_begin===null" style="color: #f90">未开课</span>
						<span v-else-if="row.cls_begin!==null && row.cls_end===null" style="color: #090">开课中</span>
						<span v-else style="color: #b0b0b0">已结课</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" width="120" show-overflow-tooltip>
					<template slot-scope="{row}">
						<span v-text="row.cls_remark"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180" fixed="right">
					<template slot-scope="{row}">
						<el-button type="primary" size="mini" @click="beforUpdate(row)"><i class="el-icon-edit">修改</i></el-button>
						<el-button type="success" size="mini" @click="beginClass(row)" v-if="row.cls_begin===null"><i class="el-icon-edit">开课</i></el-button>
						<el-button type="danger " size="mini" @click="endClass(row)" v-else-if="row.cls_begin!==null && row.cls_end===null"><i class="el-icon-edit">结课</i></el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination background :total="pagination.total" :page-size.sync="search.pageSize"
					:current-page.sync="pagination.currentPage" layout="prev,pager,next,jumper,->,total,sizes"
					:page-sizes="[5,8,10,12,14,16]" @size-change="getClass()" @current-change="getClass(false)"></el-pagination>
		</el-footer>
		<!-- 新增、修改 -->
		<el-dialog :visible.sync="edit.isEdit" :show-close="false" :modal="false">
			<h3 slot="title" v-text="`用户编辑 - ${ edit.mode ? '新增' : '修改' }`"></h3>
			<el-form :rules="edit.rules" :model="edit.model" @validate="formValidateHandler" ref="form" status-icon>
				<el-form-item label="班级名称：" prop="cls_name">
					<el-input v-model="edit.model.cls_name"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：" prop="cls_dic_id_major">
					<el-select v-model="edit.model.cls_dic_id_major" placeholder="- 请选择 -">
						<el-option v-for="item in serchMajor" :key="item.dic_id" :label="item.dic_name" :value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师：" prop="cls_stf_id_teacher">
					<el-select v-model="edit.model.cls_stf_id_teacher" placeholder="- 请选择 -">
						<el-option v-for="item in staff.teacher"
						           :key="item.stf_id" :label="item.stf_name"  :value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师：" prop="cls_stf_id_admin">
					<el-select v-model="edit.model.cls_stf_id_admin" placeholder="- 请选择 -">
						<el-option v-for="item in staff.admin"
						           :key="item.stf_id" :label="item.stf_name"  :value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师：" prop="cls_stf_id_job">
					<el-select v-model="edit.model.cls_stf_id_job" placeholder="- 请选择 -">
						<el-option v-for="item in staff.job"
						           :key="item.stf_id" :label="item.stf_name"  :value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注：">
					<el-input type="textarea" v-model="edit.model.cls_remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit=false">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog :visible.sync="classStatus.isShow" :show-close="false" :modal="false">
			<h3 slot="title">开班</h3>
			<el-form :rules="classStatus.rules" :model="classStatus.model" ref="formSecond" status-icon>
				<el-form-item label="教室：" prop="cls_clsr_id">
					<el-select v-model="classStatus.model.cls_clsr_id" placeholder="- 请选择 -">
						<el-option v-for="item in classroomList"
						           :key="item.clsr_id" :label="item.clsr_name"  :value="item.clsr_id"
						           :disabled="!!item.clsr_occupy"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="sure">确定</el-button>
				<el-button @click="classStatus.isShow=false">取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
	let {mapState} =createNamespacedHelpers('dictionary');
        let {mapState:mapStateFromCls,mapActions:mapActionsFromCls} =createNamespacedHelpers('classroom');

        export default {
                name: "Class",
	        data(){
                        return {
                                classWrapper:{},
	                        classList:[],                   //classWrapper.list
				search:{
                                        cls_name: "",
					cls_dic_id_major: 0,
					cls_status: 0,
					begin: 0,
					pageSize: 5
				},
	                        pagination:{
				        total:0,
                                        currentPage:1,
	                        },
	                        staff:{
                                        teacher:[],
		                        admin:[],
		                        job:[]
	                        },
	                        edit:{
                                        isEdit:false,
		                        mode:true,
					model:{
                                                cls_dic_id_major:null,
                                                cls_stf_id_teacher:null,
                                                cls_stf_id_admin:null,
                                                cls_stf_id_job:null,
                                                cls_name:"",
                                                cls_clsr_id:null,
                                                cls_begin:null,
						cls_end:null,
						cls_remark:"",
                                                cls_id:0
					},
                                        rules:{
                                                cls_name:[
                                                        {
                                                                validator:async(rule,value,callback) => {
                                                                        if(value.length===0)
                                                                                callback(new Error('* 班级名称不能为空'));
                                                                        else if(value.length<2 || value.length>20)
                                                                                callback(new Error('* 班级名称长度为2 - 20'));
                                                                        else if(await this.$http({url:"/class/valid_name",method:"post",data:{cls_name:this.edit.model.cls_name}})){
                                                                                let i=this.classList.findIndex(item => item.cls_id!==this.edit.model.cls_id && item.cls_name===this.edit.model.cls_name);
                                                                                if(i!==-1) callback(new Error('* 班级名称已存在'));
                                                                                else callback();
                                                                        }else
                                                                                callback();
                                                                },
                                                                trigger:"blur"
                                                        }
                                                ],
                                                cls_dic_id_major:[ { required: true, message: '请选择班级专业', trigger: 'change' }],
                                                cls_stf_id_teacher:[ { required: true, message: '请选择教学老师', trigger: 'change' }],
                                                cls_stf_id_admin:[ { required: true, message: '请选择教务老师', trigger: 'change' }],
                                                cls_stf_id_job:[ { required: true, message: '请选择就业老师', trigger: 'change' }],
                                        }
	                        },
	                        classStatus:{
                                        isShow:false,                    //开课弹窗
		                        model:{
                                                cls_id:0,
			                        cls_clsr_id:null,
                                                cls_begin:null,
//                                                cls_end:null
		                        },
					rules:{
                                                cls_clsr_id:[ { required: true, message: '请选择开课教室', trigger: 'change' }]
					}
	                        },
                        };
	        },
	        computed: {
                        ...mapState(['dictionaryList']),
                        ...mapStateFromCls(['classroomList']),
                        serchMajor(){
                                let serchMajorList = this.dictionaryList.length > 0 && this.dictionaryList.filter(item => item.dic_group_key === 'class_major');
                                return serchMajorList;
                        },
                },
	        methods:{
		        ...mapActionsFromCls(['initClassroom']),
                        async getClass(fromPage1 = true){
                                if(fromPage1) this.pagination.currentPage=1;
                                this.search.begin = this.search.pageSize*(this.pagination.currentPage-1);
                                this.classWrapper =await this.$http({
	                                url:"/class/list",
	                                method:"post",
	                                data: this.search
                                });
                                this.pagination.total=this.classWrapper.total;
                                this.classList=this.classWrapper.list;
//                                console.log(this.classList)
                        },
                        async searchClsHandler(){
                                await this.getClass();
                        },
                        beforAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.cls_remark = "";
                                this.edit.model.cls_name = "";
                                this.edit.model.cls_dic_id_major = null;
                                this.edit.model.cls_stf_id_teacher = null;
                                this.edit.model.cls_stf_id_admin = null;
                                this.edit.model.cls_stf_id_job = null;
                                this.edit.model.cls_clsr_id=null;
                                this.edit.model.cls_id=0;
		                this.edit.model.cls_begin=null;
                                this.edit.model.cls_end=null;
                                this.edit.mode = true;
                                this.edit.isEdit=true;
                        },
                        beforUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.cls_remark = node.cls_remark;
                                this.edit.model.cls_name = node.cls_name;
                                this.edit.model.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.model.cls_stf_id_teacher = node.cls_stf_id_teacher ;
                                this.edit.model.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.model.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.model.cls_clsr_id=node.cls_clsr_id;
                                this.edit.model.cls_begin=node.cls_begin;
                                this.edit.model.cls_end=node.cls_end;
                                this.edit.model.cls_id=node.cls_id;
                                this.edit.mode = false;
                                this.edit.isEdit=true;
                        },
                        //监听表单验证
                        formValidateHandler(prop,valid,message){
                                //为了点击确定时用到
                                if(prop === 'cls_name') this.classNameValidateResult =valid;
                        },
		        async save(){
                                if(this.classNameValidateResult === false) return;
                                if(typeof this.classNameValidateResult === 'undefined'){
                                        await new Promise(resolve => this.$refs.form.validateField('cls_name',message =>{
                                                if(message === '')resolve();
                                        }))
                                }
//                                async Promise.all([].map(item => {
//                                        await new Promise(resolve => this.$refs.form.validateField(item,message =>{
//                                                if(message ==="") resolve();
//                                        }));
//                                }))
                                await new Promise(resolve => this.$refs.form.validateField('cls_dic_id_major',message =>{
                                        if(message ==="") resolve();
                                }));
                                await new Promise(resolve => this.$refs.form.validateField('cls_stf_id_teacher',message =>{
                                        if(message ==="") resolve();
                                }));
                                await new Promise(resolve => this.$refs.form.validateField('cls_stf_id_admin',message =>{
                                        if(message ==="") resolve();
                                }));
                                await new Promise(resolve => this.$refs.form.validateField('cls_stf_id_job',message =>{
                                        if(message ==="") resolve();
                                }));
				if(this.edit.mode){
				        let cls_id=await this.$http({
					        url:'/class/add',
					        method:'post',
					        data:this.edit.model
				        });
				        this.classList.push(Object.assign({}, this.edit.model, cls_id));
                                        this.$message({
                                                message: `您已经添加“${this.edit.model.cls_name}”班级，请查看新菜单`,
                                                type: 'success'
                                        })
				}else{
                                        await this.$http({
                                                url:'/class/update',
                                                method:'post',
                                                data:this.edit.model
                                        });
                                        let i=this.classList.findIndex(item => item.cls_id===this.edit.model.cls_id);
                                        this.classList.splice(i,1,Object.assign({}, this.edit.model));
                                        this.$message({
                                                message: `您已经修改“${this.edit.model.cls_name}”班级，请查看新菜单`,
                                                type: 'success'
                                        })
				}
				this.edit.isEdit=false;
		        },
                        beginClass(node){
		                this.classStatus.model.cls_id=node.cls_id;
		                this.classStatus.model.cls_clsr_id=null;
                                this.$confirm(`确定要对班级："${node.cls_name}" 进行 开课 操作吗？`, '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                }).then(() => {
                                        this.$refs.formSecond && this.$refs.formSecond.resetFields();
                                        this.classStatus.isShow=true;
                                }).catch(() => {
                                        this.$message({
                                                type: 'info',
                                                message: '已取消'
                                        });
                                });
                        },
		        endClass(node){
                                this.$confirm(`确定要对班级："${node.cls_name}" 进行 结课 操作吗？`, '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                }).then( async () => {
                                        this.classList.find(item => item.cls_id===node.cls_id).cls_end = await this.$http({
	                                        url: '/class/end',
	                                        method: "post",
	                                        data:{
	                                                cls_id:node.cls_id
	                                        }
                                        });
                                        this.classroomList.find(item => item.clsr_id===node.cls_clsr_id).clsr_occupy=0;
                                        this.$message({ type: 'success', message: '已结课!'});
                                }).catch(() => {
                                        this.$message({
                                                type: 'info',
                                                message: '已取消'
                                        });
                                });
		        },
                        async sure(){
                                this.$refs.formSecond.validate(async valid =>{
                                        if(!valid) return;
                                        this.classStatus.model.cls_begin = await this.$http({
                                                url: "/class/begin",
                                                method: "post",
                                                data: this.classStatus.model
                                        });
                                        let obj = this.classList.find(item => item.cls_id === this.classStatus.model.cls_id);
                                        let i = this.classList.findIndex(item => item.cls_id === this.classStatus.model.cls_id);
                                        this.classList.splice(i, 1, Object.assign({}, obj, this.classStatus.model));
                                        this.classroomList.find(item => item.clsr_id===this.classStatus.model.cls_clsr_id).clsr_occupy=1;
                                        this.$message({
                                                type: 'success',
                                                message: '开课成功!'
                                        });
                                        this.classStatus.isShow = false;
                                })
                        },

	        },
	        created(){
                        this.$http({url:'/staff/listbycategory/'+4}).then(data=>{this.staff.teacher=data});
                        this.$http({url:'/staff/listbycategory/'+5}).then(data=>{this.staff.admin=data});
                        this.$http({url:'/staff/listbycategory/'+6}).then(data=>{this.staff.job=data});
	                this.getClass();
                        this.initClassroom();

//                        let p1= this.$http({url:'/staff/listbycategory/'+4});
//                        let p2= this.$http({url:'/staff/listbycategory/'+4});
//                        let p3= this.$http({url:'/staff/listbycategory/'+4});
//                        Promise.all([p1,p2,p3])
//	                        .then(([a,b,c])=>{
//                                        this.teacher=a;
//                                        this.admin=b;
//                                        this.job=c;
//	                        })
//	                        .catch(()=>{})

                }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
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
			.leave
				color #f00
			.noremark
				color #b0b0b0
		.el-footer
			display flex
			align-items center
			.el-pagination
				flex-grow 1
</style>