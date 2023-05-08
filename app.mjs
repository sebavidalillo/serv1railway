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
dateTimeFormat = 'YYYY-MM-DD HH:mm:ss',
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
    saveData(message); 
    //console.log(getDateTime()); 
    // new Date().getTime() //MILLIS
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
  var time = message['timestamp'];
  var gps = null; 
  var gps_flag = 0; 
  //console.log(message['position.latitude']); 
  if (message['position.latitude']!== undefined){
    gps_flag = 1; 
    gps = `POINT(${message['position.latitude']}, ${message['position.longitude']})`; 
    console.log(gps); 
  }
  for (let llave in message){
    var id_devices_data_types = 1; 
    var value = 0; 
    var date = null; 
        if (llave == 'can.engine.rpm'){
      id_devices_data_types = 92; 
      value = message[llave]; 
    } else if (llave == 'can.fuel.volume'){
      id_devices_data_types = 82; 
      value = message[llave]; 
    } else if (llave == 'can.vehicle.mileage'){
      id_devices_data_types = 83; 
      value = message[llave];
    } 
    //console.log(id_devices_data_types, value); 
   
    // database.query('insert into md_fleet_devices_data   id_devices_data_types, value, time, ip, port, size, dateEntry)  values ?,?,?,?,?,?,?);',dataToSave,(error)=>{
    //     if(error){
    //         throw error;
    //     }
    //     else{
    //         console.log('Inserted in DataBase');
    //     }
    //   });
    // date entry?? = moment(new Date(message[llave]*1000)).format (dateTimeFormat);
  }
  //console.log(time);
};