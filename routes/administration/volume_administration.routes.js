const express = require('express');
const volumecontroller= require('../../controllers/administration/volume_adminstration.controller');
const volume_routes_controller= require("../../controllers/administration/Volume.controller")
const volumes_routes= express.Router()

volumes_routes.get("/",volumecontroller.findAll);
volumes_routes.get("/:id",volumecontroller.gethistoriquevol);
volumes_routes.get("/volumescanne/scane",volumecontroller.findAllscanne);
volumes_routes.get("/volumescanne/rearchive",volumecontroller.findAllreachive);

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

 /**
* Une route pour la detail des folio  
*@method GET
* @url /admin/Agent_folio/
*/
volumes_routes.get("/Agent_folio/:ID_VOLUME",volume_routes_controller.getHistoriqueFolio);
 /**
* Une route pour la detail des folio  
*@method GET
* @url /admin/Agent_folio/
*/
volumes_routes.get("/Folio_Volume/:ID_VOLUME",volume_routes_controller.getAgentByVolume);

module.exports=volumes_routes
