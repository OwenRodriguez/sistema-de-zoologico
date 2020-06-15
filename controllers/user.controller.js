'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if( params.name &&
        params.username &&
        params.email &&
        params.password){
            User.findOne({$or:[{username: params.username}, 
                {email: params.email}]}, (err, userFind)=>{
                    if(err){
                        res.status(500).send({message: 'Error general en la busqueda'});
                    }else if(userFind){
                        res.send({message: 'Usuario o correo ya utilizado'});
                    }else{
                        user.name = params.name;
                        user.username = params.username;
                        user.email = params.email;
                        user.role = 'USER';

                        bcrypt.hash(params.password, null, null, (err, hashPassword)=>{
                            if(err){
                                res.status(500).send({message: 'Error de ecriptación'});
                            }else{
                                user.password = hashPassword;

                                user.save((err, userSaved)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general al guardar usuario'});
                                    }else if(userSaved){
                                        res.send({user: userSaved});
                                    }else{
                                        res.status(418).send({message: 'Usuario no guardado, intenta mas tarde'});
                                    }
                                });
                            }
                        });
                    }
                });
    }else{

        res.send({message:'Ingresa todos los datos'});
    }
}

function login(req, res){
    var params = req.body;

    if(params.username || params.email){
        if(params.password){
            User.findOne({$or:[{username: params.username},
            {email: params.email}]}, (err, userFind)=>{
                if(err){
                    res.status(500).send({message:'Error general al buscar datos'});
                }else if(userFind){
                    bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                        if(err){
                            res.status(500).send({message: 'Error al comparar contraseñas'});
                        }else if(checkPassword){
                            if(params.gettoken){
                                res.send({token:jwt.createToken(userFind)})
                            }else{
                                res.send({user: userFind});
                            }
                        }else{
                            res.status(418).send({message: 'Contraseña incorrecta'});
                        }
                    });
                }else{
                    res.send({message: 'Usuario no encontrado'});
                }
            });
        }else{
            res.send({message: 'Por favor ingresa la contraseña'});
        }
    }else{
        res.send({message: 'Ingresa el nombre de usuario o correo'});
    }
}

function pruebaMiddleware(req, res){
    var user = req.user;
    res.send({message: 'Middleware funcionando', user: user});
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de permisos, usuario no logeado'});
    }else{
        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
            if(err){
                res.status(500).send({message: 'Error general al actualizar'});
            }else if(userUpdated){
                res.send({user: userUpdated});
            }else{
                res.status(404).send({message: 'No se ha podido actualizar'});
            }
        });
    }
}

function uploadImage(req, res){
    var userId = req.params.id;
    var fileName = 'Sin imagen';

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de permisos, usuario no logeado'});
    }else{
        if(req.files){
            //Es la ruta completa
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');
            var fileName = fileSplit[2];
    
            var ext = fileName.split('\.');
            var fileExt = ext[1];
            if( fileExt == 'png' ||
                fileExt == 'jpg' ||
                fileExt == 'jpeg' ||
                fileExt == 'gif'){
                
                User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, uploadImageUser)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al actualizar'});
                    }else if(uploadImageUser){
                        res.send({user: uploadImageUser, nameImage: uploadImageUser.image});
                    }else{
                        res.status(404).send({message: 'No se ha podido subir la imagen'});
                    }
                });
            }else{
                fs.unlink(filePath, (err)=>{
                    if(err){
                        res.status(418).send({message: 'Extensión de archivo no admitida y archivo no eliminado'});
                    }else{
                        res.status(418).send({message: 'Extensión de archivo no admitida, y archivo eliminado'});
                    }
                });
            }
    
        }else{
            res.status(418).send({message: 'Envía un archivo'});
        }
    }  

}

function getImage(req, res){
    var userId = req.params.id;
    var imageName = req.params.image;
    var filePath = './uploads/users/'+imageName;

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de permisos, usuario no logeado'});
    }else{
        fs.exists(filePath, (exists)=>{
            if(exists){
                res.sendFile(path.resolve(filePath));
            }else{
                res.status(404).send({message: 'Imagen inexistente'});
            }
        });
    }
}

function listUsers(req, res){
    User.find({}, (err, users)=>{
        if(err){
            res.status(500).send({message: 'Error general en la búsqueda'});
        }else if(users){
            res.send({users: users});
        }else{
            res.status(418).send({message: 'Sin datos para mostrar'});
        }
    });
}

function deleteUser(req,res){
    var userId = req.params.id;

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de permisos, usuario no logeado'});
    }else{
        User.findByIdAndRemove(userId, (err,userDelete)=>{
            if(err){
                res.status(500).send({message:'Error general al borrar'});
            }else if(userDelete){
                res.status.send({message:'Usuario eliminado', userDelete});
            }else{
                res.status(404).send({message:'Error al eliminar'});
            }
        });
    }
}



module.exports = {
    saveUser,
    login,
    pruebaMiddleware,
    updateUser,
    uploadImage,
    getImage,
    listUsers,
    deleteUser
}