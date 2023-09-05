const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const { excludedProperties } = require('juice');
const DossiersUpload = require('../../class/uploads/DossiersUpload');
const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');
const ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const PROFILS = require('../../constants/PROFILS');
const Volume = require('../../models/Volume');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');
const Folio = require('../../models/Folio');
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques');
const Users = require('../../models/Users');
const User_ailes = require('../../models/User_ailes');
const Maille = require('../../models/Maille');
const Equipes = require('../../models/Equipes');
const { Op } = require('sequelize');
const IDS_ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');

/**
 * Permet de faire la mise a jour des volume envoyer entre un agent superviseur aille phase scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const volumeScanning = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { USER_TRAITEMENT, MAILLE, AGENT_SUP_AILE, ID_ETAPE_VOLUME } = req.body
        // return console.log(USER_TRAITEMENT)
        
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                USER_TRAITEMENT: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                USER_TRAITEMENT: {
                    required: "USER_TRAITEMENT est obligatoire yves",
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
        //RETOUR  DANS LA PHASE PREPARATION
        if (AGENT_SUP_AILE) {
            const result = await Folio.findAll({
                attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO'],
                where: {
                    ID_VOLUME: ID_VOLUME,
                    IS_PREPARE: 0
                },
            })
            const folio_ids = result?.map(folio => folio.ID_FOLIO)
            await Maille.update({
                IS_DISPO: 0,
            }, {
                where: {
                    ID_MAILLE: MAILLE
                }
            })
            // update des folios non  preparaes
            await Folio.update({
                ID_ETAPE_FOLIO: ETAPES_FOLIO.CHEF_EQUIPE_SELECT_AGENT_SUP_AILE,
                ID_MALLE_NO_TRAITE: MAILLE
            }, {
                where: {
                    ID_FOLIO: {
                        [Op.in]: folio_ids
                    }
                },
            })
            const PV_PREPARATION = req.files?.PV_PREPARATION
            const volumeUpload = new VolumePvUpload()
            var filename_pv
            if (PV_PREPARATION) {
                const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV_PREPARATION, false)
                filename_pv = fileInfo_2
            }
            const folio_historiques = result?.map(folio => {
                return {
                    ID_USER: req.userId,
                    USER_TRAITEMENT: AGENT_SUP_AILE,
                    ID_FOLIO: folio.ID_FOLIO,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.CHEF_EQUIPE_SELECT_AGENT_SUP_AILE,
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                }
            })
            await Etapes_folio_historiques.bulkCreate(folio_historiques)
        }

        //PHASE SCANNING
        if (ID_ETAPE_VOLUME != ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE) {
            const result = await Folio.findAll({
                attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO'],
                where: {
                    ID_VOLUME: ID_VOLUME,
                    IS_PREPARE: 1,
                    ID_ETAPE_FOLIO:IDS_ETAPES_FOLIO.RETOUR_CHEF_EQUIPE_SELECT_AGENT_SUP_AILE
                },
            })
            const folio_ids = result?.map(folio => folio.ID_FOLIO)
            // update des folios non  preparaes
            await Folio.update({
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_INDEXATION,
                // ID_MALLE_NO_TRAITE: MAILLE
            }, {
                where: {
                    ID_FOLIO: {
                        [Op.in]: folio_ids
                    }
                },
            })
            const PV = req.files?.PV
            const volumeUpload = new VolumePvUpload()
            var filename_pv
            if (PV) {
                const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
                filename_pv = fileInfo_2
            }
            const folio_historiques = result?.map(folio => {
                return {
                    ID_USER: req.userId,
                    USER_TRAITEMENT: USER_TRAITEMENT,
                    ID_FOLIO: folio.ID_FOLIO,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_INDEXATION,
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                }
            })
            // return console.log(folio_historiques)
            await Etapes_folio_historiques.bulkCreate(folio_historiques)

        }
        else {
            const PV = req.files?.PV
            const volumeUpload = new VolumePvUpload()
            var filename_pv
            if (PV) {
                const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
                filename_pv = fileInfo_2
            }
            const results = await Volume.update({
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES
            }, {
                where: {
                    ID_VOLUME: ID_VOLUME
                }
            })
            await Etapes_volume_historiques.create({
                USERS_ID: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_VOLUME: ID_VOLUME,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            })
        }

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
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
 * Permet d'envoyer le volumes chez un chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const volumeAileScanning = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { USER_TRAITEMENT } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                USER_TRAITEMENT: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                USER_TRAITEMENT: {
                    required: "ID_ETAPE_VOLUME est obligatoire",
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

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: USER_TRAITEMENT,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
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
 * Permet de faire la mise a jour des folios qu'un chef pleteau donnent a un agent superviseur scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const folioChefScanning = async (req, res) => {
    try {
        const {
            ID_VOLUME,
            folio,
            USER_TRAITEMENT
        } = req.body;
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                USER_TRAITEMENT: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                USER_TRAITEMENT: {
                    required: "USER_TRAITEMENT est obligatoire",
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
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        // folioObjet = folio
        await Promise.all(folioObjet.map(async (folio) => {
            // const CODE_REFERENCE = `${folio.NUMERO_FOLIO}${req.userId}${moment().get("s")}`
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.update(
                {
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG
                }, {
                where: {
                    ID_VOLUME: ID_VOLUME,
                    // ID_NATURE: folio.ID_NATURE,
                    NUMERO_FOLIO: folio.NUMERO_FOLIO
                }
            }
            )
            await Etapes_folio_historiques.create({
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            })
        }))
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: reponse
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
 * Permet de faire la mise a jour des folios qu'un agent superviseur scanning donnent a une equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/08/2023
 * 
 */

