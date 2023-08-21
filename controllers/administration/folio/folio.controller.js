const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const IMAGES_DESTINATIONS = require("../../../constants/IMAGES_DESTINATIONS")
const { Op, } = require("sequelize")
const sequelize = require('../../../utils/sequelize')
const Folio = require('../../../models/Folio')
const Volume = require("../../../models/Volume")
const Nature_folio = require("../../../models/Nature_folio")
const Etapes_folio = require('../../../models/Etapes_folio');
const Equipes = require("../../../models/Equipes")
const Syst_collines = require("../../../models/Syst_collines")
const Syst_zones = require("../../../models/Syst_zones")
const Syst_communes = require("../../../models/Syst_communes")
const Syst_provinces = require("../../../models/Syst_provinces")
const Users = require("../../../models/Users")
const Profils = require("../../../models/Profils")
const Etapes_folio_historiques = require('../../../models/Etapes_folio_historiques')
const Flashs = require("../../../models/Flashs")

/**
 * Permet d'afficher les details du folio
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author jospinba <jospin@mdiabox.bi>
 */
const findOneFolio = async (req, res) => {
  try {
    const { ID_FOLIO } = req.params
    const result = await Folio.findOne({
      // attributes:[`ID_FOLIO`,`ID_VOLUME`,`ID_NATURE_FOLIO`,`NUMERO_FOLIO`,`CODE_FOLIO`,`ID_ETAPE_FOLIO`,`NUMERO_PARCELLE`,`COLLINE_ID`,`LOCALITE`, `NOM_PROPRIETAIRE`,`PRENOM_PROPRIETAIRE`,`PHOTO_DOSSIER`, `NUMERO_FEUILLE`, `NOMBRE_DOUBLON`, `ID_EQUIPE`, `ID_MALLE_NO_TRAITE`, `IS_RECONCILIE`, `IS_VALIDE`, `ID_MALLE_NO_SCANNE`, `ID_FLASH`, `IS_INDEXE`,`ID_FLASH_INDEXE`, `IS_UPLOADED_EDRMS`, `IS_DOCUMENT_BIEN_ENREGISTRE`, `DATE_INSERTION`],
      where: {
        ID_FOLIO
      },
      include:
        [
          {
            model: Syst_collines,
            as: 'colline',
            required: false,
            attributes: [
              'COLLINE_ID', 'COLLINE_NAME'
            ],
            include: {
              model: Syst_zones,
              as: 'zone',
              required: false,
              attributes: ['ZONE_ID', 'ZONE_NAME'],
              include: {
                model: Syst_communes,
                as: 'commune',
                required: false,
                attributes: ['COMMUNE_ID', 'COMMUNE_NAME'],
                include: {
                  model: Syst_provinces,
                  as: 'province',
                  required: false,
                  attributes: ['PROVINCE_ID', 'PROVINCE_NAME']
                }
              }
            }
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: false,
            attributes: [
              'ID_ETAPE_FOLIO', 'NOM_ETAPE'
            ],
          },
          {
            model: Nature_folio,
            as: 'nature',
            required: false,
            attributes: [
              'ID_NATURE_FOLIO', 'DESCRIPTION'
            ],
          },
          {
            model: Volume,
            as: 'volume',
            required: false,
            attributes: [
              'ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER'
            ],
          },
          {
            model: Equipes,
            as: 'equipe',
            required: false,
            attributes: [
              'ID_EQUIPE', 'NOM_EQUIPE', 'CHAINE', 'ORDINATEUR'
            ],
          },
          {
            model: Flashs,
            as: 'flash',
            required: false,
            attributes: [
              'ID_FLASH','NOM_FLASH','DATE_INSERTION'
            ],
          
          },
          {
            model: Flashs,
            as: 'flashindexe',
            required: false,
            attributes: [
              'ID_FLASH','NOM_FLASH','DATE_INSERTION'
            ],
          
          },
        ]

    })

    if (result) {
      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_STATUS.OK,
        message: "Folio details",
        result: result
      })
    } else {
      res.status(RESPONSE_CODES.NOT_FOUND).json({
        statusCode: RESPONSE_CODES.NOT_FOUND,
        httpStatus: RESPONSE_STATUS.NOT_FOUND,
        message: "Folio non trouvé",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Erreur interne du serveur, réessayer plus tard",
    })
  }
}


/**
 * Permet d'afficher les agents participants au folio
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author jospinba <jospin@mdiabox.bi>
 */
