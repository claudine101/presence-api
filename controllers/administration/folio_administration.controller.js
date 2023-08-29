const express = require('express');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const Etapes_folio = require('../../models/Etapes_folio');
const Nature_folio = require('../../models/Nature_folio')
const Folio = require('../../models/Folio')
const Volume = require('../../models/Volume');
const { Op, where } = require('sequelize');
const moment = require('moment');
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques');
const IDS_ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const Users = require('../../models/Users');
const Etapes_volumes = require('../../models/Etapes_volumes');

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

        const { etape_filters, startDate, endDate, rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = 'ID_FOLIO '
        const defaultSortDirection = "DESC"
        const sortColumns = {
            folio: {
                as: "folio",
                fields: {
                    ID_FOLIO: 'ID_FOLIO',
                    NUMERO_FOLIO: "NUMERO_FOLIO",
                    CODE_FOLIO: "CODE_FOLIO",
                    DATE_INSERTION: "DATE_INSERTION",
                    FOLIO: "FOLIO"

                }
            },
            etapes: {
                as: "etapes",
                fields: {
                    NOM_ETAPE: 'NOM_ETAPE',
                    ID_ETAPE_FOLIO: 'ID_ETAPE_FOLIO'

                }
            },
            volumes: {
                as: "volume",
                fields: {
                    NUMERO_VOLUME: 'NUMERO_VOLUME',

                }
            },

            nature: {
                as: "nature",
                fields: {
                    DESCRIPTION: 'DESCRIPTION',

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
            orderColumn = sortColumns.folio.fields.ID_FOLIO
            sortModel = {
                model: 'folio',
                as: sortColumns.folio.as
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
            'NUMERO_FOLIO',
            'DATE_INSERTION',
            'FOLIO',
            '$volume.NUMERO_VOLUME$',
            '$nature.DESCRIPTION$',
            '$etapes.NOM_ETAPE$'
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
        var etape_filter = {}

        if (etape_filters) {
            etape_filter = { ID_ETAPE_FOLIO: etape_filters }
        }
        // Date filter

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
        const result = await Folio.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
                ...dateWhere,
                ...etape_filter
            },
            include:
                [
                    {
                        model: Etapes_folio,
                        as: 'etapes',
                        attributes: ['NOM_ETAPE'],
                        required: false
                    },
                    {
                        model: Nature_folio,
                        as: 'nature',
                        attributes: ['DESCRIPTION'],
                        required: false
                    }
                    ,
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NUMERO_VOLUME'],
                        required: false
                    }
                    ,

                ]

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios",
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
 * Permet de faire  la detail  de la course
 * @date  25/07/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const getOnehis = async (req, res) => {
    const { id } = req.params
    try {

        const volume = await Volume.findOne({
            where: {
                ID_COURSE: id
            },
            include: [
                {
                    model: vehicules,
                    as: 'vehicules',
                    attributes: ['ID_VEHICULE', 'NUMERO_PLAQUE', 'MARQUE', 'MODELE', 'COULEUR', 'PHOTO_CARTE_ROSE', 'PHOTO_ASSURANCE', 'PHOTO_CONTROLE_TECHNIQUE', 'PHOTO_VEHICULE'],
                    required: false
                },
                {
                    model: Drivers,
                    as: 'drivers',
                    attributes: ['ID_DRIVER', 'NOM', 'PRENOM', 'EMAIL', 'TELEPHONE', 'IMAGE'],
                    required: false
                },
                {
                    model: Riders,
                    as: 'riders',
                    attributes: ['ID_RIDER', 'NOM', 'PRENOM', 'TELEPHONE', 'EMAIL', 'IMAGE'],
                    required: false
                },
                {
                    model: Courses_status,
                    as: 'courses_status',
                    attributes: ['ID_STATUT', 'NOM'],
                    required: false

                }
            ]
        })
        if (courses) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Detail",
                result: courses
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
 * permet de  trouver les volumes uploades et non uploades
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */

const finduploadedrms = async (req, res) => {

    try {
        const foliouplod = await Folio.findAll({

            // attributes : ['IS_UPLOADED_EDRMS','NUMERO_FOLIO','NUMERO_PARCELLE','NOM_PROPRIETAIRE'],
            where: {
                ID_ETAPE_FOLIO: {
                    [Op.in]: [
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE,
                        IDS_ETAPES_FOLIO.CHEF_EQUIPE_EDRMS,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                        IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
                        IDS_ETAPES_FOLIO.FOLIO_NO_UPLOADED_EDRMS,
                        IDS_ETAPES_FOLIO.SELECTION_VERIF_EDRMS,
                        IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
                        IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,
                    ],
                }
            },
            include: [
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
                }
               

            ]
           

        })

        const uniqueIds = [];
        const volumesPure = foliouplod.filter(element => {
            const isDuplicate = uniqueIds.includes(element.toJSON().ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds.push(element.toJSON().ID_VOLUME);
                return true;
            }
            return false;
        });

        const folioupload = await Promise.all(volumesPure.map(async folio => {
            const folioedrms = foliouplod.filter(f => folio.volume.ID_VOLUME == f.toJSON().ID_VOLUME)
            const foliouploader = foliouplod.filter(f => folio.volume.ID_VOLUME == f.toJSON().ID_VOLUME && f.toJSON().IS_UPLOADED_EDRMS == 1)
            const foliononuploader = foliouplod.filter(f => folio.volume.ID_VOLUME == f.toJSON().ID_VOLUME && f.toJSON().IS_UPLOADED_EDRMS == 0)
            const agentUploadEdrms = await Etapes_folio_historiques.findOne({
                attributes :['PV_PATH','DATE_INSERTION'],
                where: {
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,IDS_ETAPES_FOLIO.FOLIO_NO_UPLOADED_EDRMS
                        ]
                    }
                },
                include :[{
                    model :Folio,
                    as: 'folio',
                   attributes: ['NUMERO_FOLIO'],
                   include: [{
                    model: Volume,
                    as: 'volume',
                    required: true,
                    where :{
                        ID_VOLUME :folio.volume.ID_VOLUME 
                    }
                   }]
                },
                {
                    model: Users,
                     as: 'traitement',
                     attributes: ['NOM','PRENOM'],
                    required:false,
                    
                }
            ]
            })
            const agentUploadverificateur = await Etapes_folio_historiques.findOne({
                attributes :['PV_PATH','DATE_INSERTION'],
                where: {
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS
                        ]
                    }
                },
                include :[{
                    model :Folio,
                    as: 'folio',
                   attributes: ['NUMERO_FOLIO'],
                   include: [{
                    model: Volume,
                    as: 'volume',
                    required: true,
                    where :{
                        ID_VOLUME :folio.volume.ID_VOLUME 
                    }
                   }]
                },
                {
                    model: Users,
                     as: 'traitement',
                     attributes: ['NOM','PRENOM'],
                    required:false,
                }
            ]
            })
            return {
                ...folio.toJSON(),
                folioedrms,
                foliouploader,
                foliononuploader,
                agentUploadEdrms,
                agentUploadverificateur
            }
        })
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "dossier uploader EDRMS  est egal à",
            result: folioupload
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
    finduploadedrms
}