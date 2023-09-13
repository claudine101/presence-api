const express = require("express")
const upload_folio_contoller = require("../../controllers/uploadEDMS/upload_folio.controller")

const upload_folio_routes = express.Router()
/**
* Une route  permet  de retourner  les folio  indexé pour  un chef equipe upload edrms
 *@method GET 
 * @url uploadEDMRS/folio/flashs
 */
upload_folio_routes.get("/flashs", upload_folio_contoller.getFlashByChefEquipe)
/**
 * Une route  permet  de recuperer les  agents uploadEDRMS
 *@method GET
 * @url uploadEDMRS/folio/users
 */
 upload_folio_routes.get("/users/:ID_PROFIL", upload_folio_contoller.getAgentsByProfil)

 /**
 * Une route  permet  de selectioner les  agents uploadEDRMS
 *@method POST
 * @url uploadEDMRS/folio/agent_upload
 */
 upload_folio_routes.post("/agent_upload", upload_folio_contoller.saveAgent)

 /**
 * Une route  permet  de recuperer les folios enregistre 
 * dans l'histo par un chef equipe phase uploadEDRMS
 *@method GET
 * @url uploadEDMRS/folio/chef_equipe
 */
 upload_folio_routes.get("/chef_equipe", upload_folio_contoller.getFlashByChefEquipeENattante)

 /**
 * Une route  permet  de recuperer les folios enregistre  et  upload a la fin
 * dans l'histo par un chef equipe phase uploadEDRMS
 *@method GET
 * @url uploadEDMRS/folio/folioValide
 */
 upload_folio_routes.get("/folioValide", upload_folio_contoller.findAllFolioUpload)
 /**
 * Une route  permet les PV d un   agent  superviseur et  agent  de preparation
 *@method POST
 * @url uploadEDMRS/folio/getPvAgentUpload
 */
 upload_folio_routes.post('/getPvAgentUpload', upload_folio_contoller.getPvsAgentUpload)
/**
 * Une route  permet  de recuperer les folios d'un agent  uploadEDRMS
 *@method GET
 * @url uploadEDMRS/folio/agent
 */
 upload_folio_routes.get("/agent", upload_folio_contoller.getFlashByAgent)

 /**
 * Une route  permet  de recuperer les type de document d'un dossier
 *@method GET
 * @url uploadEDMRS/folio/typeDocument
 */
 upload_folio_routes.get("/typeDocument/:ID_NATURE", upload_folio_contoller.getDocuments)

 /**
 * Une route  permet  de recuperer les type de document d'un dossier deja verifier
 *@method GET
 * @url uploadEDMRS/folio/typeDocument
 */
 upload_folio_routes.get("/document/:ID_FOLIO", upload_folio_contoller.getDocument)

  /**
 * Une route  permet  de recuperer les folios d'un agent  uploadEDRMS
 *@method POST
 * @url uploadEDMRS/folio/isUpload
 */
 upload_folio_routes.post("/isUpload/", upload_folio_contoller.saveIsUpload)

  /**
 * Une route  permet  de recuperer les folios d'un agent  uploadEDRMS
 *@method POST
 * @url uploadEDMRS/folio/isReUpload
 */
 upload_folio_routes.post("/isReUpload/", upload_folio_contoller.saveIsreUpload)


 /**
 * Une route  permet  de recuperer les folios d'un agent  qui est uploadEDRMS
 *@method GET
 * @url uploadEDMRS/folio/folioUplad
 */
 upload_folio_routes.get("/folioUplad", upload_folio_contoller.getFolioUpload)
 /**
 * Une route  permet  de recuperer les folios d'un agent  qui est invalide
 *@method GET
 * @url uploadEDMRS/folio/folioInvalide
 */
 upload_folio_routes.get("/folioInvalide", upload_folio_contoller.getFolioInvalide)


  /**
 * Une route  permet  de recuperer les folios qui est uploadEDRMS
 *@method GET
 * @url uploadEDMRS/folio/folioUploads
 */
 upload_folio_routes.get("/folioUploads", upload_folio_contoller.getFolioUploads)

   /**
 * Une route  permet  d'enregistre  les folios qui n'est  pas enregistre EDRMS
 *@method POST
 * @url uploadEDMRS/folio/folioEnregsitre
 */
 upload_folio_routes.post("/folioEnregsitre", upload_folio_contoller.enregistreFolio)

  /**
 * Une route  permet recuper   les folios qui est  enregistre EDRMS d'un verificateur
 *@method GET
 * @url uploadEDMRS/folio/enregistre
 */
 upload_folio_routes.get("/enregistre", upload_folio_contoller.getFolioEnregistre)

   /**
 * Une route  permet recuper   les folios qui n'est  pas enregistre EDRMS d'un verificateur
 *@method GET
 * @url uploadEDMRS/folio/noEnregistre
 */
 upload_folio_routes.get("/noEnregistre", upload_folio_contoller.getFolioNoEnregistre)

  /**
 * Une route  de faire retour  entre agent  upload et  chef equipe
 *@method GET
 * @url uploadEDMRS/folio/retour
 */
 upload_folio_routes.post("/retour", upload_folio_contoller.retourAgentUpload)

  /**
 * Une route  de faire retour  entre agent  upload et  chef equipe
 *@method GET
 * @url uploadEDMRS/folio/retour
 */
 upload_folio_routes.get("/check/:ID_FLASH", upload_folio_contoller.check)




 
module.exports = upload_folio_routes