const folioSupScanning = async (req, res) => {
    try {
        const {
            ID_VOLUME,
            folio,
            USER_TRAITEMENT
        } = req.body;
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                USER_TRAITEMENT: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                USER_TRAITEMENT: {
                    required: "USER_TRAITEMENT est obligatoire",
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
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        // folioObjet = folio
        await Promise.all(folioObjet.map(async (folio) => {
            await Folio.update(
                {
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG
                }, {
                where: {
                    // ID_VOLUME: ID_VOLUME,
                    ID_FOLIO: folio.ID_FOLIO,
                    // NUMERO_FOLIO: folio.NUMERO_FOLIO
                }
            }
            )
            await Etapes_folio_historiques.create({
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            })
        }))
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: reponse
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
 * Permet de recuperer la liste des volumes par rapport a un agent connecter
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/08/2023
 * 
 */

const findAll = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()

        var condition = {}

        if (user.ID_PROFIL == PROFILS.CHEF_EQUIPE) {
            condition = {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE
            }
        }
        else if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
            condition = {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES,
                USER_TRAITEMENT: req.userId,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES
            }
        }
        else if (user.ID_PROFIL == PROFILS.CHEF_PLATEAU_SCANNING) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING, USER_TRAITEMENT: req.userId }
        }
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ...condition
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result
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
 * Permet de recuperer les agents superviseur ailles avec leurs volumes
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/08/2023
 * 
 */

