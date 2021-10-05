const socket = io("/");

socket.on("spam", (data) => {
    if (data = 'Yo soy el lider') {
        document.getElementById('info').innerHTML += `<center><h1>${data}</h1></center>`
    } else {
        document.getElementById('info').innerHTML += `<h6>${data}</h6>`
    }
});

socket.on("leader", (data) => {
    document.getElementById('divButton').style = 'block'
});

function stopLeader() {
    axios.post('http://localhost:4000/StopLeader').then((result) => {
        alert(result.data);
    })
}