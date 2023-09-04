const express = require('express')
const preparation_folio_controller = require('../../controllers/preparation/preparation_folio_controller')
const preparation_folio_routes = express.Router()

/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method POST
 * @url /preparation/folio
 */
 preparation_folio_routes.post('/', preparation_folio_controller.createfolio)

 /**
 * Une route  permet d'afficher  agents de preparation et leurs folio
 *@method GET
 * @url /preparation/folio/agent
 */
 preparation_folio_routes.get('/agent', preparation_folio_controller.findAllAgent)
 /**
 * Une route  permet d'afficher  agents de preparation et leurs folio RETOUNER
 *@method GET
 * @url /preparation/folio/agentRetourne
 */
 preparation_folio_routes.get('/agentRetourne', preparation_folio_controller.findAllAgentRetourne)

 /**
 * Une route d'afficher  agents de preparation et leurs folio
 *@method GET
 * @url /preparation/folio/agents
 */
 preparation_folio_routes.get('/agents', preparation_folio_controller.findAllAgents)
 
 /**
 * Une route d'afficher  agents de preparation et leurs folio
 *@method GET
 * @url /preparation/folio/agentsRetourne
 */
 preparation_folio_routes.get('/agentsRetourne', preparation_folio_controller.findAllAgentsRetourne)
 
 /**
 * Une route d'afficher  agents de preparation et leurs folio PREPARE ET  NON  PREPARE
 *@method GET
 * @url /preparation/folio/allFOlios
 */
 preparation_folio_routes.get('/allFOlios', preparation_folio_controller.findAllFolioPrepare)
 /**
 * Une route d'afficher les details des agents de preparation et leurs folio PREPARE ET  NON  PREPARE
 *@method GET
 * @url /preparation/folio/getDetails
 */
 preparation_folio_routes.get('/getDetails/:USERS_ID', preparation_folio_controller.getAgentDetail)

 /**
 * Une route  permet  un chef  plateau 
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/superviseur
 */
 preparation_folio_routes.get('/superviseur', preparation_folio_controller.findAllSuperviseurs)

  /**
 * Une route  permet  un chef  plateau 
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/superviseurRetourPhase
 */
 preparation_folio_routes.get('/superviseurRetourPhase', preparation_folio_controller.findAllSuperviseurRetourPhase)

  /**
 * Une route  permet  un chef  plateau  de voir  les agent  sup  valides
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/superviseurValides
 */
 preparation_folio_routes.get('/superviseurValides', preparation_folio_controller.findAllSuperviseursValides)

 
  /**
 * Une route  permet  un chef  plateau  de voir  les agent  sup  revalides
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/superviseurValides
 */
 preparation_folio_routes.get('/superviseurReValides', preparation_folio_controller.findAllSuperviseursReValides)

 /**
 * Une route  permet  un chef  plateau  de voir  les agents superviseur  valides
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/allsuperviseurValides
 */
 preparation_folio_routes.get('/allsuperviseurValides', preparation_folio_controller.findAllSuperviseurs)


 /**
 * Une route  permet les PV d un chef  plateau  et  agent  superviseur
 *@method POST
 * @url /preparation/folio/getPv
 */
 preparation_folio_routes.post('/getPv', preparation_folio_controller.getPvs)
  /**
 * Une route  permet les PV d un   agent  superviseur et  agent  de preparation
 *@method POST
 * @url /preparation/folio/getPvAgentPreparation
 */
 preparation_folio_routes.post('/getPvAgentPreparation', preparation_folio_controller.getPvsAgentPREPARATION)

  /**
 * Une route  permet les PV d un  chef plateau et   agent  superviseur 
 *@method POST
 * @url /preparation/folio/getPvAgentSuperviseur
 */
 preparation_folio_routes.post('/getPvAgentSuperviseur', preparation_folio_controller.getPvsAgentSuperviseur)
 


  /**
 * Une route  permet  de voir si tel  agent  superviseur phase preparation 
 * ont  déja effectuer  retour  avec agent  preparation
 * de voir  les agents superviseur   
 *@method POST
 * @url /preparation/folio/checkAgentsup
 */
 preparation_folio_routes.post('/checkAgentsup', preparation_folio_controller.checkAgentsup)


 /**
 * Une route  permet  un chef  plateau de voir  les folios non prepare
 *@method GET
 * @url /preparation/folio/nbrefolios
 */
 preparation_folio_routes.get('/nbrefolios/:AGENT_SUPERVISEUR', preparation_folio_controller.nbre)

   /**
 * Une route  permet  un agent  superviseur de voir  leurs  folios 
 *@method GET
 * @url /preparation/folio/folios
 */
 preparation_folio_routes.get('/folios', preparation_folio_controller.findAllFolio)
  /**
 * Une route  permet  chef plateux de voir  leurs  folios 
 *@method GET
 * @url /preparation/folio/volumeFolios
 */
 preparation_folio_routes.get('/volumeFolios', preparation_folio_controller.findAllFolioChefPlateau)



 /**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method GET
 * @url /preparation/folio/
 */
 preparation_folio_routes.get('/:ID_VOLUME', preparation_folio_controller.findAll)

 /**
 * Une route  permet  visualiser les folios no  traite 
 *@method GET
 * @url /preparation/folio/nonTraite
 */
 preparation_folio_routes.get('/nonTraite/:ID_MAILLE', preparation_folio_controller.findAllFolioNoTraite)

  /**
 * Une route  permet  un chef  equipe de voir  tous  les folios 
 *@method GET
 * @url /preparation/folio/folioChefEquipe
 */
 preparation_folio_routes.get('/folioChefEquipe/:ID_VOLUME', preparation_folio_controller.findAllFolioEquipe)

