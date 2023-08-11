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
                    ]
                }, {
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
                    attributes: ['ID_FOLIO', 'ID_VOLUME'],
                    where: {
                        ID_VOLUME: ID_VOLUME
                    },
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

            const getFolio = await Etapes_folio_historiques.findAll({
                group:['ID_FOLIO'],
                include: [
                    {
                        model: Folio,
                        as: "folio",
                        attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'NUMERO_PARCELLE', 'PHOTO_DOSSIER'],
                        required: true,
                        where: {ID_VOLUME}
                    }
                ],
                where: {
                    USER_TRAITEMENT: folio.ID_USER
                }
            })

            return {
                ...folio,
                count_agent_folio: getFolio.length,
                getFolio: {
                    rows: getFolio,
                    count: getFolio.length
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
            attributes : ['NUMERO_FOLIO'],
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




module.exports = {
    getDetail,
    getHistoriqueVolume,
    getHistoriqueFolio,
    getAgentByVolume
}