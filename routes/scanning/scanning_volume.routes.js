const express = require('express')
const scanning_volume_controller = require('../../controllers/scanning/scanning_volume.controller')
const scanning_volume_routes = express.Router()

/**
 * Une route pour donner le volume et le malle chez une agent superviseur aille phase scanning
 *@method PUT
 * @url /scanning/volume
 */
scanning_volume_routes.put('/:ID_VOLUME', scanning_volume_controller.volumeScanning)

/**
* Une route pour envoyer le volumes chef un agent de plateau
*@method PUT
* @url /scanning/volume/aile
*/
scanning_volume_routes.put('/aile/:ID_VOLUME', scanning_volume_controller.volumeAileScanning)

/**
* Une route pour envoyer les folios du chef plateau vers un agent superviseur scanning
*@method PUT
* @url /scanning/volume/folio/plateau
*/
scanning_volume_routes.put('/folio/plateau', scanning_volume_controller.folioChefScanning)

/**
* Une route pour envoyer les folios d'un agent superviseur scanning vers equipe scanning
*@method PUT
* @url /scanning/volume/folio/equipe
*/
scanning_volume_routes.put('/folio/equipe', scanning_volume_controller.folioSupScanning)

module.exports = scanning_volume_routes