/**
 * Une route  permet    un chef  equipe de voir  tous  les folios non prepares
 *@method GET
 * @url /preparation/folio/folioChefEquipeNonPrepare
 */
 preparation_folio_routes.get('/folioChefEquipeNonPrepare/:ID_VOLUME', preparation_folio_controller.findAllFolioEquipeNoPrepare)
  /**
 * Une route  permet  de nommer  agent superviseur phase preparation
 *@method PUT
 * @url /preparation/folio/nommerSuperviseurPreparation
 */
 preparation_folio_routes.put('/nommerSuperviseurPreparation', preparation_folio_controller.nommerSuperviseurPreparation)

 /**
 * Une route  permet  de renommer  agent superviseur phase preparation
 *@method PUT
 * @url /preparation/folio/renommerSuperviseurPreparation
 */
 preparation_folio_routes.put('/renommerSuperviseurPreparation', preparation_folio_controller.renommerSuperviseurPreparation)


 /**
 * Une route  permet  de nommer  agent preparation phase preparation
 *@method PUT
 * @url /preparation/folio/nommerAgentPreparation
 */
 preparation_folio_routes.put('/nommerAgentPreparation', preparation_folio_controller.nommerAgentPreparation)

 /**
 * Une route  permet  de renommer  agent preparation phase preparation
 *@method PUT
 * @url /preparation/folio/renommerAgentPreparation
 */
 preparation_folio_routes.put('/renommerAgentPreparation', preparation_folio_controller.renommerAgentPreparation)

  /**
 * Une route  permet  de retour  agent preparation phase preparation
 *@method PUT
 * @url /preparation/folio/retourAgentPreparation
 */
 preparation_folio_routes.put('/retourAgentPreparation', preparation_folio_controller.retourAgentPreparation)

 /**
 * Une route  permet  de retour  agent preparation phase preparation
 *@method PUT
 * @url /preparation/folio/retourAgentSuperviseur
 */
 preparation_folio_routes.put('/retourAgentSuperviseur', preparation_folio_controller.retourAgentSuperviseur)

 /**
* Une route  permet  a un agent superviseur  de donner 
*  les folio   a un agent preparation
*@method PUT
* @url /preparation/folio/addDetails
*/
preparation_folio_routes.put('/addDetails', preparation_folio_controller.addDetails)

module.exports = preparation_folio_routes
