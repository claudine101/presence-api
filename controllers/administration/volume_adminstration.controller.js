const express = require('express');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const Volume = require('../../models/Volume');
const Etapes_volumes = require('../../models/Etapes_volumes');
const maille = require('../../models/Maille');
const Users = require('../../models/Users');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');
const Profils = require('../../models/Profils');
const moment = require('moment');
const { Op } = require('sequelize');
const Folio = require('../../models/Folio');
const Etapes_folio = require('../../models/Etapes_folio');
const IDS_ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');







/**
 * permet de 
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */

const findAll = async (req, res) => {
    try {
        const { volume_filters, startDate, endDate, rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = 'ID_VOLUME'
        const defaultSortDirection = "DESC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    ID_VOLUME: 'ID_VOLUME',
                    NUMERO_VOLUME: "NUMERO_VOLUME",
                    CODE_VOLUME: "CODE_VOLUME",
                    NOMBRE_DOSSIER: "NOMBRE_DOSSIER",
                    DATE_INSERTION: "DATE_INSERTION"

                }
            },


            etapes_volumes: {
                as: "etapes_volumes",
                fields: {
                    NOM_ETAPE: 'NOM_ETAPE',

                }
            },

            malle: {
                as: "malle",
                fields: {
                    NUMERO_MAILLE: 'NUMERO_MAILLE',

                }
            },


        }

        var orderColumn, orderDirection

        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.volume.fields.ID_VOLUME
            sortModel = {
                model: 'volume',
                as: sortColumns.volume.as
            }
        }

        // ordering
        if (sortOrder == 1) {
            orderDirection = 'ASC'
        } else if (sortOrder == -1) {
            orderDirection = 'DESC'
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = [

        ]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach(column => {
                searchWildCard[column] = {
                    [Op.substring]: search
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard
            }
        }
        var dateWhere = {}

        var volume_filter = {}

        if (volume_filters) {
            volume_filter = { ID_ETAPE_VOLUME: volume_filters }
        }
        // Date filter
        if (startDate) {
            const startDateFormat =
                moment(startDate).format("YYYY-MM-DD 00:00:00")
            const endDateFormat = endDate ?
                moment(endDate).format("YYYY-MM-DD 23:59:59") :
                moment().format("YYYY-MM-DD 23:59:59")
            dateWhere = {
                DATE_INSERTION: {
                    [Op.between]: [startDateFormat, endDateFormat]
                }
            }
        }
        const result = await Volume.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
                ...dateWhere,
                ...volume_filter
            },
            include: [
                {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                },

                {
                    model: maille,
                    as: 'maille',
                    attributes: ['NUMERO_MAILLE'],
                    required: false
                }]

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes ",
            result: {
                data: result.rows,
                totalRecords: result.count
            }
        })
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
 * permet de  trouver les volumes scanner
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */


const findAllscanne = async (req, res) => {

    try {
        const folioss = await Folio.findAll({

            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                // IS_RECONCILIE:1,

            },

            include:
            {
                model: Volume,
                as: 'volume',
                attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                required: false,

                include: {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }
            }


        })

        var volumeFolios = []
        folioss.forEach(folio => {
            const ID_VOLUME = folio.ID_VOLUME
            const volume = folio.volume
            const isExists = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME) ? true : false
            if (isExists) {
                const volume = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME)

                const newVolumes = { ...volume, folios: [...volume.folios, folio] }
                volumeFolios = volumeFolios.map(vol => {
                    if (vol.ID_VOLUME == ID_VOLUME) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                volumeFolios.push({
                    ID_VOLUME,
                    volume,
                    folios: [folio]
                })
            }
        })




        var volumeScan = []
        volumeFolios.forEach(volume => {
            var volume = volume
            const folioScan = volume.folios.filter(fol => fol.IS_RECONCILIE != 0)


            volumeScan.push({
                volume,
                folioScan
            })
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Le nombre de volume scanner   est egal à",
            result: volumeScan
        })
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
 * Permet de faire  la detail  de la course
 * @date  25/07/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const gethistoriquevol = async (req, res) => {
    try {
        const { id } = req.params

        const histo = await Volume.findOne({
            where: {
                ID_VOLUME: id
            },
            include: [
                {
                    model: Etapes_volume_historiques,
                    as: 'etapes_volume_historiques',
                    attributes: ['ID_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
                    required: false,

                    include: [
                        {
                            model: Users,
                            as: 'users',
                            attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'TELEPHONE', 'PHOTO_USER'],
                            required: false,
                            include: {
                                model: Profils,
                                as: 'profil',
                                required: false,
                                attributes: ['ID_PROFIL', 'DESCRIPTION'],
                            }
                        },
                        {
                            model: Users,
                            as: 'traitant',
                            attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'TELEPHONE', 'PHOTO_USER'],
                            required: false,
                            include: {
                                model: Profils,
                                as: 'profile',
                                required: false,
                                attributes: ['ID_PROFIL', 'DESCRIPTION'],
                            }

                        },

                        {
                            model: Etapes_volumes,
                            as: 'etapes_volumes',
                            attributes: ['ID_ETAPE_VOLUME', 'NOM_ETAPE'],
                            required: false
                        },
                    ]
                },

            ]
        })
        if (histo) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "voici la liste des historiques",
                result: histo
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Course non trouve",
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
 * permet de  trouver les volumes scanner
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */


const findAllreachive = async (req, res) => {

    try {
        const folioss = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR
                // IS_RECONCILIE:1,
            },
            include:
            {
                model: Volume,
                as: 'volume',
                attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                required: false,

                include :{
                    model: maille,
                    as: 'maille',
                    attributes: ['NUMERO_MAILLE'],
                    required: false, 
                }
            }
        })



        var volumeFolios = []
        folioss.forEach(folio => {
            const ID_VOLUME = folio.ID_VOLUME
            const volume = folio.volume
            const isExists = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME) ? true : false
            if (isExists) {
                const volume = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME)

                const newVolumes = { ...volume, folios: [...volume.folios, folio] }
                volumeFolios = volumeFolios.map(vol => {
                    if (vol.ID_VOLUME == ID_VOLUME) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                volumeFolios.push({
                    ID_VOLUME,
                    volume,
                    folios: [folio]
                })
            }
        })




        var volumereachive = []
        volumeFolios.forEach(volume => {
            var volume = volume
            const volumerachve = volume.folios.filter(fol => fol.ID_ETAPE_VOLUME == 15)


            volumereachive.push({
                volume,
                volumerachve
            })
        })


        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "volume reachive  est egal à",
            result: volumereachive
        })
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
    findAll,
    gethistoriquevol,
    findAllscanne,
    findAllreachive
}