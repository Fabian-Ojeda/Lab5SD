const socket = io("/");

socket.on("spam", (data) => {
          
    document.getElementById('info').innerHTML += `<h6>${data}</h6>`
    
});

socket.on("leader", (data) => {
    document.getElementById('divButton').style = 'block'
});

async function stopLeader() {
    console.log("wenas")
    await axios.post('http://localhost:4000/StopLeader')
}