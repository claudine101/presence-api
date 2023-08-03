const express = require('express')
const scanning_folio_controller = require('../../controllers/scanning/scanning_folio.controller')
const scanning_folio_routes = express.Router()

 /**
* Une route pour recuperer la liste des folios apartenant dans un volume
*@method GET
* @url /scanning/folio
*/
scanning_folio_routes.get('/:ID_VOLUME', scanning_folio_controller.findAllFolio)

 /**
* Une route pour recuperer la liste des folios d'un agent superviseur scanning
*@method GET
* @url /scanning/folio
*/
scanning_folio_routes.get('/', scanning_folio_controller.findAll)

/**
* Une route pour envoyer les folios du agent superviseur scanning a une equipe scanning
*@method PUT
* @url /scanning/folio/equipeScanning
*/
scanning_folio_routes.put('/equipeScanning', scanning_folio_controller.folioEquipeScanning)

module.exports = scanning_folio_routes