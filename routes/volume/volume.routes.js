const express = require('express')
const volume_controller = require('../../controllers/volume/volume.controller')
const volume_routes = express.Router()
/**
 * Une route  recuperer  les volumes d'un chef  de divisions des archives
 *@method GET
 * @url /volume/dossiers/myVolume 
 */
volume_routes.get('/myVolume', volume_controller.findBy)

/**
 * Une route  recuperer  les volumes d'un chef  de divisions des archives qui  n'ont  pas la detailw
 *@method GET
 * @url /volume/dossiers/myVolume 
 */
 volume_routes.get('/VolumesInMaille', volume_controller.find)
/**
 * Une route  recuperer  chef plateau et  leur  volumes
 *@method GET
 * @url /volume/dossiers/chefPlateauVolume
 */
 volume_routes.get('/chefPlateauVolume', volume_controller.findChefPlateauVolume)

/**
 * Une route  recuperer  les volumes d'un agent  superviseurs archives
 *@method GET
 * @url /volume/dossiers/volume
 */
 volume_routes.get('/volume', volume_controller.findById)
/**
 * Une route  recuperer  les volumes d'un chef  de divisions des archives
 *@method GET
 * @url /volume/dossiers/volume
 */
 volume_routes.get('/volumeOne/:ID_VOLUME', volume_controller.findOne)
 /**
 * Une route  recuperer  les pv  
 *@method GET
 * @url /volume/dossiers/volume
 */
 volume_routes.get('/pv', volume_controller.getPv)
/**
 * Une route  recuperer  tous les volumes
 *@method GET
 * @url /volume/dossiers/volumes
 */
 volume_routes.get('/volumes', volume_controller.findAll)

 /**
 * Une route  recuperer  batiment  ailes et  mailles d'un volume
 *@method GET
 * @url /volume/dossiers/batimentAile
 */
 volume_routes.get('/batimentAile/:ID_VOLUME', volume_controller.findVolume)
/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /volume/dossiers/mofidier
 */
 volume_routes.put('/mofidier/:ID_VOLUME', volume_controller.update)
/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /volume/dossiers
 */
volume_routes.post('/', volume_controller.createVolume)
/**
 * Une route  permet  un d'affecte un volume à un agent distributeur 
 *@method put
 * @url /volume/dossiers/affectationDistributeur
 */
 volume_routes.put('/affectationDistributeur/:ID_VOLUME', volume_controller.affectation)

 /**
 * Une route  permet  un d'affecte un volume à un agent superviseur  aile 
 *@method put
 * @url /volume/dossiers/affectationSuperviseur
 */
 volume_routes.put('/affectationSuperviseur/:ID_VOLUME', volume_controller.affectationSuperviseur)

 /**
 * Une route  permet  un d'affecte un volume à un agent superviseur  aile 
 *@method put
 * @url /volume/dossiers/affectationSuperviseur
 */
 volume_routes.put('/affectationSuperviseur/:ID_VOLUME', volume_controller.affectationSuperviseur)

 /**
 * Une route  permet  un d'affecte un volume à un  chef plateau
 *@method put
 * @url /volume/dossiers/affectationSuperviseur
 */
 volume_routes.put('/affectationPlateau/:ID_VOLUME', volume_controller.affectationPlateau)

/**
 * retour  d'un  chef plateau
 *@method put
 * @url /volume/dossiers/retournPlateau
 */
 volume_routes.put('/retournPlateau/:ID_USER_AILE_PLATEAU/:ID_VOLUME', volume_controller.retourPlateau)


module.exports = volume_routes