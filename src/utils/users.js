const users=[]

const addUser= ({id, username ,room})=>{
    //username =username.trim().toLowerCase()
    //room = room.trim().toLowerCase()

    if(!username || !room){
        return({
            error:'Username and room are required'
        })
      }
    const existingUser=users.find((user)=> user.username===username && user.room===room)
    if(existingUser){
          return({
              error:'username is already in use'
          })
    }
    const user={id,username,room}
    users.push(user)
    return{user}
}
const removeUser=(id) => {
    const index=users.findIndex((user)=>user.id===id)
if(index!==-1){
    return (users.splice(index,1)[0])
}
}
const getUserInRoom=(room)=>{
    room =room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}
const getUser=(id)=>{
     const client=users.find((user)=>user.id===id)
     return client
}
module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
addUser({
    id:22,
    username:'ram',
    room:'aus'
})

addUser({
    id:25,
    username:'raj',
    room:'aus'
})

const a=getUser(25)
console.log(a)