const findUsersByFolio = async (req, res) => {
  try {
    const { ID_FOLIO } = req.params
    const folioHistoriquesAll = await Etapes_folio_historiques.findAll({
       attributes:['ID_FOLIO_HISTORIQUE',	'USER_TRAITEMENT', 'ID_FOLIO', 'PV_PATH'],
      //  group : ['USER_TRAITEMENT'],
      where: {
        ID_FOLIO: ID_FOLIO
      },
      include:
        [
          {
            model: Etapes_folio,
            as: 'etapes',
            required: false,
            attributes: [
              'ID_ETAPE_FOLIO', 'NOM_ETAPE'
            ],
          },
          {
            model: Users,
            as: 'traitement',
            required: false,
            attributes: [
              'USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'TELEPHONE', 'ID_PROFIL', 'PHOTO_USER'
            ],
            include: {
              model: Profils,
              as: 'profil',
              required: false,
              attributes: ['ID_PROFIL', 'DESCRIPTION'],
            }
          },
          {
            model: Folio,
            as: 'folio',
            required: false,
            attributes: [
              'FOLIO','NUMERO_FOLIO'
            ],
            include:[{
              model:Nature_folio,
              as: 'natures',
              required:false,
              attributes:[
                'DESCRIPTION'
              ]
            },
          {
            model: Volume,
            as: 'volume',
            attributes: ['NUMERO_VOLUME'],
            required: false
          },]
          },

        ]

    })

    const uniqueIds = [];
              const agentsTraitementF = folioHistoriquesAll.filter(element => {
                        const isDuplicate = uniqueIds.includes(element.USER_TRAITEMENT);
                        if (!isDuplicate) {
                                  uniqueIds.push(element.USER_TRAITEMENT);
                                  return true;
                        }
                        return false;
              });

    if (agentsTraitementF) {
      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_STATUS.OK,
        message: "Users participant au traitement du dossier",
        result: agentsTraitementF
      })
    } else {
      res.status(RESPONSE_CODES.NOT_FOUND).json({
        statusCode: RESPONSE_CODES.NOT_FOUND,
        httpStatus: RESPONSE_STATUS.NOT_FOUND,
        message: "Folio non trouvé",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Erreur interne du serveur, réessayer plus tard",
    })
  }
}




/**
 * Permet d'afficher l'historique des agents participant au folio
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author jospinba <jospin@mdiabox.bi>
 */
const findTraitantFolio = async (req, res) => {
  try {
    const { ID_FOLIO } = req.params
    const agentsFolio = await Etapes_folio_historiques.findAll({
       attributes:['ID_FOLIO_HISTORIQUE',	'ID_USER', 'USER_TRAITEMENT', 'ID_FOLIO',	'ID_ETAPE_FOLIO', 'PV_PATH'],
      //  group : ['ID_USER'],
      where: {
        ID_FOLIO: ID_FOLIO
      },
      include:
        [
          {
            model: Etapes_folio,
            as: 'etapes',
            required: false,
            attributes: [
              'ID_ETAPE_FOLIO', 'NOM_ETAPE'
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: [
              'USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'
            ],
            include: {
              model: Profils,
              as: 'profil',
              required: false,
              attributes: ['ID_PROFIL', 'DESCRIPTION'],
            }
          },
          {
            model: Users,
            as: 'traitement',
            required: false,
            attributes: [
              'USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'
            ],
            include: {
              model: Profils,
              as: 'profil',
              required: false,
              attributes: ['ID_PROFIL', 'DESCRIPTION'],
            }
          },
        ]

    })

    const uniqueIds = [];
    const distinctAgent = agentsFolio.filter(element => {
              const isDuplicate = uniqueIds.includes(element.USER_TRAITEMENT);
              if (!isDuplicate) {
                        uniqueIds.push(element.USER_TRAITEMENT);
                        return true;
              }
              return false;
    });
    // const folioHistorique = {
    //   // count: folioHistoriqueAll.count,
    //   rows: distinctAgent
    // }

    // const result = await Promise.all(folioHistorique.rows.map(async countObject => {

    //     const folio = countObject.toJSON()

    //     // const count_agent_folio = await Folio.count({
    //     //     where: {
    //     //         ID_USERS: folio.ID_USER
    //     //     }
    //     // })

    //     // const getFolio = await Folio.findAndCountAll({
    //     //     attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'NUMERO_PARCELLE', 'PHOTO_DOSSIER'],
    //     //     where: {
    //     //         ID_USERS: folio.ID_USER
    //     //     }
    //     // })

    //     // return {
    //     //     ...folio,
    //     //     count_agent_folio,
    //     //     getFolio
    //     // }

    // }))

    if (distinctAgent) {
      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_STATUS.OK,
        message: "Historique du dossier",
        result: distinctAgent
      })
    } else {
      res.status(RESPONSE_CODES.NOT_FOUND).json({
        statusCode: RESPONSE_CODES.NOT_FOUND,
        httpStatus: RESPONSE_STATUS.NOT_FOUND,
        message: "Folio non trouvé",
      })
    }
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
  findOneFolio,
  findUsersByFolio,
  findTraitantFolio,
}