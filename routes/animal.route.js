'use strict'

var express = require('express');

var animalController = require('../controllers/animal.controller');
var api = express();
var middlewareAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
var middlewareUpload = connectMultiparty({ uploadDir: './uploads/animals'});

api.get('/listAnimals', animalController.listAnimals);

//Rutas a las cuales solo puede acceder un role admin
api.post('/saveAnimal', middlewareAuth.ensureAuthAdmin, animalController.saveAnimal);
api.put('/updateAnimal/:id', middlewareAuth.ensureAuthAdmin, animalController.updateAnimal);
api.delete('/deleteAnimal/:id', middlewareAuth.ensureAuthAdmin, animalController.deleteAnimal);
api.post('/uploadImage/:id', [middlewareAuth.ensureAuth, middlewareUpload], animalController.uploadImage);
api.get('/getImage/:id/:image', middlewareAuth.ensureAuth, animalController.getImage);

module.exports = api;