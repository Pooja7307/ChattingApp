const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
if (!token || !user) {
  window.location.href = "login.html";
}

const socket = io("http://localhost:8081"); 

const roomList = document.getElementById("roomList");
const messagesBox = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const currentRoomName = document.getElementById("currentRoomName");

let currentRoomId = null;

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

async function fetchRooms() {
  const res = await fetch("http://localhost:8081/api/chat/room", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const rooms = await res.json();
  roomList.innerHTML = "";
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.textContent = room.name;
    li.onclick = () => selectRoom(room._id, room.name);
    roomList.appendChild(li);
  });
}

async function selectRoom(roomId, roomName) {
  currentRoomId = roomId;
  currentRoomName.textContent = roomName;
  socket.emit("joinRoom", roomId);

  const res = await fetch(`http://localhost:8081/api/chat/message/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const msgs = await res.json();
  messagesBox.innerHTML = "";

  let lastDate = "";
  msgs.forEach(msg => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) {
      const dateLabel = document.createElement("div");
      dateLabel.className = "date-label";
      dateLabel.textContent = msgDate;
      messagesBox.appendChild(dateLabel);
      lastDate = msgDate;
    }
    addMessage(msg.text, msg.sender._id === user._id, msg._id, msg.createdAt);
  });
}

function addMessage(text, isMine, id, timestamp) {
  const div = document.createElement("div");
  div.className = "message";
  if (isMine) div.classList.add("you");

  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `
    <span class="msg-text">${text}</span>
    <span class="msg-time">${time}</span>
    ${isMine ? `
      <button onclick="editMsg('${id}')">✏️</button>
      <button onclick="deleteMsg('${id}')">🗑️</button>
    ` : ''}
  `;
  div.dataset.id = id;
  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !currentRoomId) return;

  socket.emit("sendMessage", {
    roomId: currentRoomId,
    senderId: user._id,
    text
  });

  const res = await fetch("http://localhost:8081/api/chat/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ roomId: currentRoomId, text })
  });

  const newMsg = await res.json();
  addMessage(newMsg.text, true, newMsg._id, newMsg.createdAt);
  messageInput.value = "";
});

async function deleteMsg(id) {
  if (!confirm("Delete this message?")) return;
  await fetch(`http://localhost:8081/api/chat/message/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function editMsg(id) {
  const newText = prompt("Edit your message:");
  if (!newText) return;
  await fetch(`http://localhost:8081/api/chat/message/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text: newText })
  });
}

socket.on("receiveMessage", (data) => {
  if (data.senderId !== user._id && data.roomId === currentRoomId) {
    addMessage(data.text, false, data._id, data.createdAt);
  }
});

socket.on("deleteMessage", ({ id }) => {
  const msg = document.querySelector(`.message[data-id="${id}"]`);
  if (msg) msg.remove();
});

socket.on("editMessage", ({ id, text }) => {
  const msg = document.querySelector(`.message[data-id="${id}"]`);
  if (msg) {
    msg.querySelector(".msg-text").textContent = text;
  }
});

document.getElementById("createRoomForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("roomName").value.trim();
  if (!name) return;

  await fetch("http://localhost:8081/api/chat/room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  fetchRooms();
  document.getElementById("roomName").value = "";
});

fetchRooms();
