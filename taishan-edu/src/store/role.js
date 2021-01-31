import http from '../utils/http.js'

export default {
        namespaced: true,
        state: {
                roleList:[],
                isInitRole:false
        },
        mutations: {
                _initRole(state,roleList){
                        state.roleList=roleList;
                        state.isInitRole=true;
                },
                _removeRole(state,role_id){
                        let i= state.roleList.findIndex(item => item.role_id===role_id);
                        state.roleList.splice(i,1);
                },
                _addRole(state,role){
                        state.roleList.push(role);
                },
                _updateRole(state, role){
                        let i=state.roleList.findIndex(item => item.role_id===role.role_id);
                        state.roleList.splice(i,1,role);
                }
        },
        actions: {
                async initRole(context){
                        if(context.state.isInitRole) return;
                        let roleList = await http({url: '/role/all'});
                        context.commit('_initRole', roleList);
                },
                async removeRole(context, role_id){
                       await http({url: '/role/remove/'+role_id,method: 'post'});
                       context.commit('_removeRole', role_id);
                },
                async addRole(context, role){
                        role.role_id = await http({
                                url: '/role/add',
                                method: 'post',
                                data: role
                        });
                        context.commit('_addRole', role);
                },
                async updateRole(context, role){
                        await http({
                                url: 'role/update',
                                method: "post",
                                data:role
                        });
                        context.commit('_updateRole', role)
                }
        }
}