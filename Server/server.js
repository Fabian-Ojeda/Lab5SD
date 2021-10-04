const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express()
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
app.use("/static", express.static("static"));
const port = 4000
const config = {
  application: {
      cors: {
          server: [
              {
                  origin: ('*'),
                  credentials: true
              }
          ]
      }
  },

}

app.use(cors(
  config.application.cors.server
));

app.use(express.json());


io.on('connection', (socket) => {
  
  /*io.emit('spam', arrayIdsHours);
  socket.on("spam", (data) => {    
    refreshClientsHours(socket.id, data)
  });*/
});

var ipLider = ""
var myPriority = 0
var ipsConected = []
var st = ''
var cosa
/*var eventConsultHour = setInterval(function () {
  io.emit('spam', 'mensaje del servidor');
}, 1000)*/

app.get('/', (req, res) => {
  res.send('Resulta que el lider es'+ ipLider+ " y mi prioridad es: "+myPriority)
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

function  solicitarLider(){
  axios.get('http://192.168.1.38:2000/getIpLeader')
  .then(function (response) {
      if(response.data[0]==0){
            console.log('soy lider')
            io.emit('spam', 'Soy el lider');
            ipLider = 'yo'
      }else{                
        ipLider = response.data[0]
        myPriority = response.data[1]
        io.emit('spam', ('Este es lider: '+ipLider));
        io.emit('spam', ('Esta es mi prioridad: '+myPriority));
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
        //Aqui vendria la respuesta de las ips conectadas en el medio
        io.emit('spam', 'Esta es la lista de conectados: '+response.data);
        ipsConected = response.data
      })
      .catch(function (error) {
        console.log(error);
      });
      monitoringLeader() 
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
    ipsConected.push({ip:ipIn, priority: priorityIn})
    console.log(ipsConected)
}

function monitoringLeader(){
  cosa = setInterval(() => {
    axios.get('http://'+ipLider+':4000/status', {
            
          })
          .then(function (response) {
            console.log(response.status);
            
            if(response.status==200){
              st= 'El servidor esta una berraquera practicamente pues, pues, pues, pues'
              io.emit('spam', st);
            }else{
              
            }
          })
          .catch(function (error) {
            st= 'El servidor se hizo coger tristeza'
            io.emit('spam', st);
            clearInterval(cosa)
            initElections()            
          });
  }, 2000);
}

function initElections(){
  ipsConected.forEach(element => {
    axios.post('http://'+element.ip+":4000/tristeza")
  });
}

app.post('/tristeza', (req, res) => {    
  clearInterval(cosa)
  io.emit('spam', ('Dejamos de comunicarnos con el lider, el lider se va a hacer tapiar'));
})

app.get('/status', (req, res) => {
  res.sendStatus(200)
})

app.get('/view', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

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

server.listen(port, () => {
  console.log('listening on *:4000');
});

setTimeout(function(){
  solicitarLider()
},5000);
