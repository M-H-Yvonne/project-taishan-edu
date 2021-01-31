import http from '../utils/http.js'

export default {
        namespaced: true,
        state: {
                staffWrapper:{},
                staffList:[],
                isInitStaff:false
        },
        mutations: {
                _initStaff(state,staffWrapper){
                        state.staffWrapper=staffWrapper;
                        state.staffList= state.staffWrapper.list;
                        state.isInitStaff=true;
                },
                _serchCategory(state,staffList){
                        state.staffList= staffList;
                },
                _reinstateStaff(state,stf){
                        let i= state.staffList.findIndex(item => item.stf_id===stf.stf_id);
                        state.staffList.splice(i,1,stf);
                },
                _dimissionStaff(state,stf){
                        let i= state.staffList.findIndex(item => item.stf_id===stf.stf_id);
                        state.staffList.splice(i,1,stf);
                },
                _addStaff(state,staff){
                        state.staffList.push(staff);
                },
                _updateStaff(state, staff){
                        let i=state.staffList.findIndex(item => item.stf_id===staff.stf_id);
                        state.staffList.splice(i,1,staff);
                }
        },
        actions: {
                async initStaff(context,search){
                        if(context.state.isInitRole) return;
                        let staffWrapper=await http({url: '/staff/list',method:"post",data:search});
                        context.commit('_initStaff', staffWrapper);
                },
                async serchCategory(context,stf_category){
                        let staffList=await http({url:'/staff/listbycategory/'+stf_category});
                        context.commit('_serchCategory',staffList)
                },
                async reinstateStaff(context, stf){
                       await http({ url: '/staff/reinstate/'+stf.stf_id,});
                        stf.stf_invalid=1;
                        context.commit('_reinstateStaff', stf)
                },
                async dimissionStaff(context, stf){
                        await http({ url: '/staff/dimission/'+stf.stf_id,});
                        stf.stf_invalid=0;
                        context.commit('_dimissionStaff', stf)
                },
                async addStaff(context, staff){
                        staff.stf_id = await http({
                                url: '/staff/add',
                                method: 'post',
                                data: staff
                        });
                        context.commit('_addStaff', staff);
                },
                async updateStaff(context, staff){
                        await http({
                                url: '/staff/update',
                                method: "post",
                                data:staff
                        });
                        context.commit('_updateStaff', staff)
                }
        }
}