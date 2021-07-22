const chatMessages=document.querySelector(".chat-messages");
const chatForm=document.getElementById("chat-form");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const messageInp=document.getElementById("msg");
const type=document.querySelector(".status-type");




const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

const socket=io();
socket.emit("joinRoom",{username,room});



socket.on("botMsg",data=>{
    botOutput(data);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})


function botOutput(data){
    const div=document.createElement("div");
    div.classList.add("message-middle");
    const p=document.createElement("p");
    p.classList.add("text");
    p.innerText=data;
    div.appendChild(p);
    chatMessages.appendChild(div);
}


chatForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const msg=e.target.elements.msg.value;
    // msg=msg.trim();

    // if(!msg){
    //     return false;
    // }

    socket.emit("send",msg);

    e.target.elements.msg.value="";

  


});


socket.on("message",(message)=>{
    outputSendMessage(message,"left");
    chatMessages.scrollTop = chatMessages.scrollHeight;
});



socket.on("messageSelf",(message)=>{
    outputSendMessage(message,"right");
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


function outputSendMessage(message,position){
    
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(position);
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);

  
 
};




socket.on("roomUsers",({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});


function outputRoomName(room){
    roomName.innerText=room;
}



const leaveBtn=document.getElementById("leave-btn");

leaveBtn.addEventListener("click",()=>{
    const leaveRoom=confirm("are you sure to exit room");
    if(leaveRoom){
        window.location="../index.html"
    }else{}
});



messageInp.addEventListener("focus",()=>{
    socket.emit("typing")
})


socket.on("typing",data=>{
   
    type.innerHTML=`<p><i>${data}</i></p>`
});


messageInp.addEventListener("blur",()=>{
    socket.emit("untyping")
})

socket.on("untyping",data=>{
    type.innerHTML=`<p><i>${data}</i></p>`
});






function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}



