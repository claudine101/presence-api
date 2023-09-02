const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const Volume = require('../../models/Volume');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');
const Users = require('../../models/Users');
const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');
const PROFILS = require('../../constants/PROFILS');
const Nature_folio = require('../../models/Nature_folio');
const Folio = require('../../models/Folio');
const { Op } = require("sequelize");
const Maille = require('../../models/Maille');
const IDS_ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');

/**
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */
const createVolume = async (req, res) => {
    try {
        const {
            volume,
        } = req.body;
        const validation = new Validation(
            req.files,
            {

                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run();
        const isValid = await validation.isValidate()
        const errors = await validation.getErrors()
        if (!isValid) {
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }

        // const histoPv = histo.toJSON()
        var volumeObjet = {}
        volumeObjet = JSON.parse(volume)
        await Promise.all(volumeObjet.map(async (volume) => {
            const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            const CODE_REFERENCE = `${volume}${req.userId}${moment().get("s")}`
            const volumeInsert = await Volume.create({
                NUMERO_VOLUME: volume,
                CODE_VOLUME: CODE_REFERENCE,
                USERS_ID: req.userId,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.PLANIFICATION,
            }
            )
            const insertData = volumeInsert.toJSON()
            await Etapes_volume_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    USERS_ID: req.userId,
                    ID_VOLUME: insertData.ID_VOLUME,
                    USER_TRAITEMENT: req.userId,
                    ID_ETAPE_VOLUME: ETAPES_VOLUME.PLANIFICATION
                }
            )
        }))
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Insertion faite  avec succès",
            // result: histoPv
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
 * Permet de afficher tous volume
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAll = async (req, res) => {
    try {
        const { etape, statut, rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const defaultSortDirection = "DESC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    DATE_INSERTION: 'volume.DATE_INSERTION',
                }
            },
        }
        var orderColumn
        if (!orderColumn) {
            orderColumn = sortColumns.volume.fields.DATE_INSERTION
            sortModel = {
                model: 'volume',
                as: sortColumns.volume.as
            }
        }
        const user = userObject.toJSON()
        var condition = {}

        if (user.ID_PROFIL == PROFILS.CHEF_DIVISION_ARCHIGES) {
            condition = {
                USERS_ID: req.userId,
                USER_TRAITEMENT: req.userId
            }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_DESARCHIVAGES) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.PLANIFICATION }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_ARCHIVE) {
            condition = {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SAISIS_NOMBRE_FOLIO,
                USER_TRAITEMENT: req.userId
            }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_DISTRIBUTEUR) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_DES_AILES, USER_TRAITEMENT: req.userId }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_AILE) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES, USER_TRAITEMENT: req.userId }
        }
        else if (user.ID_PROFIL == PROFILS.CHEF_PLATEAU) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_CHEF_PLATAEU, USER_TRAITEMENT: req.userId }
        }
        const result = await Etapes_volume_historiques.findAndCountAll({
            attributes: ['ID_VOLUME_HISTORIQUE', 'ID_ETAPE_VOLUME', 'PV_PATH', 'ID_VOLUME', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            where: {
                [Op.or]: [
                    condition,
                    {
                        ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_PREPARATION
                    }
                ],
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    include:
                    {
                        model: Maille,
                        as: 'maille',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                    }
                }]

        })
        const allVolume = []
        const volume = await Promise.all(result.rows?.map(async resObject => {
            const util = resObject.toJSON()
            const foliosNoPrepare = []
            if (util.ID_ETAPE_VOLUME == 20) {
                const foliosNoPrepare = await Folio.findAll({
                    attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
                    include:
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                    },
                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.ADD_DETAILLER_FOLIO
                        }, {
                            ID_VOLUME: util.ID_VOLUME
                        }]
                    },
                })
                foliosNoPrepare.push(foliosNoPrepare)
                
            }
                allVolume.push({
                    ...util,
                    foliosNoPrepare,
                });
        })
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes total",
            result: {
                data:allVolume,
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
 * Permet de afficher tous volume desarchive par  un agent  desarchivage
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 28/08/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllDesarchive = async (req, res) => {
    try {
        condition = {
            USERS_ID: req.userId,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.SAISIS_NOMBRE_FOLIO
        }
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['ID_VOLUME_HISTORIQUE', 'ID_ETAPE_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],

            where: {
                ...condition
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    include:
                    {
                        model: Maille,
                        as: 'maille',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                    }
                },
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER'],
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes désarchives",
            result: result
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
 * Permet de afficher tous volume distributeur par  un agent distributeur
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 29/08/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllDistribue = async (req, res) => {
    try {
        condition = {
            USERS_ID: req.userId,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES
        }
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['ID_VOLUME_HISTORIQUE', 'PV_PATH', 'ID_ETAPE_VOLUME', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            where: {
                ...condition
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    include:
                    {
                        model: Maille,
                        as: 'maille',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                    }
                },
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER'],
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes désarchives",
            result: result
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
 * Permet de afficher tous volume
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllVolume = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    DATE_INSERTION: 'volume.DATE_INSERTION',
                }
            },
        }
        var orderColumn
        if (!orderColumn) {
            orderColumn = sortColumns.volume.fields.DATE_INSERTION
            sortModel = {
                model: 'volume',
                as: sortColumns.volume.as
            }
        }
        const user = userObject.toJSON()
        var condition = {}

        if (user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_AILE) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_PLATEAU, USERS_ID: req.userId }
        }

        const result = await Etapes_volume_historiques.findAndCountAll({
            order: [
                ['DATE_INSERTION', 'DESC']
            ],

            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU, USERS_ID: req.userId
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    include:
                    {
                        model: Maille,
                        as: 'maille',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                    }
                }]

        })
        const foliosPrepares = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 1,
            },

        })
        const foliosPreparesNov = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 1,
                PRENOM_PROPRIETAIRE: null
            },

        })
        const foliosNoPrepare = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 0,
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
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
 * Permet de afficher tous volume
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findCheckPlateau = async (req, res) => {
    try {
        const { etape, statut, rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const defaultSortDirection = "DESC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    DATE_INSERTION: 'volume.DATE_INSERTION',
                }
            },
        }
        var orderColumn
        if (!orderColumn) {
            orderColumn = sortColumns.volume.fields.DATE_INSERTION
            sortModel = {
                model: 'volume',
                as: sortColumns.volume.as
            }
        }
        const user = userObject.toJSON()
        var condition = {}

        if (user.ID_PROFIL == PROFILS.CHEF_DIVISION_ARCHIGES) {
            condition = { USERS_ID: req.userId }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_DESARCHIVAGES) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.PLANIFICATION }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_ARCHIVE) {
            condition = {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SAISIS_NOMBRE_FOLIO,
                USER_TRAITEMENT: req.userId
            }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_DISTRIBUTEUR) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_DES_AILES, USER_TRAITEMENT: req.userId }
        }
        else if (user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_AILE) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES, USER_TRAITEMENT: req.userId }
        }
        else if (user.ID_PROFIL == PROFILS.CHEF_PLATEAU) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_CHEF_PLATAEU, USER_TRAITEMENT: req.userId }
        }
        const result = await Etapes_volume_historiques.findAndCountAll({
            // attributes: ['NUMERO_VOLUME','CODE_VOLUME','NOMBRE_DOSSIER','USERS_ID','ID_MALLE','ID_ETAPE_VOLUME'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            //         order: [
            //             [orderColumn, defaultSortDirection]
            //   ],
            where: {
                ...condition
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    include:
                    {
                        model: Maille,
                        as: 'maille',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                    }
                }]

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
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
 * Permet de afficher tous volume
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findDetailler = async (req, res) => {
    try {


        var condition = {}
        condition = {
            '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.DETAILLER_LES_FOLIO,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.DETAILLER_LES_FOLIO,
            USER_TRAITEMENT: req.userId
        }

        const result = await Etapes_volume_historiques.findAndCountAll({
            attributes: ['ID_VOLUME'],
            where: {
                ...condition
            },
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                }]

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
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
 * Permet de afficher tous volume superviser par un agebr sup archives
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 28/08/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllVolumeSuperviser = async (req, res) => {
    try {
        var condition = {}
        condition = {
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_DES_AILES,
            USERS_ID: req.userId
        }
        const result = await Etapes_volume_historiques.findAndCountAll({
            attributes: ['ID_VOLUME', 'PV_PATH', 'ID_ETAPE_VOLUME', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            where: {
                ...condition
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                },
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER'],
                }]

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
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
 * Permet permet  de nommer  agent superviseur  archive
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 1/08/2023
 */
const updateVolume = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { NOMBRE_DOSSIER, ID_USERS } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                NOMBRE_DOSSIER: {
                    required: true,
                },
                ID_USERS: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                NOMBRE_DOSSIER: {
                    required: "NOMBRE_DOSSIER est obligatoire"
                },
                ID_USERS: {
                    required: "ID_USERS est obligatoire"
                },
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        const volumeDossier = (await Volume.findOne({
            where: {
                ID_VOLUME,
                NOMBRE_DOSSIER: null

            }

        }))

        if (volumeDossier) {
            var filename_pv
            if (PV) {
                const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
                filename_pv = fileInfo_2
            }
            const results = await Volume.update({
                NOMBRE_DOSSIER,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SAISIS_NOMBRE_FOLIO
            }, {
                where: {
                    ID_VOLUME: ID_VOLUME
                }
            })
            await Etapes_volume_historiques.create({
                USERS_ID: req.userId,
                USER_TRAITEMENT: ID_USERS,
                ID_VOLUME: ID_VOLUME,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SAISIS_NOMBRE_FOLIO
            })
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Reussi",

            })
        }
        else {
            res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                httpStatus: RESPONSE_CODES.UNAUTHORIZED,
                message: "Nombre de dossier  existe déjà",

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
 * Permet permet  de nommer  agent distributeur
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 1/08/2023
 */
const nommerDistributeur = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { AGENT_DISTRIBUTEUR, MAILLE } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                AGENT_DISTRIBUTEUR: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                AGENT_DISTRIBUTEUR: {
                    required: "AGENT_DISTRIBUTEUR est obligatoire"
                },
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_DES_AILES,
            ID_MALLE: MAILLE
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: AGENT_DISTRIBUTEUR,
            ID_VOLUME: ID_VOLUME,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_DES_AILES
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Reussi",

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
 * Permet permet  de nommer  agent superviseur  aile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 1/08/2023
 */
const nommerSuperviseurAile = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { AGENT_SUPERVISEUR } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                AGENT_SUPERVISEUR: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                AGENT_DISTRIBUTEUR: {
                    required: "AGENT_SUPERVISEUR est obligatoire"
                },
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: AGENT_SUPERVISEUR,
            ID_VOLUME: ID_VOLUME,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Reussi",

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
 * Permet permet  de nommer  chef plateau
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 1/08/2023
 */
const nommerChefPlateau = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { CHEF_PLATEAU ,histo_IDETAPE} = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                CHEF_PLATEAU: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                CHEF_PLATEAU: {
                    required: "CHEF_PLATEAU est obligatoire"
                },
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_CHEF_PLATAEU
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: CHEF_PLATEAU,
            ID_VOLUME: ID_VOLUME,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_CHEF_PLATAEU
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Reussi",

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
 * Permet de afficher tous nature du folio
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findNature = async (req, res) => {
    try {
        const { search } = req.query
        const natures = await Nature_folio.findAll()
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des natures du folio",
            result: natures
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
 * Permet de afficher nbre  folio
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findCount = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const natures = await Folio.findAndCountAll(
            {
                where: { ID_VOLUME: ID_VOLUME }
            }
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Nombre folio",
            result: natures.count
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
 * Une route  permet  un agents superviseur 
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllChefPlateau = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                USERS_ID: req.userId, '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_CHEF_PLATAEU,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_CHEF_PLATAEU
            },
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION'],
            include: [
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'CODE_VOLUME'],

                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitant?.USERS_ID
            const users = user.traitant
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, volumes: [...volume.volumes, user] }
                UserFolios = UserFolios.map(vol => {
                    if (vol.USERS_ID == USERS_ID) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                UserFolios.push({
                    USERS_ID,
                    users,
                    volumes: [user]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result: UserFolios
            // result:result
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
 * Une route  permet  a un chef equipe de voir les agent superviseur  et  leur volume
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  03/08/2023
 * 
 */
const findAllAgentSupAile = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_PLATEAU,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME'],
            include: [
                {
                    model: Users,
                    as: 'users',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME'],

                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.users?.USERS_ID
            const users = user.users
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, volumes: [...volume.volumes, user] }
                UserFolios = UserFolios.map(vol => {
                    if (vol.USERS_ID == USERS_ID) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                UserFolios.push({
                    USERS_ID,
                    users,
                    volumes: [user]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result: UserFolios
            // result:result
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
 * Une route  permet  a un chef equipe de voir les agent superviseur  
 * et  leur volume en retour  de la phase preparation
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  03/09/2023
 * 
 */
const findAllAgentSupAileRetour = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                // '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
                USERS_ID: req.userId,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_PREPARATION
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH'],
            include: [
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME'],

                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.users?.USERS_ID
            const users = user.users
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, volumes: [...volume.volumes, user] }
                UserFolios = UserFolios.map(vol => {
                    if (vol.USERS_ID == USERS_ID) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                UserFolios.push({
                    USERS_ID,
                    users,
                    volumes: [user]
                })

            }

        })
        var allVolume = []
        const volume = await Promise.all(result?.map(async resObject => {
            const util = resObject.toJSON()
            const folios = await Folio.findAll({
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
                include:
                {
                    model: Maille,
                    as: 'malleNonTraite',
                    required: false,
                    attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],

                },
                where: {
                    [Op.and]: [{
                        ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.ADD_DETAILLER_FOLIO
                    }, {
                        ID_VOLUME: util.volume.ID_VOLUME
                    }]
                },
            })
            // return console.log(folios)
            if (folios?.length > 0) {
                allVolume.push({
                    ...util,
                    folios,
                });
            }
        })
        )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes non traités",
            result: allVolume
            // result:result
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
 * retour d'un chef plateau
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 03/08/2023
 */
const retourChefPlateau = async (req, res) => {
    try {
        const { CHEF_PLATEAU, volume } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                CHEF_PLATEAU: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                CHEF_PLATEAU: {
                    required: "CHEF_PLATEAU est obligatoire"
                },
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU
        }, {
            where: {
                ID_VOLUME: volume,
            }
        })
        await Etapes_volume_historiques.create(
            {
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                USERS_ID: req.userId,
                ID_VOLUME: volume,
                USER_TRAITEMENT: CHEF_PLATEAU,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU
            }
        )

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Reussi",

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
 * retour d'un chef plateau
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 03/08/2023
 */
const retourAgentSupAile = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR_AILE, volume } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                AGENT_SUPERVISEUR_AILE: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                AGENT_SUPERVISEUR_AILE: {
                    required: "AGENT_SUPERVISEUR_AILE est obligatoire"
                },
                PV: {
                    image: "La taille invalide",
                    required: "PV est obligatoire"
                }
            }
        );
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        var volumeObjet = {}
        volumeObjet = JSON.parse(volume)
        await Promise.all(volumeObjet.map(async (volume) => {
            const results = await Volume.update({
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE
            }, {
                where: {
                    ID_VOLUME: volume.volume.ID_VOLUME,
                }
            })
            await Etapes_volume_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    USERS_ID: req.userId,
                    ID_VOLUME: volume.volume.ID_VOLUME,
                    USER_TRAITEMENT: AGENT_SUPERVISEUR_AILE,
                    ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE
                }
            )
        }))

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Reussi",

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
 *  Details pour d'une volume d'un chef plateau
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 21/08/2023
 */
const getVolumeDetail = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const volumes = (await Volume.findOne({
            where: {
                ID_VOLUME
            },
            include: [{
                model: Folio,
                as: 'folios',
                required: false,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE"]
            }]
        })).toJSON()
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_CHEF_PLATAEU
                }]
            },
            include: [{
                model: Users,
                as: 'traitement',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER']
            }]
        })
        const chefPlateauRetour = await Etapes_volume_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO'],
                where: {
                    [Op.and]: [{
                        ID_FOLIO: flash.folios[0].ID_FOLIO,
                    }, {
                        IS_INDEXE: 1
                    }]
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER']
            }]
        })
        var foliosPrepares = []
        if (chefPlateauRetour) {
            foliosPrepares = await Folio.findAll({
                attributes: ['ID_VOLUME', 'IS_INDEXE', 'ID_FOLIO', 'NUMERO_FOLIO', 'ID_PREPARE'],
                where: {
                    [Op.and]: [{
                        ID_VOLUME: ID_VOLUME,
                    }, {
                        ID_VOLUME: 1
                    }]
                },
                include: [{
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
                }]
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Detail d'un volume",
            result: {
                ...volumes,
                chefPlateau,
                chefPlateauRetour,
                foliosPrepares
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
 * Permet de recuperer un chef plateau n d'une volume
 * @author claudine <claudine@mediabox.bi>
 * @date 21/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getVolumeChefPlateau = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.CHOIX_CHEF_PLATAEU,
                ID_VOLUME: ID_VOLUME
            },
            include: [{
                model: Users,
                as: 'traitant',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER']
            }]
        })
        const retour = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME
            },
            include: [{
                model: Users,
                as: 'traitant',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER']
            }]
        })
        const check = await Folio.findAll({
            attributes: ['ID_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME
            },

        })
        const foliosPrepares = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 1,
            },

        })
        const foliosPreparesNov = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 1,
                PRENOM_PROPRIETAIRE: null
            },

        })
        const foliosNoPrepare = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 0,
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...chefPlateau.toJSON(),
                retour: retour ? retour.toJSON() : null,
                check: check ? check : null,
                foliosPrepares,
                foliosPreparesNov,
                foliosNoPrepare
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
module.exports = {
    createVolume,
    findAll,
    findDetailler,
    updateVolume,
    findNature,
    findCount,
    nommerDistributeur,
    nommerSuperviseurAile,
    nommerChefPlateau,
    findAllChefPlateau,
    findAllAgentSupAile,
    retourChefPlateau,
    retourAgentSupAile,
    findCheckPlateau,
    getVolumeDetail,
    getVolumeChefPlateau,
    findAllVolume,
    findAllDesarchive,
    findAllDistribue,
    findAllVolumeSuperviser,
    findAllAgentSupAileRetour


}