const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const Validation = require("../../class/Validation")
const { Op } = require("sequelize")
const Volume = require("../../models/Volume")
const Maille = require('../../models/Maille')
const Etape_Volume = require('../../models/Etapes_volumes')
const Etapes_volume_historiques = require("../../models/Etapes_volume_historiques")
const Users = require("../../models/Users")
const Profils = require("../../models/Profils")
const Etapes_folio_historiques = require("../../models/Etapes_folio_historiques")
const Folio = require("../../models/Folio")
const Nature_folio = require("../../models/Nature_folio")
const Etapes_folio = require("../../models/Etapes_folio")
const PROFILS = require("../../constants/PROFILS")
const IDS_ETAPES_FOLIO = require("../../constants/ETAPES_FOLIO")
const Etapes_volumes = require("../../models/Etapes_volumes")
const moment = require('moment')


/**
 * Permet de faire  la detail  du volume
 * @date  31/07/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const getDetail = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {
        const volumes = await Volume.findOne({
            where: {
                ID_VOLUME: ID_VOLUME
            },
            include: [
                {
                    model: Maille,
                    as: 'maille',
                    attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    required: false
                }, {
                    model: Etape_Volume,
                    as: 'etapes_volumes',
                    attributes: ['ID_ETAPE_VOLUME', 'NOM_ETAPE'],
                    required: false
                },

            ]
        })
        if (volumes) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Detail",
                result: volumes
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "volumes non trouve",
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}

/**
 * Permet d'afficher les agents volume
 * @date  4/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const getHistoriqueVolume = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {
        const volumesHistoriqueAll = await Etapes_volume_historiques.findAll({
            // attributes : ['ID_VOLUME'],
            where: {
                ID_VOLUME: ID_VOLUME
            },
            include: [
                {
                    model: Users,
                    as: 'traitant',
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER'],
                    required: false,
                    include: [
                        {
                            model: Profils,
                            as: 'profil',
                            attributes: ['ID_PROFIL', 'DESCRIPTION'],
                            required: false,
                        }
                    ],
                },
                {
                    model: Volume,
                    as: 'volumes',
                    attributes: ['NUMERO_VOLUME','DATE_INSERTION'],
                    required:false
                },
                 {
                    model: Etape_Volume,
                    as: 'etapes_volumes',
                    attributes: ['ID_ETAPE_VOLUME', 'NOM_ETAPE'],
                    required: false
                },
            ],

        })
              const uniqueIds = [];
              const volumesHistorique = volumesHistoriqueAll.filter(element => {
                        const isDuplicate = uniqueIds.includes(element.USER_TRAITEMENT);
                        if (!isDuplicate) {
                                  uniqueIds.push(element.USER_TRAITEMENT);
                                  return true;
                        }
                        return false;
              });
        if (volumesHistorique) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Detail",
                result: volumesHistorique
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "volumes non trouve",
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}


/**
 * Permet d'afficher les agents folio
 * @date  4/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */


