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

const PUERTO = process.env.PORT || 3000; // en caso de que el servicio 
const port = 3000;
var database;
var devices = [],
reqBodyBuff =[], 
//dataTypes = [],
//clients=[],
dateTimeFormat = 'YYYY-MM-DD HH:mm:ss',
timeZone = '-04:00'; 
var server; 

function getTimeZone(){
    exec("date +%:z", (error, stdout, stderr) => {
      if(error || stderr){ return ''; }
      // timeZone = stdout.replace('\n','');
    });
};

function connectionDataBase() {
  database = mysql.createPool({
      connectionLimit:10,
      host:'localhost',
      user:'root',
      password:'123456789',
      database:'somax_clon1', 
      debug:false
  }); 
  getDevices(); 
};


//Routing
app.get('/', (req,res) => {
    res.send('Servidor 1'); 
});

app.get('/datos', (req,res) => {
    res.send(randoms); 
});

app.post('/', function (req, res) { 
    //console.log(req.body);
    //const message = req.body; 
    //saveData(getValuesBuff(req.body)); //esto debería hacerse cada cierto rato.
    reqBodyBuff.push(req.body); 
    //console.log(getDateTime()); 
    // new Date().getTime() //MILLIS
    res.sendStatus(200);
  });

function getDateTime(){
    try {
      getTimeZone();
      return moment.utc().utcOffset(timeZone).format(dateTimeFormat);
    } catch (error) {
        console.log('error: '+error+'')
    }
  };

function getValuesBuff(message){
  var size = 30, //cualquier numero para probar el guardado en base de datos
  value = null,
  id_devices_data_types = 1,
  ip,
  port; 
  if (message.length !== 0){
    var time = message['timestamp'], 
    dateEntry = moment(new Date(message['timestamp']*1000)).format(dateTimeFormat),
    [ip, port] = message['peer'].split(':'),
    gps = null,
    gps_flag = 0, //indicar que si hay o no informacion del gps en el reporte
    ip = transformIp(ip,1),
    port = parseInt(port),
    valuesBuff=""; 

    for (let llave in message){

      id_devices_data_types = 1,
      value = 0; 

      if (llave == 'can.fuel.volume'){
        id_devices_data_types = 82; 
        value = message[llave]; 
      } else if (llave == 'can.vehicle.mileage'){
        id_devices_data_types = 83; 
        value = message[llave];
      } else if (llave== 'position.latitude'){
        id_devices_data_types = 42; 
        gps = [message['position.latitude'], message['position.longitude']];
        gps_flag=1; 
      };

      if (id_devices_data_types !== 1 && value !== null && time !== null && ip  !== null && port !== null && size !== null && dateEntry !== null){
        if(valuesBuff !== ""){ valuesBuff += ","; }
        if(gps_flag == 1){
          valuesBuff += '('+id_devices_data_types+','+value+','+time+',POINT('  +gps+'),'+ip+','+port+','+size+',"'+dateEntry+'")'; 
        } else if (gps_flag==0){
          valuesBuff += '('+id_devices_data_types+','+value+','+time+',POINT  (null,null),'+ip+','+port+','+size+',"'+dateEntry+'")';
        };

      };
    };
  }
  return valuesBuff;   
};

//Hace una query a la BD de valuesBuff
function saveData(valuesBuff){
  if(valuesBuff !== undefined){
    try {
      database.query('insert into md_fleet_devices_data   (id_devices_data_types, value, time, gps, ip, port, size, dateEntry)    values '+valuesBuff+'',(error)=>{
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
  }} else {
    console.log('valuesBuff undefined');
  } 
};

function saveDevice(imei){
  try {
      console.log('saveDevice')
      var consult = 'insert into demoBatchile.md_fleet_devices(imei, dateEntry) values ('+imei+', "'+getDateTime()+'")'
      database.query(consult, function(error,rows,fields){
          if(error){
              console.log(error);
          }else{
              console.log('save new device ok');
              getDevices();
          }
      })
  } catch (error) {
      console.log('error: '+error+'')
  }
}

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

function getDevices(){
  try {
      console.log("Finding all Devices")
      //var consult = 'select id_devices, imei from somax_clon1.md_fleet_devices';
      //query = mysql.format(consult)
      database.query('select id_devices, imei from somax_clon1.md_fleet_devices', function(error,rows,fields){
          if(error){
              console.log(error);
          }else{
              //console.log(rows); 
              devices = rows;
          }
      })
  } catch (error) {
      console.log('error: '+error+'')
  }
};

function initServer(){
  try {
      console.log('initServer')
          //cleanInterval();
          connectionDataBase();
          server = app.listen(PUERTO, ()=> {
            console.log(`servidor rescuchando en ${PUERTO}...`); 
        });
  } catch (error) {
      console.log('error: '+error+'')
  }
};

initServer();

server.on('listening', ()=>{
  console.log('evento listening activado');
  setInterval(()=>{
    //savedata? 
    console.log(reqBodyBuff);
    console.log(getValuesBuff(reqBodyBuff));
    saveData(getValuesBuff(reqBodyBuff));
    console.log('pasaron 10 segundos')
  },1000); 
});