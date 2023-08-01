const express = require('express')
const volume_routes_controller= require("../../controllers/administration/Volume.controller")

const volumes_routes = express.Router()


  /**
 * Une route pour la detail des volumes 
 *@method GET
 * @url /admin/DetailVolume/
 */
 volumes_routes.get("/DetailVolume/:ID_VOLUME",volume_routes_controller.getDetail);

  /**
 * Une route pour la detail des volumes 
 *@method GET
 * @url /admin/DetailVolume/
 */
 volumes_routes.get("/HistoVolume/:ID_VOLUME",volume_routes_controller.getHistoriqueVolume);

 

module.exports = volumes_routes