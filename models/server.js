const express = require('express');
const cors = require('cors');
const { socketController } = require('../sockets/controller');

class Server{

    constructor(){
        this.app = express();
        this.port = process.env.PORT;
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);

        this.paths = {
            apigpt: '/api'
        }

        //Middlewares
        this.middlewares();

        //Rutas de aplicación
        this.routes();

        //Sockets
        this.sockets();
    }

    middlewares(){
        //CORS
        this.app.use(cors());

        //Lectura y parsear body a json
        this.app.use(express.json());

        //Directorio público
        this.app.use(express.static('public'));

    }

    routes(){
        this.app.use(this.paths.apigpt,require('../routes/openai.route'));
    }

    sockets(){
        this.io.on("connection", ( socket ) => socketController( socket, this.io ));
    }

    listen(){

        //con sockets
        this.server.listen(this.port,  ()=>{
            console.log('Servidor corriendo en puerto ',this.port);
        })

        //sin sockets
        // this.app.listen(this.port,  ()=>{
        //     console.log('Servidor corriendo en puerto ',this.port);
        // })
    }
}

module.exports = Server;