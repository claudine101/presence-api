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



module.exports = scanning_folio_routes