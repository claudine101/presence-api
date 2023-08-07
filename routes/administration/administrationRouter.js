const express = require('express');

const volume_routes= require('./volume_administration.routes')
const batiment_routes= require('./batiment_administration.routes')
const equipe_routes= require('./equipe_adminstration.routes')
const etape_folio_routes= require('./etape_folio_administration.routes')
const phase_routes= require('./Phase_administration.routes')
const volume_folio_routes =require('./volume_folio_administration.routes')
const malle_routes =require('./malle_administration.routes')
const user_routes=require('./users.routes')
const profile_routes=require('./profil.routes')
const useraile_routes=require('./useraile.routes')
const naturefolio_routes=require('./naturefolio.routes')
const foliotypedocument_routes=require('./foliotypedocument.routes')
const flash_routes=require('./flashs.routes')
const aile_routes=require('./aile.routes');
const folio_routes = require('./folio.routes');

const administrationRouter=express.Router();

administrationRouter.use('/volume',volume_routes)
administrationRouter.use('/folio',folio_routes)
administrationRouter.use('/batiment',batiment_routes)
administrationRouter.use('/equipe',equipe_routes)
administrationRouter.use('/etape_folio',etape_folio_routes)
administrationRouter.use('/phase',phase_routes)
administrationRouter.use('/volume_folio',volume_folio_routes)
administrationRouter.use('/malle',malle_routes)

administrationRouter.use('/users',user_routes)
administrationRouter.use('/profil',profile_routes)
administrationRouter.use('/useraile',useraile_routes)
administrationRouter.use('/naturefolio',naturefolio_routes)
administrationRouter.use('/foliotypedocument',foliotypedocument_routes)
administrationRouter.use('/flashs',flash_routes)
administrationRouter.use('/aile',aile_routes)

module.exports = administrationRouter