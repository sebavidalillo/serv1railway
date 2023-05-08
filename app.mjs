import express from 'express'; 
const app = express(); //retorna aplicacion de express. 
import http from 'http'; 
import {randoms} from './datos.mjs'; 
import mysql from 'mysql'; 
import { exec } from "child_process";
import moment from 'moment-timezone';

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const port = 3000;
var database,
dataTypes = [],
clients=[],
dateTimeFormat = 'YYYY-MM-DD HH:mm:ss ZZ',
timeZone = '-04:00'; 
//ip = 'my_host'; 

function getTimeZone(){
    exec("date +%:z", (error, stdout, stderr) => {
      if(error || stderr){ return ''; }
      // timeZone = stdout.replace('\n','');
    });
  }

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
    const message = req.body; 
    console.log(getDateTime()); 
    // database.query('insert into messages (id_data, data) value (?,?);',data,(error)=>{
    //     if(error){
    //         throw error;
    //     }
    //     else{
    //         console.log('Inserted in DataBase');
    //     }
    //   });
    res.sendStatus(200);
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


function getDateTime(){
    try {
      getTimeZone();
      return moment.utc().utcOffset(timeZone).format(dateTimeFormat);
    } catch (error) {
        console.log('error: '+error+'')
    }
  }

function saveData(message){
    const rpm = message['can.engine.rpm']; 
    const imei = message['ident']; 
    const odometer = message['can.vehicle.mileage']; 
    const fuel = message['can.fuel.volume']; 
    const mentira = message['mentira']; //si no está definido se queda como undefined
    //const data = [id_devices_data_types, value, time, ip, port, size, dateEntry];
}