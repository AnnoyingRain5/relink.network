let socket = new WebSocket("wss://relink.relink.network:443");
let username = "";
let channel = "";
Notification.requestPermission();

function login() {
  username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  socket.send(
    JSON.stringify({
      PacketType: "login",
      username: username,
      password: password,
    })
  );
}
function signup() {
  username = document.getElementById("su-username").value;
  let password = document.getElementById("su-password").value;
  socket.send(
    JSON.stringify({
      PacketType: "signup",
      username: username,
      password: password,
    })
  );
}
function changeChannel() {
  let newchannel = document.getElementById("channel").value;
  socket.send(
    JSON.stringify({
      PacketType: "command",
      name: "switch",
      args: [newchannel],
    })
  );
  document.getElementById("channel").value = "";
}

function runCommand() {
  let command = document.getElementById("command").value;
  socket.send(
    JSON.stringify({
      PacketType: "command",
      name: command.split(" ")[0],
      args: command.split(" ").slice(1),
    })
  );
}

function sendMessage() {
  let message = document.getElementById("message").value;
  socket.send(
    JSON.stringify({
      PacketType: "message",
      message: message,
      username: username,
      isDM: channel.startsWith("@"),
    })
  );
  document.getElementById("message").value = "";
}
socket.onopen = function (e) {
  console.log("connected");
};

socket.onmessage = function (event) {
  let data = JSON.parse(event.data);
  if (data.PacketType == "message") {
    if (data.isDM) {
      alert("You just got a DM from " + data.username + ": " + data.message);
    } else {
      let messagebox = document.createElement("div");
      messagebox.setAttribute("class", "Middle");
      messagebox.setAttribute("style", "text-align: left;");
      let usernamespan = document.createElement("span");
      let messagespan = document.createElement("span");
      if (data.username === username) {
        usernamespan.setAttribute("style", "color: rgb(93, 255, 56);");
      } else {
        usernamespan.setAttribute("style", "color: rgb(103, 240, 235);");
      }
      usernamespan.innerText = data.username;
      messagespan.innerText = ": " + data.message;
      messagebox.appendChild(usernamespan);
      messagebox.appendChild(messagespan);
      document.getElementById("chat").appendChild(messagebox);
      document
        .getElementById("chat")
        .appendChild(document.createElement("br"))
        .scrollIntoView();
    }
  } else if (data.PacketType == "result") {
    if (data.result == true) {
      document.getElementById("login").remove();
      document.getElementById("UI").style.visibility = "visible";
      document.getElementById("chat").style.visibility = "visible";
      document.getElementById("title").style.visibility = "visible";
    } else {
      alert(
        "Login or sign up failed for the following reason: \n" + data.reason
      );
    }
  } else if (data.PacketType == "ChannelChange") {
    channel = data.channel;
    document.getElementById("title").children[0].innerHTML = innerText =
      "#" + channel;
    console.log("Channel changed to " + channel);
    document.getElementById("chat").innerHTML = "";
  } else if (data.PacketType == "notification") {
    new Notification(
      (body = "you got a " + data.type + " at " + data.location)
    );
  } else if (data.PacketType == "system") {
    let message = document.createElement("div");
    message.setAttribute("class", "Middle");
    message.setAttribute("style", "text-align: left; color: yellow;");
    message.innerHTML = data.message;
    document.getElementById("chat").appendChild(message);
    document
      .getElementById("chat")
      .appendChild(document.createElement("br"))
      .scrollIntoView();
  }
};
socket.onclose = function (event) {
  if (event.wasClean) {
    alert(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    alert("[close] Connection died");
  }
};

socket.onerror = function (error) {
  alert(`[error]`);
};
