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


const getHistoriqueVolume = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {

        const volumesHistorique = await Etapes_volume_historiques.findAll({
            // attributes :['ID_VOLUME,'],
          //   group: ['USERS_ID'],
            where: {
                ID_VOLUME: ID_VOLUME
            },
            include: [
                {
                    model: Users,
                    as: 'users',
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
                //{
                //     model: Etapes_volume_historiques,
                //     as: 'etapes_volume_historiques',
                //     attributes:['ID_VOLUME','USERS_ID'],
                //     required:false
                // },
            ],

        })
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


const getHistoriqueFolio = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {
        const folioHistorique = await Etapes_folio_historiques.findAndCountAll({
            attributes: ['ID_USER', 'ID_FOLIO'],
          //   group: ['ID_USER'],
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

        const result = await Promise.all(folioHistorique.rows.map(async countObject => {

            const folio = countObject.toJSON()

            const count_agent_folio = await Folio.count({
                where: {
                    ID_USERS: folio.ID_USER
                }
            })

            const getFolio = await Folio.findAndCountAll({
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'NUMERO_PARCELLE', 'PHOTO_DOSSIER'],
                where: {
                    ID_USERS: folio.ID_USER
                }
            })

            return {
                ...folio,
                count_agent_folio,
                getFolio
            }

        }))
        if (folioHistorique) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Detail",
                result: result
                // data :result
                // result: {
                //     data: result,
                // }
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
          return res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(error)
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
    getHistoriqueFolio
}