const findAllSuperviseur = async (req, res) => {
    try {
        const result = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_SUPERVISEUR_AILE },
            attributes: ['USERS_ID', 'ID_PROFIL', 'NOM', 'PRENOM', 'EMAIL',],
            include: [
                {
                    model: Etapes_volume_historiques,
                    as: 'histo',
                    required: false,
                    attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH'],
                    include: [
                        {
                            model: Volume,
                            as: 'volume',
                            required: false,
                            attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                        }]
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result
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
 * Permet de recuperer les agents superviseur ailles scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/08/2023
 * 
 */
const findAgentSupAilleScanning = async (req, res) => {
    try {
        const distributeur = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs ailes scanning",
            result: distributeur
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
 * Permet de faire la validation entre un agent superviseur aille et un chef equipe
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */

const chefEquipeValide = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
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

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: req.userId,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
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

const findAllMaille = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const mailles = await Volume.findOne({
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME'],
            where: { ID_VOLUME: ID_VOLUME },
            include: [
                {
                    model: Maille,
                    as: 'maille',
                    required: false,
                    attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des mailles",
            result: mailles
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
 * Permet de recuperer la liste des chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findChefPlateau = async (req, res) => {
    try {
        const chefPlateaux = await Users.findAll({
            where: { ID_PROFIL: PROFILS.CHEF_PLATEAU_SCANNING },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des chefs plateau",
            result: chefPlateaux
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
 * Permet de recuperer la liste des agents superviseur
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findSuperviseurScanning = async (req, res) => {
    try {
        const chefPlateaux = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENT_SUPERVISEUR_SCANNING },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseur scanning",
            result: chefPlateaux
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
 * Permet de recuperer la liste des equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findEquipeScanning = async (req, res) => {
    try {
        const equipe = await Equipes.findAll({
            attributes: ['ID_EQUIPE', 'NOM_EQUIPE', 'CHAINE', 'ORDINATEUR'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des equipe scanning",
            result: equipe
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
 * Permet de recuperer la liste des folios par rapport a un agent connecter
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */

const findAllAgentsFolio = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE'],
                    include: [
                        {
                            model: Equipes,
                            as: 'equipe',
                            required: false,
                            attributes: ['ID_EQUIPE', 'NOM_EQUIPE', 'CHAINE', 'ORDINATEUR'],
                        }
                    ]
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
            message: "Liste des folio",
            UserFolios
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
 * Permet de faire signer un pv entre equipe scanning et agent superviseur scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  3/08/2023
 * 
 */

const updateRetourEquipe = async (req, res) => {
    try {
        const {
            folio
        } = req.body;
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le pv est obligatoire"
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
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        var folioObjet = {}
        folioObjet = JSON.parse(folio)

        await Promise.all(folioObjet.map(async (folio) => {
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.update(
                {
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                    IS_RECONCILIE: 1
                }, {
                where: {
                    ID_FOLIO: folio.folio.ID_FOLIO,
                }
            }
            )
            await Etapes_folio_historiques.create({
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            })
        }))
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: reponse
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
 * Permet de recuperer la liste des folios d'un agent scanning pres a donnees les details
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  3/08/2023
 * 
 */

const findAllFolioScannimg = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                // '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE'],
                    include: [
                        {
                            model: Equipes,
                            as: 'equipe',
                            required: false,
                            attributes: ['ID_EQUIPE', 'NOM_EQUIPE', 'CHAINE', 'ORDINATEUR'],
                        }
                    ],

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.USER_TRAITEMENT
            const date = histo.DATE_INSERTION

            const isExists = PvFolios.find(pv => pv.PV_PATH == PV_PATH) ? true : false
            if (isExists) {
                const allFolio = PvFolios.find(pv => pv.PV_PATH == PV_PATH)
                const newFolios = { ...allFolio, folios: [...allFolio.folios, folio] }
                PvFolios = PvFolios.map(pv => {
                    if (pv.PV_PATH == PV_PATH) {
                        return newFolios
                    } else {
                        return pv
                    }
                })
            }
            else {
                PvFolios.push({
                    PV_PATH,
                    users,
                    date,
                    folios: [folio]
                })
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio",
            PvFolios
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
 * Permet de recuperer la liste des volumes, folios et renconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  3/08/2023
 * 
 */

const findAllVolumeFolioRencolier = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()

        var condition = {}

        if (user.ID_PROFIL == PROFILS.CHEF_PLATEAU) {
            condition = {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
                '$folio.ETAPES_FOLIO$': ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING
            }
        }
        // else if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
        //     condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES, USER_TRAITEMENT: req.userId }
        // }
        // else if (user.ID_PROFIL == PROFILS.CHEF_PLATEAU) {
        //     condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING, USER_TRAITEMENT: req.userId }
        // }
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ...condition
            },
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result
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
 * Permet de faire le retour au chef du plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/08/2023
 * 
 */
const findAllVolumerRetour = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
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
                                ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                                ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
                                ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING
                            ]
                        }
                    },
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
            message: "Liste des folio donnees",
            UserFolios
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
 * Permet de faire le retour des volumes chez un agent superviseur aille
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/08/2023
 * 
 */

const findAllVolumerSupAille = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            include: [
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER'],

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
            message: "Liste des volumes par agent",
            result: UserFolios
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

// const findAllVolumerSupAille = async (req, res) => {
//     try {
//         const userObject = await Users.findOne({
//             where: { USERS_ID: req.userId },
//             attributes: ['ID_PROFIL', 'USERS_ID']
//         })
//         const user = userObject.toJSON()

//         var condition = {}
//         if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
//             condition = { 
//                 '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING, 
//             ID_ETAPE_VOLUME:ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
//             // USER_TRAITEMENT: req.userId 
//         }
//         }
//         const result = await Etapes_volume_historiques.findAll({
//             attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
//             where: {
//                 ...condition
//             },
//             include: [
//                 {
//                     model: Volume,
//                     as: 'volume',
//                     required: true,
//                     attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
//                 }]
//         })
//         res.status(RESPONSE_CODES.OK).json({
//             statusCode: RESPONSE_CODES.OK,
//             httpStatus: RESPONSE_STATUS.OK,
//             message: "Liste des volumes",
//             result
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
//             statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
//             httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
//             message: "Erreur interne du serveur, réessayer plus tard",
//         })
//     }
// }

/**
 * Permet de faire la mise a jour des volume envoyer entre un agent superviseur aille phase scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const volumeScanningRetourAgentAille = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                USER_TRAITEMENT: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                USER_TRAITEMENT: {
                    required: "USER_TRAITEMENT est obligatoire yves",
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

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: req.userId,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
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
    volumeScanning,
    volumeAileScanning,
    folioChefScanning,
    folioSupScanning,
    findAll,
    findAllSuperviseur,
    chefEquipeValide,
    findAgentSupAilleScanning,
    findAllMaille,
    findChefPlateau,
    findSuperviseurScanning,
    findEquipeScanning,
    findAllAgentsFolio,
    updateRetourEquipe,
    findAllFolioScannimg,
    findAllVolumeFolioRencolier,
    findAllVolumerRetour,
    findAllVolumerSupAille,
    volumeScanningRetourAgentAille
}