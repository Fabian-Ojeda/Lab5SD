const socket = io("http://localhost:4000/");

socket.on("spam", (data) => {
    document.getElementById('info').innerHTML += `${data}`

});