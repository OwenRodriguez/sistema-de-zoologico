'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_super_hiper_mega_secreta';

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(20, "minutes").unix()
    };
    
    return jwt.encode(payload, key);
}