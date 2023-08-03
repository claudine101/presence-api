const express = require('express');

const volume_routes= require('./volume_administration.routes')
const folio_routes= require('./folio_administration.routes')
const batiment_routes= require('./batiment_administration.routes')
const equipe_routes= require('./equipe_adminstration.routes')
const etape_folio_routes= require('./etape_folio_administration.routes')
const phase_routes= require('./Phase_administration.routes')
const volume_folio_routes =require('./volume_folio_administration.routes')
const malle_routes =require('./malle_administration.routes')
const aile__routes= require('./aile_administration.routes')

const administrationRouter=express.Router();

administrationRouter.use('/volume',volume_routes)
administrationRouter.use('/folio',folio_routes)
administrationRouter.use('/batiment',batiment_routes)
administrationRouter.use('/equipe',equipe_routes)
administrationRouter.use('/etape_folio',etape_folio_routes)
administrationRouter.use('/phase',phase_routes)
administrationRouter.use('/volume_folio',volume_folio_routes)
administrationRouter.use('/malle',malle_routes)
administrationRouter.use('/aille',aile__routes)

module.exports = administrationRouter