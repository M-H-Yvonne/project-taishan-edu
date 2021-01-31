import http from '../utils/http.js'

export default {
        namespaced: true,
        state: {
                classroomList:[],
                isInitClassroom:false
        },
        mutations: {
                _initClassroom(state,classroomList){
                        state.classroomList=classroomList;
                        console.log(classroomList);
                        state.isInitClassroom=true;
                },
                _removeClassroom(state,clsr_id){
                        let i= state.classroomList.findIndex(item => item.clsr_id===clsr_id);
                        state.classroomList.splice(i,1);
                },
                _addClassroom(state,classroom){
                        state.classroomList.push(classroom);
                },
                _updateClassroom(state, classroom){
                        let i=state.classroomList.findIndex(item => item.clsr_id===classroom.clsr_id);
                        state.classroomList.splice(i,1,classroom);
                }
        },
        actions: {
                async initClassroom(context){
                        if(context.state.isInitRole) return;
                        let classroomList = await http({url: '/classroom/all'});
                        context.commit('_initClassroom', classroomList);
                },
                async removeClassroom(context, clsr_id){
                        await http({url: '/classroom/remove/'+clsr_id});
                        context.commit('_removeClassroom', clsr_id);
                },
                async addClassroom(context, classroom){
                        classroom.clsr_id = await http({
                                url: '/classroom/add',
                                method: 'post',
                                data: classroom
                        });
                        context.commit('_addClassroom', classroom);
                },
                async updateClassroom(context, classroom){
                        await http({
                                url: '/classroom/update',
                                method: "post",
                                data:classroom
                        });
                        context.commit('_updateClassroom', classroom)
                }
        }
}