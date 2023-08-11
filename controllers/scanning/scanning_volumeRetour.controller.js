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

/**
 * Permet de faire la mise a jour des volume envoyer chez un agent superviseur aille phase scanning
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
                }
            },
            {
                PV: {
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


/**
* Permet de faire le retour des volumes chez un chef d'equipe scanning
* @author Vanny Boy <vanny@mediabox.bi>
* @param {express.Request} req
* @param {express.Response} res 
* @date  8/08/2023
* 
*/
const volumeScanningRetourChefEquipe = async (req, res) => {
    try {
        const volu = await Volume.findAll({
            where: { ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING },
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'ID_MALLE', 'ID_ETAPE_VOLUME','DATE_INSERTION'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            volu
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
 * Permet de recuperer la liste des agents distributeurs
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findAgentDistributeur = async (req, res) => {
    try {
        const distributeur = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_DISTRIBUTEUR },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents distributeurs",
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
 * Permet de faire la mise a jour des volume envoyer chez un agent superviseur aille phase scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const volumeScanningRetourAgentDistributeur = async (req, res) => {
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
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: USER_TRAITEMENT,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
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
 * Permet de faire le retour de volumes d'agents distributeurs
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/08/2023
 * 
 */
const findAllVolumerRetourDistributeur = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()

        var condition = {}

        if (user.ID_PROFIL == PROFILS.AGENTS_DISTRIBUTEUR) {
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR, USER_TRAITEMENT: req.userId }
        }else if(user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_ARCHIVE){
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE, USER_TRAITEMENT: req.userId }
        }else if(user.ID_PROFIL == PROFILS.AGENTS_DESARCHIVAGES){
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE, USER_TRAITEMENT: req.userId }
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
 * Permet de recuperer la liste des agents superviseurs archives
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findAgentSuperviseurArchives = async (req, res) => {
    try {
        const superviseur = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_SUPERVISEUR_ARCHIVE },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs archives",
            result: superviseur
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
 * Permet de faire la mise a jour des volume envoyer chez un agent superviseur aille phase scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const volumeScanningRetourAgentSupArchives = async (req, res) => {
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
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: USER_TRAITEMENT,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE,
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
 * Permet de recuperer la liste des agents desarchivages
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findAgentDesarchivages = async (req, res) => {
    try {
        const desarchivage = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_DESARCHIVAGES },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents desarchivages",
            result: desarchivage
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
 * Permet de faire la mise a jour des volume envoyer chez un agent superviseur aille phase scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */

const volumeScanningRetourDesarchivages = async (req, res) => {
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
        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }

        const results = await Volume.update({
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: USER_TRAITEMENT,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE,
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
 * Permet de recuper les volumes qu'un achef equipe a envoyer dans la phase scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  9/08/2023
 * 
 */
const findAllVolumerEnvoyerScanning = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()

        var condition = {}

        if (user.ID_PROFIL == PROFILS.CHEF_EQUIPE) {
            condition = { ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES }
        }else if(user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING){
            condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING }
        }
        // else if(user.ID_PROFIL == PROFILS.AGENTS_DESARCHIVAGES){
        //     condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE, USER_TRAITEMENT: req.userId }
        // }
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ...condition
            },
            include: [
                {
                    model: Users,
                    as: 'traitant',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'TELEPHONE'],
                }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes chef equipe",
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

module.exports = {
    volumeScanningRetourAgentAille,
    volumeScanningRetourChefEquipe,
    findAgentDistributeur,
    volumeScanningRetourAgentDistributeur,
    findAllVolumerRetourDistributeur,
    findAgentSuperviseurArchives,
    volumeScanningRetourAgentSupArchives,
    findAgentDesarchivages,
    volumeScanningRetourDesarchivages,
    volumeAileScanning,
    findAllVolumerEnvoyerScanning
}
