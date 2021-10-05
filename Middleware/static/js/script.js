const socket = io("/");

socket.on("info", (data) => {
    document.getElementById('info').innerHTML += `<h6>${data}</sh6>`
}); 

function createInstance(){
    
    axios.post('http://localhost:2000/newInstance').then((result) => {
        alert(result.data);
      })
}

