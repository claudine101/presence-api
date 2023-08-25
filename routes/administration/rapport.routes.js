const express = require('express')

const indexation_rapport=require('../../controllers/administration/rapport/indexation_rapport.controller')
const indexation_routes=express.Router()

//Route pour le rapport de la phase d'indexation groupe selon le statut indexe, non indexe et en attente de traitement
indexation_routes.get('/idexation_rapport',indexation_rapport.get_rapport_indexation)

//Route pour le rapport de la phase indexation pour les users qui ont un profil 
indexation_routes.get('/all_indexation_rapport',indexation_rapport.get_rapport_all_indexation)

//Route pour le rapport de la phase d'indexation avec les utilisateur qui ont un profil Agent superviseur aile (phase indexation)
indexation_routes.get('/all_agent_sup',indexation_rapport.get_rapport_agent_superviseur)

//Route pour le rapport sur la phase d'indexation en general avec l'etape Mettre les folio dans les flashs par le chef d'equipe
indexation_routes.get('/all_chef_equipe',indexation_rapport.get_rapport_chef_ekip)

//Route pour le rapport sur la phase d'indexation en general avec l'etape Selection d'un chef plateau indexation par le Chef Plateau (phase Indexation)
indexation_routes.get('/all_chef_plateau',indexation_rapport.get_rapport_chef_plateau)

module.exports = indexation_routes



