'use strict'

var Animal = require('../models/animal.model');
var fs = require('fs');
var path = require('path');


function saveAnimal(req,res){
    var params = req.body;
    var animal = new Animal();

    if(params.name &&
        params.nickName &&
        params.age ){
           
            animal.name = params.name,
            animal.nickName = params.nickName,
            animal.age = params.age;

            animal.save((err,animalSaved)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(animalSaved){
                    res.status(200).send({Animal: animalSaved});
                }else{
                    res.status(418).send({message:'Animal no guardado, intente mas tarde'});
                }
            });
        }else{
            res.send({message:'Ingresa todos los datos'});
        }
}

function updateAnimal(req, res){
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update,(err, animalUpdated)=>{
        if(err){
            res.status(500).send({message: 'Error al actualizar'});
        }else if(animalUpdated){
            res.send({animal: animalUpdated});
        }else{
            res.status(404).send({message: 'No se ha podido actualizar'});
        }
    });
  
}

function deleteAnimal(req, res){
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId,(err, animalDelete)=>{
        if(err){
            res.status(500).send({message: 'Error in the server'});
        }else if(animalDelete){
            res.status(200).send({message: 'Animal eliminado', animalDelete});
        }else{
            res.status(404).send({message: 'Error al eliminar'});
        }
    });
}

function uploadImage(req, res){
    var animalId = req.params.id;
    var fileName = 'sin imagen';
    
    if(req.files){

        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];
        var ext = fileName.split('\.');
        var fileExt = ext[1];

        if(fileExt == 'png'||
           fileExt == 'jpg'||
           fileExt == 'jpeg'||
           fileExt == 'gif'){

            Animal.findByIdAndUpdate(animalId,{image:fileName}, {new: true},(err, uploadeImageAnimal)=>{
                if(err){
                    res.status(500).send({message:'Error general al subir imagen'});
                }else if(uploadeImageAnimal){
                    res.send({animal:uploadeImageAnimal,nameImage: uploadeImageAnimal.image});
                }else{
                    res.status(404).send({message:'Extencion de archivo no admitido'});
                }
            });
        }else{
            fs.unlink(filePath,(err)=>{
                if(err){
                    res.status(418).send({message:'extension de archivo no admitida'});
                }else {
                    res.status(418).send({message:'extension de archivo no admitida y archivo eliminado'});
                }             
            });
        }
    }else{
        res.status(418).send({message:'Enviar un Archivo'});
    }
}



function getImage(req, res){
    var imageName = req.params.image;
    var filePath = './uploads/users/'+imageName;
    
        fs.exists(filePath, (exists)=>{
            if(exists){
                res.sendFile(path.resolve(filePath));
            }else{
                res.status(404).send({message:'Imagen Existente'});
            }
        });
}

function listAnimals(req, res){
    Animal.find({}, (err, animals)=>{
        if(err){
            res.status(500).send({message: 'Error general en la búsqueda'});
        }else if(animals){
            res.send({animals: animals});
        }else{
            res.status(418).send({message: 'Sin datos para mostrar'});
        }
    });
}


module.exports={
    saveAnimal,
    updateAnimal,
    deleteAnimal,
    uploadImage,
    getImage,
    listAnimals
}

