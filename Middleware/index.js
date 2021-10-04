
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
            "\n git clone" +
            "\n cd " +
            "\n cd " +
            "\n sudo npm i" +
            "\n sudo npm i -g pm2" +
            "\n pm2 start index.js" +
            "\nSHELL" +
            "\nend",
            function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("el archivo fue creado correctamente");
            }
        );
    });
    exec("cd resources/vm/" + id + "/&&vagrant up --provision");
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/newInstance', (req, res) => {
    res.send('ah bueno pa saber')
    console.log("nueva instancia, es copiar y pegar lo de crear nueva instancia")
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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})