'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var animalController = require('../controllers/animal.controller');

var api = express();
var middlewareAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
var middlewareUpload = connectMultiparty({ uploadDir: './uploads/users'});

api.post('/saveUser', userController.saveUser);
api.post('/login', userController.login);
api.get('/pruebaMiddleware',middlewareAuth.ensureAuth, userController.pruebaMiddleware);
api.put('/updateUser/:id', middlewareAuth.ensureAuth, userController.updateUser);
api.post('/uploadImage/:id', [middlewareAuth.ensureAuth, middlewareUpload], userController.uploadImage);
api.get('/getImage/:id/:image',middlewareAuth.ensureAuth, userController.getImage);
api.delete('/deleteUser/:id', userController.deleteUser);
api.get('/listAnimals', animalController.listAnimals);


//Rutas a las cuales solo puede acceder un role admin
api.get('/listUsers', middlewareAuth.ensureAuthAdmin, userController.listUsers);




module.exports = api;