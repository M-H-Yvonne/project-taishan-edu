<template>
	<div>
		<el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
			<el-form-item label="原始密码：" prop="oldPwd">
				<el-row>
					<el-col :span="8">
						<el-input type="password" v-model="ruleForm.oldPwd" autocomplete="off"></el-input>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="密码：" prop="newPwd">
				<el-row>
					<el-col :span="8"><el-input type="password" v-model="ruleForm.newPwd" autocomplete="off"></el-input></el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="确认密码：" prop="checkNewPwd">
				<el-row>
					<el-col :span="8"><el-input type="password" v-model="ruleForm.checkNewPwd" autocomplete="off"></el-input></el-col>
				</el-row>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
				<el-button @click="resetForm('ruleForm')">重置</el-button>
			</el-form-item>
		</el-form>
	</div>

</template>

<script type="text/ecmascript-6">
        export default {
                name: "ChangePwd",
	        data(){
                        let validatePass1 = (rule, value, callback) => {
                                if (value === '') {
                                        callback(new Error('* 请输入原始密码'));
                                }else if(value.length<2 || value.length>20)
                                        callback(new Error('* 密码长度在 2 - 20'));
                                else {
//                                        if (this.ruleForm.checkNewPwd !== '') {
//                                                this.$refs.ruleForm.validateField('checkNewPwd');
//                                        }
                                        callback();
                                }
                        };
                        let validatePass2 = (rule, value, callback) => {
                                if (value === '') {
                                        callback(new Error('* 请输入密码'));
                                }
                                else if(value.length<2 || value.length>20)
                                        callback(new Error('* 密码长度在 2 - 20'));
                                else if(value === this.ruleForm.oldPwd)
                                        callback(new Error('新旧密码一致!'));
                                else {
                                        if (this.ruleForm.checkNewPwd !== '') {
                                                this.$refs.ruleForm.validateField('checkNewPwd');
                                        }
                                        callback();
                                }
                        };
                        let validatePass3 = (rule, value, callback) =>{
                                if(value === ''){
                                        callback(new Error('请再次输入密码'));
                                }
                                else if(value.length<2 || value.length>20)
                                        callback(new Error('* 密码长度在 2 - 20'));
                                else if(this.ruleForm.newPwd === '')
                                        callback(new Error('请输入新密码'));
                                else if(value !== this.ruleForm.newPwd){
                                        callback(new Error('两次输入密码不一致!'));
                                }else{
                                        callback();
                                }
                        };

                        return {
                                ruleForm: {
                                        newPwd: '',
                                        checkNewPwd: '',
                                        oldPwd: ""
                                },
                                rules: {
                                        oldPwd:[
                                                { validator: validatePass1, trigger: 'blur' }
                                        ],
                                        newPwd: [
                                                { validator: validatePass2, trigger: 'blur' }
                                        ],
                                        checkNewPwd: [
                                                { validator: validatePass3, trigger: 'blur' }
                                        ],
                                }
                        };
	        },
                methods: {
                        submitForm(formName) {
                                this.$refs[formName].validate(async valid => {
                                        if(!valid) return;
                                        await this.$http({
		                                url: '/user/pwdchange',
		                                method: 'post',
		                                data:this.ruleForm
	                                });
                                        this.$message({
                                                message:'密码修改成功',
                                                type:'success'
                                        });
                                        this.$refs.form && this.$refs.form.resetFields();
                                        this.ruleForm.oldPwd="";
                                        this.ruleForm.newPwd="";
                                        this.ruleForm.checkNewPwd="";
                                });
                        },
                        resetForm(formName) {
                                this.$refs[formName].resetFields();
                        }
                }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>