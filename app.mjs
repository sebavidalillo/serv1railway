import express from 'express'; 
const app = express(); //retorna aplicacion de express. 
import http from 'http'; 
import {randoms} from './datos.mjs'; 
import mysql from 'mysql'; 

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

//port = process.env.PORT || 3000; 
const port = 3000;
var database,
dataTypes = [],
clients=[],
dateTimeFormat = 'YYYY-MM-DD HH:mm:ss ZZ',
timeZone = '-04:00'; 
//ip = 'my_host'; 

database = mysql.createPool({
      connectionLimit:10,
      host:'localhost',
      user:'root',
      password:'123456789',
      database:'somax_clon1', //
      debug:false
});


//Routing
app.get('/', (req,res) => {
    res.send('Servidor 1'); 
});

app.get('/datos', (req,res) => {
    res.send(randoms); 
});

app.post('/', function (req, res) {
    //console.log(req.body);
    let message = req.body; 
    let rpm = message['can.engine.rpm']; 
    database.query('insert into messages (id_data, data) value (?,?);',[42,rpm],(error)=>{
        if(error){
            throw error;
        }
        else{
            console.log('Inserted in DataBase');
        }
      });
    res.send(200);
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