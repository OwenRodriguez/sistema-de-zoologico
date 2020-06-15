'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3300;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/ZooV2BV', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log('Conexion a la BD correcta');
    app.listen(port, ()=>{
        console.log('Servidor de express corriendo');
    });
}).catch(err=>{
    console.log('Error al contarse a la BD', err);
});