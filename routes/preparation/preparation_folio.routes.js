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
 * Une route d'afficher  agents de preparation et leurs folio
 *@method GET
 * @url /preparation/folio/agents
 */
 preparation_folio_routes.get('/agents', preparation_folio_controller.findAllAgents)

 /**
 * Une route  permet  un chef  plateau 
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/superviseur
 */
 preparation_folio_routes.get('/superviseur', preparation_folio_controller.findAllSuperviseurs)

 /**
 * Une route  permet les PV d un chef  plateau  et  agent  superviseur
 *@method POST
 * @url /preparation/folio/getPv
 */
 preparation_folio_routes.post('/getPv', preparation_folio_controller.getPvs)


  /**
 * Une route  permet  de voir si tel  agent  superviseur phase preparation 
 * ont  déja effectuer  retour  avec agent  preparation
 * de voir  les agents superviseur   
 *@method GET
 * @url /preparation/folio/checkAgentsup
 */
 preparation_folio_routes.get('/checkAgentsup/:USERS_ID', preparation_folio_controller.checkAgentsup)


 /**
 * Une route  permet  un chef  plateau de voir  les folios non prepare
 *@method GET
 * @url /preparation/folio/nbrefolios
 */
 preparation_folio_routes.get('/nbrefolios/:AGENT_SUPERVISEUR', preparation_folio_controller.nbre)

  /**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method GET
 * @url /preparation/folio/folios
 */
 preparation_folio_routes.get('/folios', preparation_folio_controller.findAllFolio)


 /**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method GET
 * @url /preparation/folio/
 */
 preparation_folio_routes.get('/:ID_VOLUME', preparation_folio_controller.findAll)

 
 
  /**
 * Une route  permet  de nommer  agent superviseur phase preparation
 *@method PUT
 * @url /preparation/folio/nommerSuperviseurPreparation
 */
 preparation_folio_routes.put('/nommerSuperviseurPreparation', preparation_folio_controller.nommerSuperviseurPreparation)

 /**
 * Une route  permet  de nommer  agent preparation phase preparation
 *@method PUT
 * @url /preparation/folio/nommerAgentPreparation
 */
 preparation_folio_routes.put('/nommerAgentPreparation', preparation_folio_controller.nommerAgentPreparation)

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
