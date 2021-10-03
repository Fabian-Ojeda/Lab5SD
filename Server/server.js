const express = require('express')
const axios = require('axios');
const app = express()
const port = 4000

var ipLider = ""
var priority = 0

app.get('/', (req, res) => {
  res.send('Resulta que el lider es'+ ipLider+ "y mi prioridad es: "+priority)
})


function  solicitarLider(){
  axios.get('http://localhost:2000/getIpLeader')
  .then(function (response) {
      if(response.data[0]==0){
            ipLider = 'yo'
      }else{        
        ipLider = response.data[0]
        priority = response.data[1]
      }    
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
  });
}

app.listen(port, () => {
  console.log('Example app listening at http://localhost:${port}')
})

solicitarLider()