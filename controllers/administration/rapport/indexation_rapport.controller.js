const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Profils = require("../../../models/Profils")
const Folio = require("../../../models/Folio")
const Users = require("../../../models/Users")
const Nature_folio = require("../../../models/Nature_folio")
const Volume = require("../../../models/Volume")
const Etapes_folio = require("../../../models/Etapes_folio")
const PROFILS = require("../../../constants/PROFILS")
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques")
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO")


/**
* Permet de faire le rapport sur la phase d'indexation
* @param {express.Request} req 
* @param {express.Response} res 
* @author Jospin BA <jospin@mdiabox.bi>
*/
const get_rapport_indexation = async (req, res) => {
    try {

        //find all agent
        const agent = await Users.findAll({
          attributes:[`USERS_ID`, `NOM`, `PRENOM`, `TELEPHONE`, `ID_PROFIL`, `PHOTO_USER`],
          where:{
            ID_PROFIL:PROFILS.AGENT_INDEXATION
          }
        });
        
        //count dossiers indexé
        const indexe = await Promise.all(agent.map(async countObject => {
          const util = countObject.toJSON()
          const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }]
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
                where: {
                    [Op.and]: [{
                        ID_USERS: util.USERS_ID
                    }, {
                      IS_INDEXE: 1,
                    }]
                },
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NUMERO_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
        ]
        })
          return {
            ...util,
            folios
          }
        }))
    
        //count dossiers non indexé
        const non_indexe = await Promise.all(agent.map(async countObject => {
          const util = countObject.toJSON()
          const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }]
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
                where: {
                    [Op.and]: [{
                        ID_USERS: util.USERS_ID
                    }, {
                      IS_INDEXE: 0,
                    }]
                },
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NUMERO_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
        ]
          
        })
          return {
            ...util,
            folios
          }
        }))
    
        //count dossiers en cours de traitement
        const non_traite = await Promise.all(agent.map(async countObject => {
          const util = countObject.toJSON()
          const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }]
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
                where: {
                    [Op.and]: [{
                        ID_USERS: util.USERS_ID
                    }, {
                      IS_INDEXE: null,
                    }]
                },
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NUMERO_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
        ]
        })
          return {
            ...util,
            folios
          }
        }))
        res.status(RESPONSE_CODES.OK).json({
          statusCode: RESPONSE_CODES.OK,
          httpStatus: RESPONSE_STATUS.OK,
          message: "les dossiers par status d'indexation",
          result: {
            indexe,
            non_indexe,
            non_traite
          }
        });
    
    
      } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
          statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
          message: "Erreur interne du serveur, réessayer plus tard",
        })
      }
    }

module.exports = {
    get_rapport_indexation,
}