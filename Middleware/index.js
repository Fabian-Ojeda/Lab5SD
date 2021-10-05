
const express = require('express')
const cors = require('cors');
const fs = require('fs');
const exec = require("child-process-async").exec;
const app = express()
const port = 2000
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

app.use("/static", express.static("static"));

var alreayLeader = false
var ip_host_id = 200
var id = 0;
var ip_leader = '192.168.1.38'
var lastPriority = 10

function generateInstanceNetwork() {
    let ip = "192.168.1.";
    ip += ip_host_id;
    ip_host_id++;    
    createVM(ip, id);
    id++;
}

function createVM(ip, id) {
    fs.mkdir("./resources/vm/" + id, (err) => {
        if (err && err.code != "EEXIST") throw "up";
        fs.writeFile(
            "./resources/vm/" + id + "/Vagrantfile",
            'Vagrant.configure("2") do |config|\n' +
            'config.vm.box = "matjung/nodejs14"\n' +
            'config.vm.network "public_network", ip: "' +
            ip +
            '"' +
            '\nconfig.vm.provision "shell", inline: <<-SHELL' +
            "\n apt-get update\n apt-get upgrade" +
            "\n sudo rm app" +
            "\n sudo mkdir app" +
            "\n cd app" +
            "\n git clone https://github.com/Fabian-Ojeda/Lab5SD.git" +
            "\n cd Lab5SD" +
            "\n cd Server" +
            "\n sudo npm i" +
            "\n sudo npm i -g pm2" +
            "\n pm2 start index.js" +
            "\nSHELL" +
            "\nend",
            function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("VagrantVM is loading...");
            }
        );
    });
    exec("cd resources/vm/" + id + "/&&vagrant up --provision");
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/newInstance', (req, res) => {
    generateInstanceNetwork()
})

app.get('/getIpLeader', (req, res) => {    
    
    if (alreayLeader){        
        res.send([ip_leader, lastPriority])
        lastPriority--
    }else{ 
        var ipIn = req.header('x-forwarded-for') || req.socket.remoteAddress;     
        var divisiones = ipIn.split(":", 4);
        ipIn=divisiones[3] 
        ip_leader=ipIn              
        alreayLeader = true
        lastPriority--
        res.send([0]);
    }
})
app.post('/newLeader', (req, res) => {    
    var ipIn = req.header('x-forwarded-for') || req.socket.remoteAddress;     
    var divisiones = ipIn.split(":", 4);
    ipIn=divisiones[3]
    ip_leader=ipIn
  })

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})