const getHistoriqueFolio = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {
        const folioHistoriqueAll = await Etapes_folio_historiques.findAndCountAll({
            attributes: ['ID_USER', 'ID_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'user',
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER'],
                    required: false,
                    include: [
                        {
                            model: Profils,
                            as: 'profil',
                            attributes: ['ID_PROFIL', 'DESCRIPTION'],
                            required: false,
                        }
                    ]
                },
                {
                    model: Folio,
                    as: "folio",
                    attributes: ['ID_FOLIO', 'FOLIO', 'ID_VOLUME','FOLIO','NUMERO_FOLIO'],
                    where: {
                        ID_VOLUME: ID_VOLUME
                    },
                    include:[{
                        model: Volume,
                        as: 'volume',
                        attributes:['NUMERO_VOLUME'],
                        required: false,
                    },
                    {
                        model: Nature_folio,
                        as: 'natures',
                        attributes:['DESCRIPTION'],
                        required: false
                    }
                ]
                }
            ],
        })
        const uniqueIds = [];
        const folioHistoriqueRows = folioHistoriqueAll.rows.filter(element => {
                  const isDuplicate = uniqueIds.includes(element.ID_USER);
                  if (!isDuplicate) {
                            uniqueIds.push(element.ID_USER);
                            return true;
                  }
                  return false;
        });
        const folioHistorique = {
          count: folioHistoriqueAll.count,
          rows: folioHistoriqueRows
        }

        const result = await Promise.all(folioHistorique.rows.map(async countObject => {

            const folio = countObject.toJSON()

            const getFolio = await Etapes_folio_historiques.findAndCountAll({
                // group:['ID_FOLIO'],
                include: [
                    {
                        model: Folio,
                        as: "folio",
                        attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'FOLIO', 'CODE_FOLIO', 'NUMERO_PARCELLE', 'PHOTO_DOSSIER'],
                        required: true,
                        where: {ID_VOLUME},
                        include:[
                            {
                                model: Nature_folio,
                                as: 'natures',
                                attributes:['DESCRIPTION'],
                                required: false
                            }
                        ]
                    }
                ],
                where: {
                    USER_TRAITEMENT: folio.ID_USER
                }
            })



            const uniqueIds = [];
            const folioRows = getFolio.rows.filter(element => {
                      const isDuplicate = uniqueIds.includes(element.ID_FOLIO);
                      if (!isDuplicate) {
                                uniqueIds.push(element.ID_FOLIO);
                                return true;
                      }
                      return false;
            });
            // const folioHistorique = {
            //   count: folioHistoriqueAll.count,
            //   rows: folioHistoriqueRows
            // }
            return {
                ...folio,
                count_agent_folio: folioRows.length,
                getFolio: {
                    rows: folioRows,
                    count: folioRows.length
                },
            }

        }))
        if (folioHistorique) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Detail",
                result: result
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Folio non trouve",
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}


