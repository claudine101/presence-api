const express = require('express')
const indexation_folio_routes = require('./indexation_folio.routes')
const indexation_folio_contoller = require('../../controllers/indexation/indexation_folio.controller')

const indexationRouter = express.Router()

indexationRouter.use("/folio", indexation_folio_routes)
indexationRouter.get("/flashs", indexation_folio_contoller.getFlashs)
indexationRouter.get("/flashs/sup_aile_indexation", indexation_folio_contoller.getFlashBySupAile)
indexationRouter.get("/flashs/chef_plateau", indexation_folio_contoller.getFlashByChefPlateauIndexation)
indexationRouter.get("/flashs/chef_equipe", indexation_folio_contoller.getFlashByChefEquipe)
indexationRouter.get("/users/:ID_PROFIL", indexation_folio_contoller.getAgentsByProfil)
indexationRouter.post("/agent_sup_aile_indexation", indexation_folio_contoller.saveAgentSupAile)
indexationRouter.post("/agent_sup_aile_indexation/retour", indexation_folio_contoller.retourSupAileIndexation)
indexationRouter.post("/chef_plateau_indexation", indexation_folio_contoller.saveChefPlateau)
indexationRouter.post("/chef_plateau_indexation/retour", indexation_folio_contoller.retourChefPlateau)
indexationRouter.post("/agent_indexation", indexation_folio_contoller.saveAgentIndexation)
indexationRouter.post("/agent_indexation/retour/indexation_folios", indexation_folio_contoller.retourAgentIndexation)
indexationRouter.get("/flashs/details/:ID_FLASH", indexation_folio_contoller.getFlashDetail)
indexationRouter.get("/flashs/chef_plateau/:ID_FLASH", indexation_folio_contoller.getFrashChefPlateau)
indexationRouter.get("/flashs/sup_aile_indexation/:ID_FLASH", indexation_folio_contoller.getFrashSupAileIndexation)

module.exports = indexationRouter