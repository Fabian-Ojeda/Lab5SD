const socket = io("/");

socket.on("spam", (data) => {
    document.getElementById('info').innerHTML += `<h6>${data}</sh6>`

}); 