/**
 * Permet d'afficher tous les agents sur le volume selectionner
 * @date  4/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const getAgentByVolume = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {

        const dossier = await Folio.findAll({
            attributes : ['ID_FOLIO','NUMERO_FOLIO','FOLIO'],
            where: {
                ID_VOLUME: ID_VOLUME
            },
            include: [
                {
                    model: Nature_folio,
                    as: 'nature',
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    required: false,
                },
                {
                    model: Etapes_folio,
                    as: 'etapes',
                    attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE'],
                    required: false
                },
            ],

        })
        if (dossier) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Tous les dossiers par volume",
                result: dossier
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "volumes non trouve",
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}


/**
* Permet de faire le rapport sur un volume donné
* @param {express.Request} req 
* @param {express.Response} res 
* @author Jospin BA <jospin@mdiabox.bi>
*/
const get_rapport_by_volume = async (req, res) => {
    try {
        const {ID_VOLUME} = req.params
      const { startDate, endDate} = req.query
        // Date filter
        var dateWhere = {}
        if (startDate) {
          const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00")
          const endDateFormat = endDate ?
            moment(endDate).format("YYYY-MM-DD 23:59:59") :
            moment().format("YYYY-MM-DD 23:59:59")
          dateWhere = {
            DATE_INSERTION: {
              [Op.between]: [startDateFormat, endDateFormat]
            }
          }
        }

        //find all folios
        // const folioss = await Users.findAll({
        //   attributes:[`ID_FOLIO`, `ID_VOLUME`],
        //   where:{
        //     ID_VOLUME:ID_VOLUME    
        //   }
        // });
        
        //count dossiers indexé
        const indexe = await Folio.findAndCountAll({
            attributes : ['ID_FOLIO','NUMERO_FOLIO','FOLIO','DATE_INSERTION','IS_INDEXE'],
            where: {
                ID_VOLUME: ID_VOLUME,IS_INDEXE: 1,...dateWhere
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

        })

         //count all dossiers
         const all_dossier = await Folio.findAndCountAll({
            attributes : ['ID_FOLIO','NUMERO_FOLIO','FOLIO','DATE_INSERTION'],
            where: {
                ID_VOLUME: ID_VOLUME,...dateWhere
            },
            // include: [
            //     {
            //         model: Folio,
            //         as: 'folio',
            //         required: true, 
            //         // where: {
            //         //     [Op.and]: [{
            //         //       IS_INDEXE: 0,
            //         //     }]
            //         // },
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

        })

          //count dossiers preparé
        const prepare = await Folio.findAndCountAll({
            attributes : ['ID_FOLIO','NUMERO_FOLIO','FOLIO','DATE_INSERTION','IS_PREPARE'],
            where: {
                ID_VOLUME: ID_VOLUME,IS_PREPARE:1,...dateWhere,
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

        })
          //count dossiers uploadé
        const uploade = await Folio.findAndCountAll({
            attributes : ['ID_FOLIO','NUMERO_FOLIO','FOLIO','DATE_INSERTION','IS_UPLOADED_EDRMS'],
            where: {
                ID_VOLUME: ID_VOLUME,IS_UPLOADED_EDRMS:1,...dateWhere,
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

        })
          //count dossiers scanné
        const scanne = await Folio.findAndCountAll({
            attributes : ['ID_FOLIO','NUMERO_FOLIO','FOLIO','DATE_INSERTION','IS_RECONCILIE'],
            where: {
                ID_VOLUME: ID_VOLUME,IS_RECONCILIE:1,...dateWhere,
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

        })
        res.status(RESPONSE_CODES.OK).json({
          statusCode: RESPONSE_CODES.OK,
          httpStatus: RESPONSE_STATUS.OK,
          message: "les dossiers phase d'indexation",
          result: {
            indexe,
            uploade,
            prepare,
            scanne,
            all_dossier
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

/**
 * Permet d'afficher les etapes du volume
 * @date  31/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author Jospin Va <jospin@mdiabox.bi>
 */

const getEtapesVolume = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {
          //find all etapes volume
          const allEtapesV = await Etapes_volumes.findAll({
            attributes:['ID_ETAPE_VOLUME','NOM_ETAPE'],
          });

        const allEtapes= await Promise.all(allEtapesV.map(async countObject => {
            const etapeV = countObject.toJSON()
        const etapesVol = await Etapes_volume_historiques.findOne({
            where: {
                ID_VOLUME: ID_VOLUME, ID_ETAPE_VOLUME: etapeV.ID_ETAPE_VOLUME
            },
            include: [
                {
                    model: Users,
                    as: 'traitant',
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER'],
                    required: false,
                    include: [
                        {
                            model: Profils,
                            as: 'profil',
                            attributes: ['ID_PROFIL', 'DESCRIPTION'],
                            required: false,
                        }
                    ],
                },
                {
                    model: Volume,
                    as: 'volumes',
                    attributes: ['NUMERO_VOLUME','DATE_INSERTION','ID_ETAPE_VOLUME'],
                    required:false
                },
                 {
                    model: Etape_Volume,
                    as: 'etapes_volumes',
                    attributes: ['ID_ETAPE_VOLUME', 'NOM_ETAPE'],
                    required: false
                },
            ],

        })
            return {
              ...etapeV,
              etapesVol
            }
          }))

          const byEtapeV = allEtapes.sort((a, b) => {
                    if (!a.etapesVol && !b.etapesVol) return 0;
                    if (!a.etapesVol) return 1;
                    if (!b.etapesVol) return -1;
                    return new Date(a.etapesVol.DATE_INSERTION) - new Date(b.etapesVol.DATE_INSERTION)
          })
         
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Etapes liste",
            result: {
                byEtapeV,
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
    getDetail,
    getHistoriqueVolume,
    getHistoriqueFolio,
    getAgentByVolume,
    get_rapport_by_volume,
    getEtapesVolume
}
