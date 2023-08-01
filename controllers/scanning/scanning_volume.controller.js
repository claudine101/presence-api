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
            ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: USER_TRAITEMENT,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
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
 * Permet d'envoyer les folios chez un chef plateau
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
                    ID_NATURE: folio.ID_NATURE,
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
                    ID_VOLUME: ID_VOLUME,
                    ID_NATURE: folio.ID_NATURE,
                    NUMERO_FOLIO: folio.NUMERO_FOLIO
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
        const { etape, statut, rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()
        console.log(user)

        var condition = {}

        if (user.ID_PROFIL == PROFILS.CHEF_EQUIPE) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_PLATEAU }
        }
        else if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.PLANIFICATION }
        }
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH'],
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
 * Permet de recuperer les agents superviseur ailles avec leurs volumes
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/08/2023
 * 
 */

const findAllSuperviseur = async (req, res) => {
    try{
        const {} = req.params
        const result = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_SUPERVISEUR_AILE },
            attributes: ['USERS_ID','ID_PROFIL', 'NOM', 'PRENOM', 'EMAIL', ],
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
    catch(error){
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
    findAllSuperviseur
}