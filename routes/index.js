var express = require('express');
var router = express.Router();
const User= require("../models/User");
const bcrypt = require('bcrypt');


let generateHash=(data,salts)=>{
  return bcrypt.hashSync(data, salts);
}



router.post('/createAccount', function(req, res, next) {
const{username,password,email}= req.body;
//busco el usuario en la db
User.findOne({username:username}).then(userInfo=>{
  if(userInfo==null){
    //si no existe lo creo y genero una sesion único en toda la db
    const createUser = new User({ username: username,password:generateHash(password,10),sessionStatus:true,session:generateHash(username,10),email:email });
    createUser.save().then((info) => res.json({nota:"Usuario creado con exito","sessionStatus":info.sessionStatus,"session":info.session})).catch();
  }else{
    //si ya existe no lo creo y devuelvo un mensaje de existencia.
    res.json({nota:"El usuario ya existe"})
  }
}).catch()
});

router.post('/login', function(req, res, next) {
  const{username,password}= req.body;
  

//busco el usuario en la db
User.findOne({username:username}).then(userInfo=>{
  //compruebo si existe el user en la db
  if(userInfo==null){
   res.json({nota:"usuario no existe"})
  }
//pruebo comprar la contraseña introducida con la encriptada de la db 
 if(bcrypt.compareSync(password, userInfo.password)!==true){
  res.json({nota:"contraseña incorrecta"})
 }
// permito el acceso porque la contraseña es correcta genero una session, la guardo en db y se la paso a cliente.
 if(bcrypt.compareSync(password, userInfo.password)){
  User.findOneAndUpdate({"username":username},{"sessionStatus":true,session:generateHash(username,5)}).then(()=>{
   User.findOne({"username":username}).then((response)=>{res.json({nota:"Acceso permitido",sessionStatus:response.sessionStatus,session:response.session})}).catch()
  }).catch()
 }
}).catch()
});

router.post('/logOut', function(req, res, next) {
//genero una nueva sesion para sustituir la que el cliente tiene y asi desconectarle , no puedo dejar la sesión vacía.
const{session}= req.body;
const hashNewSession= generateHash(session,5);
User.findOneAndUpdate({"session":session},{"sessionStatus":false,"session":hashNewSession}).then((sessionId)=>{
  if(sessionId==null){
    res.json({nota:"sesión cerrada",sessionStatus:false})
  }else{
    User.findOne({"session":hashNewSession}).then((response)=>{res.json({nota:"Sesión cerrada con éxito.",sessionStatus:response.sessionStatus,session:response.session})}).catch()
  }
}).catch()
});




module.exports = router;
