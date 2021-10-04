const socket = io("/");

socket.on("spam", (data) => {
    document.getElementById('info').innerHTML += `${data}`

});