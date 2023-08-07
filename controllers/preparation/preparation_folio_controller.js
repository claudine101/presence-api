const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const folio = require('../../models/folio');
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques');
const Users = require('../../models/Users');
const ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const PROFILS = require('../../constants/PROFILS');
const Nature_folio = require('../../models/Nature_folio');
const Folio = require('../../models/folio');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');

const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');
const DossiersUpload = require('../../class/uploads/DossiersUpload');
const { Op } = require('sequelize');
const Volume = require('../../models/Volume');
/**
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */
const createfolio = async (req, res) => {
    try {
        const {
            folio, ID_VOLUME
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
        const folioUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await folioUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }

        // const histoPv = histo.toJSON()
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            const CODE_REFERENCE = `${folio.NUMERO_folio}${req.userId}${moment().get("s")}`
            const folioInsert = await Folio.create({
                ID_VOLUME: ID_VOLUME,
                NUMERO_FOLIO: folio.NUMERO_FOLIO,
                ID_NATURE: folio.ID_NATURE,
                CODE_FOLIO: CODE_REFERENCE,
                ID_USERS: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.FOLIO_ENREG,
            }
            )
            const insertData = folioInsert.toJSON()
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    ID_USER: req.userId,
                    ID_FOLIO: insertData.ID_FOLIO,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.FOLIO_ENREG,
                    USER_TRAITEMENT: req.userId,
                }
            )
        }))
        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.DETAILLER_LES_FOLIO
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: req.userId,
            ID_VOLUME: ID_VOLUME,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.DETAILLER_LES_FOLIO
        })
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
        const { ID_VOLUME } = req.params
        const result = await Folio.findAll({
            attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_VOLUME: ID_VOLUME, ID_ETAPE_FOLIO: ETAPES_FOLIO.FOLIO_ENREG
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios",
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
 * Permet permet  de nommer  agent superviseur  Preparation
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 02/08/2023
 */
const nommerSuperviseurPreparation = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folio } = req.body
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
                AGENT_SUPERVISEUR: {
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
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            const results = await Folio.update({
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP
            }, {
                where: {
                    ID_FOLIO: folio.ID_FOLIO,
                }
            })
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    ID_USER: req.userId,
                    ID_FOLIO: folio.ID_FOLIO,
                    USER_TRAITEMENT: AGENT_SUPERVISEUR,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP
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
 * Permet permet  de nommer  agent  Preparation
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 02/08/2023
 */
const nommerAgentPreparation = async (req, res) => {
    try {
        const { AGENT_PREPARATION, folio } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                AGENT_PREPARATION: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                AGENT_PREPARATION: {
                    required: "AGENT_PREPARATION est obligatoire"
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
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            const results = await Folio.update({
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_PREPARATION
            }, {
                where: {
                    ID_FOLIO: folio.folio.ID_FOLIO,
                }
            })
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    ID_USER: req.userId,
                    ID_FOLIO: folio.folio.ID_FOLIO,
                    USER_TRAITEMENT: AGENT_PREPARATION,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_PREPARATION
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
 * Permet permet  de nommer  agent  Preparation
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 02/08/2023
 */
const retourAgentPreparation = async (req, res) => {
    try {
        const { AGENT_PREPARATION, folio } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                AGENT_PREPARATION: {
                    required: true,
                },
                PV: {
                    required: true,
                    image: 21000000
                }

            },
            {
                AGENT_PREPARATION: {
                    required: "AGENT_PREPARATION est obligatoire"
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
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            const results = await Folio.update({
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP
            }, {
                where: {
                    ID_FOLIO: folio.folio.ID_FOLIO,
                }
            })
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    ID_USER: req.userId,
                    ID_FOLIO: folio.folio.ID_FOLIO,
                    USER_TRAITEMENT: AGENT_PREPARATION,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP
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
 * retour d'un agent superviseur
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 03/08/2023
 */
const retourAgentSuperviseur = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folio } = req.body
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
                AGENT_SUPERVISEUR: {
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
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            const results = await Folio.update({
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
            }, {
                where: {
                    ID_FOLIO: folio.folio.ID_FOLIO,
                }
            })
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    ID_USER: req.userId,
                    ID_FOLIO: folio.folio.ID_FOLIO,
                    USER_TRAITEMENT: AGENT_SUPERVISEUR,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
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
 * Permet de afficher tous volume
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const nbre = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR } = req.params
        console.log(AGENT_SUPERVISEUR)
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{ ID_USER: req.userId, USER_TRAITEMENT: AGENT_SUPERVISEUR }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.ADD_DETAILLER_FOLIO
                    }
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, folios: [...volume.folios, user] }
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
                    folios: [user]
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
 * Permet de afficher tous volume
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllFolio = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: { USER_TRAITEMENT: req.userId, '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.SELECTION_AGENT_SUP },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_VOLUME', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    include: {
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME'],

                    }

                }]


        })
        var volumeFolios = []
        console.log(result)
        result.forEach(folio => {
            const ID_VOLUME = folio.folio.ID_VOLUME
            const volume = folio.folio.volume
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
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result: volumeFolios
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
 * Une route  permet  un agents superviseur 
 * de voir  les agents preparation 
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllAgent = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
            },

            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],

                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, folios: [...volume.folios, user] }
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
                    folios: [user]
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
 * Une route  permet  un agents superviseur 
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllAgents = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],

                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, folios: [...volume.folios, user] }
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
                    folios: [user]
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
 * Une route  permet  un agents superviseur 
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllSuperviseurs = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{ ID_USER: req.userId }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [ETAPES_FOLIO.SELECTION_AGENT_SUP,
                            ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                            ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                            ETAPES_FOLIO.ADD_DETAILLER_FOLIO]
                        }
                    }
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, folios: [...volume.folios, user] }
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
                    folios: [user]
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
 * Une route  permet  un agents superviseur 
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const checkAgentsup = async (req, res) => {
    try {
        const { USERS_ID } = req.params
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{ ID_USER: req.userId }, { USER_TRAITEMENT: USERS_ID }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                                ETAPES_FOLIO.ADD_DETAILLER_FOLIO]
                        }
                    }
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const isExists = UserFolios.find(vol => vol.USERS_ID == USERS_ID) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.USERS_ID == USERS_ID)
                const newVolumes = { ...volume, folios: [...volume.folios, user] }
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
                    folios: [user]
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
 * Permet   un agent  superviseur  de nommer  agent  preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const addDetails = async (req, res) => {
    try {
        const {
            NUMERO_PARCELLE,
            COLLINE_ID,
            LOCALITE,
            NOM_PROPRIETAIRE,
            PRENOM_PROPRIETAIRE,
            NUMERO_FEUILLE,
            NOMBRE_DOUBLON,
            ID_FOLIO

        } = req.body;
        const PHOTO_DOSSIER = req.files?.PHOTO_DOSSIER
        const validation = new Validation(
            req.files,
            {
                PHOTO_DOSSIER: {
                    required: true,
                    image: 21000000
                }

            },
            {
                PHOTO_DOSSIER: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
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

        const dossiersUpload = new DossiersUpload()
        var filename_dossiers
        var filename_pv

        if (PHOTO_DOSSIER) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await dossiersUpload.upload(PHOTO_DOSSIER, false)
            filename_dossiers = fileInfo_2
        }
        await Folio.update(
            {
                NUMERO_PARCELLE: NUMERO_PARCELLE,
                ID_COLLINE: COLLINE_ID,
                LOCALITE: LOCALITE,
                NOM_PROPRIETAIRE: NOM_PROPRIETAIRE,
                PRENOM_PROPRIETAIRE: PRENOM_PROPRIETAIRE,
                PHOTO_DOSSIER: filename_dossiers ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_dossiers.fileName}` : null,
                NUMERO_FEUILLE: NUMERO_FEUILLE,
                NOMBRE_DOUBLON: NOMBRE_DOUBLON,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.ADD_DETAILLER_FOLIO

            }, {
            where: {
                ID_FOLIO: ID_FOLIO
            }
        })
        await Etapes_folio_historiques.create(
            {
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                ID_USER: req.userId,
                ID_FOLIO: ID_FOLIO,
                USER_TRAITEMENT: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.ADD_DETAILLER_FOLIO
            })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Modification faite  avec succès",
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
module.exports = {
    createfolio,
    findAll,
    nommerSuperviseurPreparation,
    nommerAgentPreparation,
    findAllFolio,
    findAllAgent,
    findAllAgents,
    retourAgentPreparation,
    retourAgentSuperviseur,
    addDetails,
    findAllSuperviseurs,
    checkAgentsup,
    nbre
}