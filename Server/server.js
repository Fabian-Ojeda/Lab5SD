const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express()
const http = require('http');
const { verify } = require('crypto');
const server = http.createServer(app);
const exec = require('child-process-async').exec
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
    
});

var isLeader 
var ipLider = ""
var myPriority = 0
var ipsConected = []
var st = ''
var beat
var contested = false

app.get('/', (req, res) => {
  res.send({leader: ipLider, priority: myPriority})
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

function getLeader(){
  axios.get('http://192.168.1.38:2000/getIpLeader')
  .then(function (response) {
      if(response.data[0]==0){
            io.emit('spam', 'Soy el lider');
            ipLider = 'yo'
            isLeader = true
            io.emit('leader' , isLeader)
      }else{                
        ipLider = response.data[0]
        myPriority = response.data[1]
        io.emit('spam', ('Este es el lider: '+ipLider));
        io.emit('spam', ('Esta es mi prioridad: '+myPriority));
        conectToleader()
      }    
  })
  .catch(function (error) {
    console.log(error);
  })
}

function conectToleader(){
    axios.post('http://'+ipLider+':4000/myFirstConection', {            
        priority: myPriority
      })
      .then(function (response) {
        //Aqui vendria la respuesta de las ips conectadas en el medio
        io.emit('spam', 'Esta es la lista de conectados: '+JSON.stringify(response.data));
        ipsConected = response.data
      })
      .catch(function (error) {
        console.log(error);
      });
      monitoringLeader() 
}



function broadCastNewConected(ipIn, priorityIn){
    ipsConected.forEach(element => {
        axios.post('http://'+element.ip+':4000/newhost', {
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
  beat = setInterval(() => {
    axios.get('http://'+ipLider+':4000/status')
          .then(function (response) {
            console.log(response.status+" "+ipLider);
            
            if(response.status==200){
              st = 'El lider esta funcionando'
              io.emit('spam', st);
            }
          })
          .catch(function (error) {
            st= 'El lider ha caido'
            io.emit('spam', st);
            initElections()   
                     
          });
  },(myPriority*1000));
}

async function initElections(){
  clearInterval(beat)
  contested = false
  stopMonitoring()  

  if (contested){
    st= 'Alguien se va a encargar de eso';
    io.emit('spam', st);
  }else{
    st= 'Yo soy el lider';
    isLeader = true
    io.emit('leader' , isLeader)
    io.emit('spam', st);
    await updateLeader()
  }

}

function stopMonitoring(){
  ipsConected.forEach(async(element) => {
    await axios.post('http://'+element.ip+":4000/down")
  });
  doElections()
}

function doElections(){
  ipsConected.forEach(element => {
    if (element.priority>myPriority){
      axios.post('http://'+element.ip+":4000/YouChoose")
      .then(function (response) {
        console.log(response.status);
        if(response.status==200){
          contested = true;
          st = 'El servidor '+element.ip+' se va a encargar de seleccionar';
          io.emit('spam', st);          
        }
      })
      .catch(function (error) {
        st = 'El servidor '+element.ip+' Tambien esta caido';
        io.emit('spam', st);
      });
    }
  })
}

async function updateLeader(){
  ipsConected.forEach(async (element) => {
    await axios.post('http://'+element.ip+':4000/newLeader')
  });
  await axios.post('http://192.168.1.38:2000/newLeader')
}

function deleteLeaderForList(ip){
  ipsConected.forEach(element => {
    if(element.ip == ip){
        removeItemFromArr(ipsConected, element)
    }
  });
}

function removeItemFromArr ( arr, item ) {
  var i = arr.indexOf( item );
  if ( i !== -1 ) {
      arr.splice( i, 1 );
  }
}

async function verifyAnotherLeaders(){
  contested = false
  await doElections()
  
  if (contested){
    st= 'Alguien se va a encargar de eso';
    io.emit('spam', st);
  }else{
    st= 'Yo soy el lider';
    io.emit('spam', st);
   await updateLeader()
  }
}

app.post('/newLeader', (req, res, next) => {    
  var ipIn = req.header('x-forwarded-for') || req.socket.remoteAddress;     
  var divisiones = ipIn.split(":", 4);
  ipIn=divisiones[3]
  ipLider=ipIn
  deleteLeaderForList(ipLider)
  io.emit('spam', ("El nuevo lider es: "+ipLider));
  monitoringLeader()
  next()
})

app.post('/YouChoose', (req, res) => {    
  res.sendStatus(200)
  verifyAnotherLeaders()
})


app.post('/down', (req, res, next) => { 
  var ipIn = req.header('x-forwarded-for') || req.socket.remoteAddress;     
  var divisiones = ipIn.split(":", 4);
  ipIn=divisiones[3]  
  clearInterval(beat)
  io.emit('spam', ('El servidor '+ipIn+' nos dice que debemos dejar de hacer latidos al lider'));
  next();
})

app.get('/status', (req, res, next) => {
  res.sendStatus(200)
  next()
})

app.get('/view', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/myFirstConection', (req, res, next) => {    
    var ipIn = req.header('x-forwarded-for') || req.socket.remoteAddress;     
    var divisiones = ipIn.split(":", 4);
    ipIn=divisiones[3]
    console.log(ipIn);
    io.emit('spam',("El servidor "+ ipIn+ "Se conecto al esquema"))
    res.send(ipsConected)
    broadCastNewConected(ipIn, req.body.priority)   
    next() 
})

//TODO
app.post('/newhost', (req, res) => {    
     ipsConected.push({ip:req.body.ip, priority: req.body.priority})
     io.emit('spam', ("Me informan que el servidor: "+req.body.ip+" se ha unido, tiene de prioridad: "+req.body.priority));
})

app.post('/StopLeader',(req,res)=> {
   exec('pm2 stop 0')
})

server.listen(port, () => {
  console.log('listening on *:4000');
});

setTimeout(function(){
  getLeader()
},5000);
