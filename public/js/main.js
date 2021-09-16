const chatForm = document.getElementById("chat-form");
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users')

// GET USERNME AND ROOM
const {username,room}=Qs.parse(location.search,{
  ignoreQueryPrefix:true

})
console.log(username,room)

const socket = io();

// Join chatroom
socket.emit('joinRoom',{username,room})

// Get room and users

socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users)
})

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  const audio=document.querySelector('audio')
  audio.play();

  // Scroll down
  chatMessages.scrollTop=chatMessages.scrollHeight;


});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
 

  // Emit message to server
  socket.emit("chatMessage", msg);

  e.target.elements.msg.value=""
  e.target.elements.msg.focus();
});

// Output Message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}   <span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div)
}

// Add Room name toDOM
function outputRoomName(room){
  roomName.innerText=room;
}

// Add Users to the dom
function outputUsers(users){
  userList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}
  `
}