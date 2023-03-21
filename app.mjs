import express from 'express'; 
const app = express(); //retorna aplicacion de express. 
import http from 'http'; 
import {randoms} from './datos.mjs'; 

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

//Routing
app.get('/', (req,res) => {
    res.send('Primer servido'); 
});

app.get('/datos', (req,res) => {
    res.send(randoms); 
});

app.get('/datos/personas', (req,res) => {
    res.send(randoms.Personas); 
});

app.get('/datos/personas/:nombre', (req,res) => {
    const nombre = req.params.nombre;
    const resultados = randoms.Personas.filter(persona => persona.nombre == nombre);
    if (resultados.length ===0) {
        return res.status(404).send(`no hay ${nombre}`); 
    }
    res.send(JSON.stringify(resultados));  
}); 

app.get('/datos/drogas/:nombredroga', (req,res)=>{
    const nombredroga = req.params.nombredroga; 
    const resultados = randoms.drogas.filter(droga => droga.nombre == nombredroga);
    res.send(JSON.stringify(resultados)); 
}); 

app.post('/', function (req, res) {
    console.log(req.body);
    res.send();
  });

app.put('/', (req,res)=>{
    let data = req.body;  
    console.log(req.body);
    res.status(200).send(JSON.stringify(randoms));
}); 

const PUERTO = process.env.PORT || 3000; // en caso de que el servicio entregue puerto 
app.listen(PUERTO, ()=> {
    console.log(`servidor rescuchando en ${PUERTO}...`)
}); 

const net = require('net');

const server = net.createServer(function(socket) {
    socket.write('hello\n');
    socket.write('world\n');
    socket.on('data', function(data) {
       socket.write('You said: ' + data);
    })
});

server.listen(10000);
