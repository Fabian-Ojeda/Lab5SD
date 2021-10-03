const express = require('express')
const axios = require('axios');
const app = express()
const port = 4001

var ipLider = ""
var myPriority = 0
var ipsConected = []


app.get('/', (req, res) => {
  res.send('Resulta que el lider es'+ ipLider+ "y mi prioridad es: "+myPriority)
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

function  solicitarLider(){
  axios.get('http://localhost:2000/getIpLeader')
  .then(function (response) {
      if(response.data[0]==0){
            ipLider = 'yo'
      }else{        
        ipLider = response.data[0]
        myPriority = response.data[1]
        conectToleader()
      }    
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
  });
}

function conectToleader(){
    axios.post('http://'+ipLider+':4000/myFirstConection', {            
        priority: myPriority
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });    
}



function broadCastNewConected(ipIn, priorityIn){
    ipsConected.forEach(element => {
        axios.post('http://'+element.ip+':4000/setNewAmiguito', {
            ip:ipIn,            
            priority: priorityIn
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    });
    //se agrega despues para que no se monitoree a ella misma
    ipsConected.push({ip:ipIn, priority: priorityIN})
    console.log(ipsConected)
}

app.post('/myFirstConection', (req, res) => {    
    var ipIn = req.header('x-forwarded-for') || req.socket.remoteAddress;     
    var divisiones = ipIn.split(":", 4);
    ipIn=divisiones[3]
    console.log(ipIn);
    console.log("pillese la prioridad: "+req.body.priority)
    res.send(ipsConected)
    broadCastNewConected(ipIn, req.body.priority)    
})

app.post('/setNewAmiguito', (req, res) => {    
     ipsConected.push({ip:req.body.ip, priority: req.body.priority})
     console.log("soy servidor normal y mire mi lista: "+ipsConected)
})

app.listen(port, () => {
  console.log('Example app listening at http://localhost:${port}')
})

solicitarLider()