const express = require("express")
const upload_folio_contoller = require("../../controllers/uploadEDMS/upload_folio.controller")

const upload_folio_routes = express.Router()
/**
 * Une route  permet  de retour  les folio  indexé
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


 
module.exports = upload_folio_routes