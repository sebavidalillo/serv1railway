import express from 'express'; 
const app = express(); //retorna aplicacion de express. 
import http from 'http'; 
import {randoms} from './datos.mjs'; 
import mysql from 'mysql'; 
import { exec } from "child_process";
import moment from 'moment-timezone';
import { time } from 'console';

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
      host:'demo-gv3000-1.cnmsiceec0ea.us-east-2.rds.amazonaws.com',
      user:'admin',
      password:'123456789',
      database:'demoInitial', //
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
  var size = 30, //cualquier numero para probar el guardado en base de datos
  time = message['timestamp'], 
  value = null, 
  id_devices_data_types = 1, 
  dateEntry = moment(new Date(message['timestamp']*1000)).format(dateTimeFormat),
  [ip, port] = message['peer'].split(':'),
  gps = null,
  gps_flag = 0; //indicar que si hay o no informacion del gps en el reporte

  ip = transformIp(ip,1); 
  port = parseInt(port); 

  if (message['position.latitude']!== undefined){
    id_devices_data_types = 42; 
    value = 0; 
    gps_flag = 1; 
    //gps = `POINT(${message['position.latitude']} ${message['position.longitude']})`; 
    gps = [message['position.latitude'], message['position.longitude']]; 
    try{
      database.query('insert into md_fleet_devices_data (id_devices_data_types, value, time, gps, ip, port, size, dateEntry) values (?,?,?,POINT(?, ?),?,?,?,?);',[id_devices_data_types, value, time, gps[0], gps[1], ip, port, size, dateEntry],(error)=>{
        if(error){
            throw error;
        }
        else{
            console.log('Inserted GPS in DataBase');
        }
      });  
    }
    catch (error) {
      console.log('error', error)
    }
  }

  for (let llave in message){

    id_devices_data_types = 1,
    value = 0; 

    if (llave == 'can.engine.rpm'){
      id_devices_data_types = 92; 
      value = message[llave]; 
    } else if (llave == 'can.fuel.volume'){
      id_devices_data_types = 82; 
      value = message[llave]; 
    } else if (llave == 'can.vehicle.mileage'){
      id_devices_data_types = 83; 
      value = message[llave];
    };

    if (id_devices_data_types !== 1 && value !== null && time !== null && ip !== null && port !== null && size !== null && dateEntry !== null){
      try {
        database.query('insert into md_fleet_devices_data (id_devices_data_types, value, time, ip, port, size, dateEntry)  values (?,?,?,?,?,?,?);',[id_devices_data_types, value, time, ip, port, size, dateEntry],(error)=>{
             if(error){
                 throw error;
             }
             else{
                 console.log('Inserted in DataBase');
             }
           });
      }
      catch (error) {
        console.log('error:', error)
      }
    };
  };

  
 

  //console.log(time);
};

function transformIp(ip,format){
  try {
      // 1 = ip to int, 2 = int to ip
      console.log('transformIp')
      if(format == 1){
          return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
      }else{
          return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
      }
  } catch (error) {
      console.log('error: '+error+'')
  }
}