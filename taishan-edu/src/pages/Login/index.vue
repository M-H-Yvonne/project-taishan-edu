<template>
	<div class="login_body">
		<div class="login_background"></div>
		<div class="logo-wrapper">
			<h1>泰山学院管理系统</h1>
		</div>

		<el-form :rules="rules" :model="model" ref="model" status-icon>
			<h2>泰山学院管理系统登录</h2>
			<el-form-item prop="user_name">
				<el-input suffix-icon="el-icon-s-custom" v-model.trim="model.user_name">
					<template slot="prepend"><span class="prepend-text">用户名：</span></template>
				</el-input>
			</el-form-item>
			<el-form-item prop="user_pwd">
				<el-input suffix-icon="el-icon-lock" v-model="model.user_pwd" show-password>
					<template slot="prepend"><span class="prepend-text">密码：</span></template>
				</el-input>
			</el-form-item>
			<el-form-item class="button-wrapper">
				<el-button plain @click="login('model')">登录</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Login",
	        data(){
                        return {
				model:{
					user_name: "",
					user_pwd: ""
				},
                                rules: {
                                        user_name: [
                                                //非空
                                                {required: true, message: '请输入用户名', trigger: 'blur'},
	                                        //长度
                                                {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
                                        ],
                                        user_pwd: [
                                                {required: true, message: '请输入密码', trigger: 'blur'},
                                                {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
                                        ],
                                }
                        };
	        },
	        methods:{
	                login(model){
	                        this.$refs[model].validate(async vaild =>{
	                                if(vaild){
                                                let token = await this.$http({
                                                        url:'/user/login',
                                                        method:'post',
                                                        data: this.model
                                                });
                                                sessionStorage.setItem('token',token);
                                                sessionStorage.setItem('user_name',this.model.user_name);
                                                this.$router.replace('/home');
	                                }else{
	                                        alert('请填写正确信息');
	                                }
	                        });

	                }
	        }
        };
</script>

<style lang="stylus" type="text/stylus" scoped>
	@keyframes aaa
		0% {transform: rotateY(0deg)}
		100% {transform: rotateY(30deg)}
	@keyframes bbb{
		0%{  transform: translateY(-50%) translateX(0%)}
		100%{   transform: translateY(-50%) translateX(35%)}
	}
	@-webkit-keyframes cloud_three
		0%{ left:0 }
		100%{ left:-100% }
	@-moz-keyframes cloud_three
		0%{ left:0 }
		100%{ left:-100% }
	@keyframes cloud_three
		0%{ left:0 }
		100%{ left:-100% }
	.login_body
		width: 300%
		height: 100%
		background: #1C77AC
		display: flex
		justify-content: center
		align-items: center
		overflow: hidden
		.login_background
			background: url(./cloud.png) no-repeat  center
			background-size: 100% 100%
			height: 100%
			width: 300%
			animation: cloud_three 50s linear infinite
			transform: translate3d(0,0,0)
			position: absolute
			top: 0
			left: 0
		.logo-wrapper
			/*开启3D视觉效果*/
			perspective: 500px
			position: fixed
			top: 50%
			right: 45%
			transform: translateY(-50%) translateX(0%)
			animation-name: bbb
			animation-duration: 1s
			animation-fill-mode: forwards
			animation-delay: 1s
			h1
				animation-name: aaa
				animation-duration: 1s
				animation-fill-mode: forwards
				border-bottom:  1px solid #000
				transform: rotateY(30deg)
				transform-origin: left center
				font-size: 100px
				white-space: nowrap
				padding: 30px 50px
				color: #b0b0b0
				text-shadow: -15px 15px 10px #000
				position: relative
				/*伪元素利用&符号反选*/
				/*&:before*/

		.el-form
			width 350px
			padding 50px 70px
			border-radius 15px
			position: fixed
			top: 50%
			left: 60%
			transform translateY(-50%)
			box-shadow 0 0 10px 1px #1c77ac

			right: 15%;
			margin: auto;
			/*width: 500px;*/
			height: auto;
			overflow: hidden;
			padding-bottom: 30px;
			text-align: center;
			background: rgba(255,255,255,.2);
			/*border-radius: 35px;*/
			h2
				text-align center
				margin-bottom 20px
				color #333
			span.prepend-text
				width:70px
				display flex
			.button-wrapper
				text-align center
</style>