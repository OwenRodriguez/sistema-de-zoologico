'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_super_hiper_mega_secreta';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'Petición sin autenticación'});
    }else{
        var token = req.headers.authorization.replace(/["']+/g, '')
        try{
            var payload = jwt.decode(token, key);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'Token expirado'});
            }
        }catch(ex){
            return res.status(404).send({message: 'Token no válido'});
        }
        
        req.user = payload;
        next();

    }
}

exports.ensureAuthAdmin = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'Petición sin autenticación'});
    }else{
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try{
            var payload = jwt.decode(token, key);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'Token expirado'});
            }else if(payload.role != 'ADMIN'){
                return res.status(403).send({message: 'No está autorizado para esta ruta'})
            }
        }catch(ex){
            return res.status(418).send({message: 'Token no válido'});
        }
        req.user = payload;
        next();
    }
}