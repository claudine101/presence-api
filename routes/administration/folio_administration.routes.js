const express = require('express');
const foliocontroller= require('../../controllers/administration/folio_administration.controller');
const folioroutes= express.Router()

folioroutes.get("/",foliocontroller.findAll);

module.exports=folioroutes
