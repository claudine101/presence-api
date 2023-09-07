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
        // const volu = await Volume.findAll({
        //     where: { ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING },
        //     attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'ID_MALLE', 'ID_ETAPE_VOLUME', 'DATE_INSERTION'],
        // })
        const result = await Etapes_volume_historiques.findAll({
            attributes: ['ID_VOLUME_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING 
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
        const volume = await Promise.all(result?.map(async resObject => {
            const util = resObject.toJSON()
            const folios = await Folio.findAll({
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO','ID_ETAPE_FOLIO'],
                where: {
                    [Op.and]: [
                        {
                            ID_VOLUME: util.volume.ID_VOLUME
                        },
                        {
                            [Op.or]: [
                                { ID_ETAPE_FOLIO : ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU },
                                { ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING },
                                { ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU }
                            ]
                        }
                    ]
                },
            })
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
            message: "Liste des volumes",
            allVolume
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
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
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
        const { USER_TRAITEMENT, ID_VOLUMES } = req.body
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
        const results = await Folio.findAll({
            where: {
                [Op.and]: [
                    {
                        ID_VOLUME: ID_VOLUME,
                    },
                    {
                        IS_VALIDE: 1,
                    }
                ]
            },
            attributes: ['ID_FOLIO'],
        })
        const id_folios = results.map(folio => folio.ID_FOLIO)
        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_PREPARATION,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: id_folios
                }
            }
        })
        const folio_historiques_reconcilier = id_folios.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_PREPARATION,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        const resultsss = await Volume.update({
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
// const findAllVolumerRetourDistributeur = async (req, res) => {
//     try {
//         const userObject = await Users.findOne({
//             where: { USERS_ID: req.userId },
//             attributes: ['ID_PROFIL', 'USERS_ID']
//         })
//         const user = userObject.toJSON()

//         var condition = {}

//         if (user.ID_PROFIL == PROFILS.AGENTS_DISTRIBUTEUR) {
//             condition = {
//                 '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR, USER_TRAITEMENT: req.userId,
//                 ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR
//             }
//         } else if (user.ID_PROFIL == PROFILS.AGENTS_SUPERVISEUR_ARCHIVE) {
//             condition = {
//                 '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE, USER_TRAITEMENT: req.userId
//                 , ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE
//             }
//         } else if (user.ID_PROFIL == PROFILS.AGENTS_DESARCHIVAGES) {
//             condition = {
//                 '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE, USER_TRAITEMENT: req.userId
//                 , ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE
//             }
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
//                     required: false,
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
const findAllVolumerRetourDistributeur = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'users',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER'],
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]
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
 * Permet de faire recuperer les volumes retourner chez un agent superviseur archives
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findAllVolumerRetourAgentSupeArchives = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'users',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL'],
                },
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER'],
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

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
 * Permet de faire recuperer les volumes retourner chez un agent desarchivages
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findAllVolumerRetourDesarchivages = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'users',
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
            message: "Liste des volumes",
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
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
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
 * Permet de faire le retour de volume d'un agent disributeur ves un agent superviseur archives
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
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
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
// const findAllVolumerEnvoyerScanning = async (req, res) => {
//     try {
//         const userObject = await Users.findOne({
//             where: { USERS_ID: req.userId },
//             attributes: ['ID_PROFIL', 'USERS_ID']
//         })
//         const user = userObject.toJSON()

//         var condition = {}

//         if (user.ID_PROFIL == PROFILS.CHEF_EQUIPE) {
//             condition = { ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES }
//         } else if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
//             condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING }
//         }
//         // else if(user.ID_PROFIL == PROFILS.AGENTS_DESARCHIVAGES){
//         //     condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE, USER_TRAITEMENT: req.userId }
//         // }
//         const result = await Etapes_volume_historiques.findAll({
//             attributes: ['USERS_ID', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH', 'DATE_INSERTION'],
//             where: {
//                 ...condition
//             },
//             include: [
//                 {
//                     model: Users,
//                     as: 'traitant',
//                     required: false,
//                     attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'TELEPHONE'],
//                 }]
//         })
//         res.status(RESPONSE_CODES.OK).json({
//             statusCode: RESPONSE_CODES.OK,
//             httpStatus: RESPONSE_STATUS.OK,
//             message: "Liste des volumes chef equipe",
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
        } else if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
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

/**
 * Permet de recuper les pvs d'un chef plateau deja signer sur les folios dejs donnees
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  25/08/2023
 * 
 */

const findFoliosGetsPvsPlateau = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...pv.toJSON(),
                // pvRetour
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


const checkRetourChefPlateau = async (req, res) => {
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
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,]
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
 * Permet de recuperer la liste des folios par rapport a un agent connecter
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */

const getFoliosAll = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: { USER_TRAITEMENT: req.userId, '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
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
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'CODE_VOLUME', 'DATE_INSERTION'],

                    }
                }]


        })
        var volumeFolios = []
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
            message: "Liste des folios d'un volumnes",
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
 * Permet de recuper les pvs d'un agent superviseur scanning signe avec une equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findGetsPvsAgentSupervieur = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        // const pvRetour = await Etapes_folio_historiques.findOne({
        //     attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
        //     where: {
        //         [Op.and]: [{
        //             ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
        //         }, {
        //             ID_USER: req.userId
        //         }, {
        //             USER_TRAITEMENT: AGENT_SUPERVISEUR
        //         }, {
        //             ID_FOLIO: {
        //                 [Op.in]: IdsObjet
        //             }
        //         }]
        //     }
        // })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de verfier si un agent scanning est pret a signer le pvs de retour avec l'equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const checkRetourAgentSupScann = async (req, res) => {
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
                            [Op.and]: [
                                ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,]
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
            message: "Liste de folios qui attend le retour",
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/08/2023
 * 
 */


const updateRetourPlateauSup = async (req, res) => {
    try {
        const { ID_FOLIO, folio } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIO: {
                    required: true
                },
                folio: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIO: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
                folio: {
                    image: "folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(folio)
        console.log(folioObjet)
        const folio_reconcilier = folioObjet.map(folio => folio.folio.ID_FOLIO)
        console.log(folio_reconcilier)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
            IS_VALIDE: 1
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_reconcilier
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        folioAllObjet = JSON.parse(ID_FOLIO)
        const folios = await Folio.findAll({
            attributes: ['ID_FOLIO'],
            where: {
                ID_FOLIO: {
                    [Op.in]: folioAllObjet,
                },
                IS_VALIDE: null
            }

        })
        const folio_no_reconciliers = folios.map(folio => folio.toJSON().ID_FOLIO)
        await Folio.update({
            IS_VALIDE: 0,
            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,

        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_no_reconciliers
                }
            }
        })

        const folio_historiques_no_reconciliers = folios.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_no_reconciliers)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de recuperer tous les volumes d\un chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */

const findAllVolumePlateauChef = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })

        const user = userObject.toJSON()
        var condition = {}
        condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING, USER_TRAITEMENT: req.userId }

        const result = await Etapes_volume_historiques.findAll({
            attributes: ['ID_VOLUME_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION'],
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
                }]

        })
        const allVolume = []
        const volume = await Promise.all(result?.map(async resObject => {
            const util = resObject.toJSON()
            const folios = await Folio.findAll({
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO','NUMERO_FOLIO'],
                where: {
                    [Op.and]: [{
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
                    }, {
                        ID_VOLUME: util.volume.ID_VOLUME
                    }]
                },
            })
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
            message: "Liste des volumes",
            result: allVolume
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
 * Permet de faire retourner le volumees deja traiter par chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllVolumePlateauChefTraites = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                                ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                                ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                                ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuper les pvs d'un chef plateau signe avec agent superviseur scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findGetsPvsChefPlateauRetour = async (req, res) => {
    try {
        const { folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: req.userId
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de faire retourner le volumees deja traiter par un agent superviseur aile scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllVolumeSupAileScanningTraites = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

                }
            ]
        })
        var PvVolume = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const volume = histo.volume
            const users = histo.traitant
            const date = histo.DATE_INSERTION

            const isExists = PvVolume.find(pv => pv.PV_PATH == PV_PATH) ? true : false
            if (isExists) {
                const allFolio = PvVolume.find(pv => pv.PV_PATH == PV_PATH)
                const newFolios = { ...allFolio, volumes: [...allFolio.volumes, volume] }
                PvVolume = PvVolume.map(pv => {
                    if (pv.PV_PATH == PV_PATH) {
                        return newFolios
                    } else {
                        return pv
                    }
                })
            }
            else {
                PvVolume.push({
                    PV_PATH,
                    users,
                    date,
                    volumes: [volume]
                })
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes traitees",
            PvVolume
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
 * Permet de recuper les pvs d'un agent sup aille signe avec le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */

const findGetsPvsSupAilleScanRetour = async (req, res) => {
    try {
        const { volume_ids } = req.body
        const IdsObjet = JSON.parse(volume_ids)

        const pv = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'DATE_INSERTION', 'PV_PATH'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
                }, {
                    USERS_ID: req.userId
                }, {
                    USER_TRAITEMENT: req.userId
                }, {
                    ID_VOLUME: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de faire retourner le volumees deja traiter par un chef d'equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllVolumeChefEquipScanningTraites = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

                }
            ]
        })
        var PvVolume = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const volume = histo.volume
            const users = histo.traitant
            const date = histo.DATE_INSERTION

            const isExists = PvVolume.find(pv => pv.PV_PATH == PV_PATH) ? true : false
            if (isExists) {
                const allFolio = PvVolume.find(pv => pv.PV_PATH == PV_PATH)
                const newFolios = { ...allFolio, volumes: [...allFolio.volumes, volume] }
                PvVolume = PvVolume.map(pv => {
                    if (pv.PV_PATH == PV_PATH) {
                        return newFolios
                    } else {
                        return pv
                    }
                })
            }
            else {
                PvVolume.push({
                    PV_PATH,
                    users,
                    date,
                    volumes: [volume]
                })
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes traitees",
            PvVolume
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
 * Permet de faire retourner le volumees deja traiter par un agent distributeur
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllVolumeAgentDistributeurTraites = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE,
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

                }
            ]
        })
        var PvVolume = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const volume = histo.volume
            const users = histo.traitant
            const date = histo.DATE_INSERTION

            const isExists = PvVolume.find(pv => pv.PV_PATH == PV_PATH) ? true : false
            if (isExists) {
                const allFolio = PvVolume.find(pv => pv.PV_PATH == PV_PATH)
                const newFolios = { ...allFolio, volumes: [...allFolio.volumes, volume] }
                PvVolume = PvVolume.map(pv => {
                    if (pv.PV_PATH == PV_PATH) {
                        return newFolios
                    } else {
                        return pv
                    }
                })
            }
            else {
                PvVolume.push({
                    PV_PATH,
                    users,
                    date,
                    volumes: [volume]
                })
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes traitees",
            PvVolume
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
 * Permet de faire retourner le volumees deja traiter par un agent superviseur archives
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllVolumeAgenSupArchivesTraites = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE,
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

                }
            ]
        })
        var PvVolume = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const volume = histo.volume
            const users = histo.traitant
            const date = histo.DATE_INSERTION

            const isExists = PvVolume.find(pv => pv.PV_PATH == PV_PATH) ? true : false
            if (isExists) {
                const allFolio = PvVolume.find(pv => pv.PV_PATH == PV_PATH)
                const newFolios = { ...allFolio, volumes: [...allFolio.volumes, volume] }
                PvVolume = PvVolume.map(pv => {
                    if (pv.PV_PATH == PV_PATH) {
                        return newFolios
                    } else {
                        return pv
                    }
                })
            }
            else {
                PvVolume.push({
                    PV_PATH,
                    users,
                    date,
                    volumes: [volume]
                })
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes traitees",
            PvVolume
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
 * Permet de valider si une volumes est dejs archivez ou non
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  29/08/2023
 * 
 */

const volumeArchivesAgentDesarchivages = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { ARCHIVER } = req.body
        const validation = new Validation(
            { ...req.body },
            {
                ARCHIVER: {
                    required: true,
                }
            },
            {
                ARCHIVER: {
                    required: "ARCHIVER est obligatoire",
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
        if (ARCHIVER == 1) {
            const results = await Volume.update({
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_ARCHIVE_VOLUME_AGENT_DESARCHIVAGES
            }, {
                where: {
                    ID_VOLUME: ID_VOLUME
                }
            })
            await Etapes_volume_historiques.create({
                USERS_ID: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_VOLUME: ID_VOLUME,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_ARCHIVE_VOLUME_AGENT_DESARCHIVAGES
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
 * Permet de faire retourner le volumees deja traiter par un agent desarchivages
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  29/08/2023
 * 
 */
const findAllVolumeAgenDesarchivagesTraites = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_ARCHIVE_VOLUME_AGENT_DESARCHIVAGES,
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
            include: [
                {
                    model: Volume,
                    as: 'volume',
                    required: false,
                    attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER'],
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

                }
            ]
        })
        //         var PvVolume = []
        //         result.forEach(histo => {
        //             const PV_PATH = histo.PV_PATH
        //             const volume = histo.volume
        //             const users = histo.traitant
        //             const date = histo.DATE_INSERTION

        //             const isExists = PvVolume.find(pv => pv.PV_PATH == PV_PATH) ? true : false
        //             if (isExists) {
        //                 const allFolio = PvVolume.find(pv => pv.PV_PATH == PV_PATH)
        //                 const newFolios = { ...allFolio, volumes: [...allFolio.volumes, volume] }
        //                 PvVolume = PvVolume.map(pv => {
        //                     if (pv.PV_PATH == PV_PATH) {
        //                         return newFolios
        //                     } else {
        //                         return pv
        //                     }
        //                 })
        //             }
        //             else {
        //                 PvVolume.push({
        //                     PV_PATH,
        //                     users,
        //                     date,
        //                     volumes: [volume]
        //                 })
        //             }
        //         })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes traitees",
            // PvVolume
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
 * Permet de faire retourner le volumees deja traiter par un chef d'equipe preparation
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  30/08/2023
 * 
 */
const findAllVolumeChefEquipePrepqrqtionTraites = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES,
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    include: [
                        {
                            model: Maille,
                            as: 'maille',
                            required: false,
                            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                        }]

                }
            ]
        })
        var PvVolume = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const volume = histo.volume
            const users = histo.traitant
            const date = histo.DATE_INSERTION

            const isExists = PvVolume.find(pv => pv.PV_PATH == PV_PATH) ? true : false
            if (isExists) {
                const allFolio = PvVolume.find(pv => pv.PV_PATH == PV_PATH)
                const newFolios = { ...allFolio, volumes: [...allFolio.volumes, volume] }
                PvVolume = PvVolume.map(pv => {
                    if (pv.PV_PATH == PV_PATH) {
                        return newFolios
                    } else {
                        return pv
                    }
                })
            }
            else {
                PvVolume.push({
                    PV_PATH,
                    users,
                    date,
                    volumes: [volume]
                })
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes traitees",
            PvVolume
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
 * Permet de faire retourner le volumees non valide par chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllVolumePlateauChefNonValide = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de faire retourner le volumees non valide chez chef plateau retour chez agent superviseur
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  30/08/2023
 * 
 */
const findAllVolumePlateauChefNonValideRetour = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        [Op.and]: [{
                            IS_RECONCILIE: 1,
                        }, {
                            IS_VALIDE: 0,
                        },
                        {
                            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU
                        }
                        ]
                    },

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuper les pvs  d'un chef plateau signe avec un agent superviseur scanning 
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  30/08/2023
 * 
 */

const findGetsPvsAgentSupervieurRetourNonValid = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                }, {
                    ID_USER: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de recuper les volumes retourner chez un agent superviseur scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/08/2023
 * 
 */

const findVolumeAssocierAgentsupAilleScan = async (req, res) => {
    try {
        const result = await Etapes_volume_historiques.findAll({
            where: {
                '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING
            },
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_VOLUME', 'PV_PATH'],
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
 * Permet de recuper les volumes retourner chez un chef equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/08/2023
 * 
 */
const retourAgentSupAile = async (req, res) => {
    try {
        const { volume } = req.body
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
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING
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
                    USER_TRAITEMENT: req.userId,
                    ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING
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
 * Permet de recuperer la liste des folios retourner pour scannings
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/08/2023
 * 
 */

const getFoliosAllRetourner = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    USER_TRAITEMENT: req.userId,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_VOLUME', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING
                        }]
                    },
                    include: {
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'CODE_VOLUME', 'DATE_INSERTION'],

                    }
                }]


        })
        // var volumeFolios = []
        // result.forEach(folio => {
        //     console.log(folio)
        //     const ID_VOLUME = folio.folio.ID_VOLUME
        //     const volume = folio.folio.volume
        //     const isExists = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME) ? true : false
        //     if (isExists) {
        //         const volume = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME)

        //         const newVolumes = { ...volume, folios: [...volume.folios, folio] }
        //         volumeFolios = volumeFolios.map(vol => {
        //             if (vol.ID_VOLUME == ID_VOLUME) {
        //                 return newVolumes
        //             } else {
        //                 return vol
        //             }
        //         })
        //     } else {
        //         volumeFolios.push({
        //             ID_VOLUME,
        //             volume,
        //             folios: [folio]
        //         })
        //     }
        // })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios d'un volumnes",
            // result: volumeFolios
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
 * Permet de recuperer la liste des folios retourner pour scannings
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/08/2023
 * 
 */

const getFoliosAllRetournernotValid = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_VOLUME', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU
                        }]
                    },
                    include: {
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'CODE_VOLUME', 'DATE_INSERTION'],

                    }
                }]


        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios d'un volumnes",
            // result: volumeFolios
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
 * Permet de recuperer la liste le details de volumes
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const getVolumeDetailsVolume = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
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
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME
            },

        })
        const foliosValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_VALIDE: 1,
            },
        })
        const foliosNonValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
                IS_VALIDE: 0,
            },

        })
        const foliosScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
            },

        })
        const foliosNoScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 0,
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef plateau de la volume",
            result: {
                ...chefPlateau.toJSON(),
                retour: retour ? retour.toJSON() : null,
                check: check ? check : null,
                foliosValid,
                foliosNonValid,
                foliosScanReconcilier,
                foliosNoScanReconcilier
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
 * Permet de recuperer la liste le details de volumes traites par agents sup aile scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const getVolumeDetailsVolumeTraitesSup = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME
            },

        })
        const foliosValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_VALIDE: 1,
            },
        })
        const foliosNonValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
                IS_VALIDE: 0,
            },

        })
        const foliosScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
            },

        })
        const foliosNoScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 0,
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef plateau de la volume",
            result: {
                // ...chefPlateau.toJSON(),
                check: check ? check : null,
                foliosValid,
                foliosNonValid,
                foliosScanReconcilier,
                foliosNoScanReconcilier
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
 * Permet de recuperer la liste le details de volumes che chef equipe scannings
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const getVolumeDetailsVolumeTraitesChefEquiScan = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME
            },

        })
        const foliosValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_VALIDE: 1,
            },
        })
        const foliosNonValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
                IS_VALIDE: 0,
            },

        })
        const foliosScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
            },

        })
        const foliosNoScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 0,
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef plateau de la volume",
            result: {
                // ...chefPlateau.toJSON(),
                check: check ? check : null,
                foliosValid,
                foliosNonValid,
                foliosScanReconcilier,
                foliosNoScanReconcilier
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
 * Permet de recuperer la liste le details de volumes prez a etre archivez
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const getVolumeDetailsVolumeTraitesPretArchives = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
                ID_VOLUME: ID_VOLUME
            },
            include: [{
                model: Users,
                as: 'traitant',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER']
            }]
        })
        const foliosValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_VALIDE: 1,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef plateau de la volume",
            result: {
                ...chefPlateau.toJSON(),
                foliosValid
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
 * Permet de recuperer la liste le details de volumes non scanner et non valid
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const getVolumeDetailsVolumeNonScanNonValid = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const chefPlateau = await Etapes_volume_historiques.findOne({
            attributes: ['ID_VOLUME_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_VOLUME: ETAPES_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
                ID_VOLUME: ID_VOLUME
            },
            include: [{
                model: Users,
                as: 'traitant',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM', 'PHOTO_USER']
            }]
        })
        const foliosNonValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 1,
                IS_VALIDE: 0,
            },

        })
        const foliosNoScanReconcilier = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING,
                ID_VOLUME: ID_VOLUME,
                IS_RECONCILIE: 0,
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef plateau de la volume",
            result: {
                ...chefPlateau.toJSON(),
                foliosNonValid,
                foliosNoScanReconcilier
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
 * Permet de recuperer la liste des males disponible
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const getMalesDisponible = async (req, res) => {
    try {
        const mailles = await Maille.findAll({
            where: { IS_DISPO: 1 },
            attributes: ['ID_MAILLE', 'ID_AILE', 'NUMERO_MAILLE', 'IS_DISPO'],
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
 * Permet de recuperer la liste des agents dauperviseurs scannings
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findAgentAllSupAgentScanning = async (req, res) => {
    try {
        const distributeur = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs scannings",
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
 * Permet de recuper les volumes reenvoyez les volumes dans la phase scannings
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const retourAgentSupAileReenvoyezScan = async (req, res) => {
    try {
        const { ID_MAILLE, USER_TRAITEMENT, ID_VOLUME } = req.body
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
        const results = await Folio.findAll({
            where: {
                [Op.and]: [
                    {
                        ID_VOLUME: ID_VOLUME,
                    },
                    {
                        [Op.or]: [
                            { IS_RECONCILIE: 0 },
                            { IS_VALIDE: 0 }

                        ]
                    }
                ]
            },
            attributes: ['ID_FOLIO'],
        })
        const id_folios = results.map(folio => folio.ID_FOLIO)
        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
            ID_MALLE_NO_TRAITE: ID_MAILLE,
            IS_RECONCILIE: null,
            IS_VALIDE: null

        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: id_folios
                }
            }
        })
        const folio_historiques_reconcilier = id_folios.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        await Maille.update({
            IS_DISPO: 0
        }, {
            where: {
                ID_MAILLE: ID_MAILLE
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Modification est faites avec succes",

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
 * Permet de recuperer les volumes reenvoyez sup aille scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const renvoyezVoluSupAilleScanning = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()
        var condition = {}
        var conditionFolio = {}
        if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
            condition = {
                USER_TRAITEMENT: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
            }
            conditionFolio = {
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
            }
        }else if(user.ID_PROFIL == PROFILS.CHEF_PLATEAU_SCANNING){
            condition = {
                USER_TRAITEMENT: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
            }
            conditionFolio = {
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
            }
        }else if(user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_SCANNING){
            condition = {
                USER_TRAITEMENT: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
            }
            conditionFolio = {
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
            }
        }
        const result = await Etapes_folio_historiques.findAll({
            where: { ...condition },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_VOLUME', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: { ...conditionFolio },
                    include: [{
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME'],
                    },
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }]
                },
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                }]
        })
        var volumeFolios = []
        result.forEach(folio => {
            const ID_VOLUME = folio.folio.ID_VOLUME
            const volume = folio.folio.volume
            const date = folio.DATE_INSERTION
            const users = folio.traitement
            const maille = folio.folio.malleNonTraite
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
                    date,
                    users,
                    maille,
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
 * Permet d'envoyer le volumes reenvoyez chez un chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/04/2023
 * 
 */

const volumeChefPlateauReenvoyez = async (req, res) => {
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

       
        const results = await Folio.findAll({
            where: {
                [Op.and]: [
                    {
                        ID_VOLUME: ID_VOLUME,
                    },
                    {
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                    }
                ]
            },
            attributes: ['ID_FOLIO'],
        })
        const id_folios = results.map(folio => folio.ID_FOLIO)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: id_folios
                }
            }
        })
        const folio_historiques_reconcilier = id_folios.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)
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
 * Permet de recuperer les volumes reenvoyez attend retour sup aille scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const renvoyezVoluSupAilleScanningRetour = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()
        var condition = {}
        var conditionFolio = {}
        if (user.ID_PROFIL == PROFILS.AGENT_SUPERVISEUR_AILE_SCANNING) {
            condition = {
                USER_TRAITEMENT: req.userId,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
            }
            conditionFolio = {
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
            }
        }
        else if(user.ID_PROFIL == PROFILS.CHEF_PLATEAU_SCANNING){
            condition = {
                USER_TRAITEMENT: req.userId,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
            }
            conditionFolio = {
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
            }
        }
        const result = await Etapes_folio_historiques.findAll({
            where: { ...condition },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_VOLUME', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: { ...conditionFolio },
                    include: [{
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME'],
                    },
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }]
                },
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                }]
        })
        var volumeFolios = []
        result.forEach(folio => {
            const ID_VOLUME = folio.folio.ID_VOLUME
            const volume = folio.folio.volume
            const date = folio.DATE_INSERTION
            const users = folio.traitement
            const maille = folio.folio.malleNonTraite
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
                    date,
                    users,
                    maille,
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
 * Permet de faire la mise a jour des folios reenvoyez qu'un chef pleteau donnent a un agent superviseur scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const folioChefScanningReenvoyez = async (req, res) => {
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
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
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
 * Permet de recuperer les volumes reenvoyez sup aille scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const renvoyezVoluSupAilleScanningPlateau = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })
        const user = userObject.toJSON()
        var condition = {}
        var conditionFolio = {}
        if(user.ID_PROFIL == PROFILS.CHEF_PLATEAU_SCANNING){
            condition = {
                USER_TRAITEMENT: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
            }
            conditionFolio = {
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
            }
        }
        const result = await Etapes_folio_historiques.findAll({
            where: { ...condition },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_VOLUME', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: { ...conditionFolio },
                    include: [{
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME'],
                    },
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }]
                },
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                }]
        })
        var volumeFolios = []
        result.forEach(folio => {
            const ID_VOLUME = folio.folio.ID_VOLUME
            const volume = folio.folio.volume
            const date = folio.DATE_INSERTION
            const users = folio.traitement
            const maille = folio.folio.malleNonTraite
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
                    date,
                    users,
                    maille,
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
 * Permet de d'enregistrer les folios donner a une equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  3/08/2023
 * 
 */

const folioEquipeScanningReenvoyer = async (req, res) => {
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
                    required: "Le pv est obligatoire"
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
        // console.log(folioObjet)
        // folioObjet = folio
        await Promise.all(folioObjet.map(async (folio) => {
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.update(
                {
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                    ID_FOLIO_EQUIPE:USER_TRAITEMENT
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
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
 * Permet de recuperer la liste des folios par rapport a un agent connecter reenvoyez
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllAgentsFolioRetour = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING
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
            const ID_EQUIPE = user.folio.equipe.ID_EQUIPE
            const USERS_ID = user.USER_TRAITEMENT
            const folio = user.folio
            const equipe =  user.folio.equipe

            const isExists = UserFolios.find(vol => vol.ID_EQUIPE == ID_EQUIPE) ? true : false
            if (isExists) {
                const volume = UserFolios.find(vol => vol.ID_EQUIPE == ID_EQUIPE)
                const newVolumes = { ...volume, folios: [...volume.folios, folio] }
                UserFolios = UserFolios.map(vol => {
                    if (vol.ID_EQUIPE == ID_EQUIPE) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                UserFolios.push({
                    USERS_ID,
                    ID_EQUIPE,
                    equipe,
                    folios: [folio]
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
 * Permet de recuper les pvs d'un agent superviseur scanning signe avec une equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findGetsPvsAgentSupervieurReenvoyer = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de recuper les pvs d'un agent superviseur scanning signe avec une equipe scanning pour les folios reenvoyez
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const updateRetourEquipeFolioReenvoyez = async (req, res) => {
    try {
        const { ID_FOLIO, folio } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIO: {
                    required: true
                },
                folio: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIO: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
                folio: {
                    image: "folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(folio)
        const folio_reconcilier = folioObjet.map(folio => folio.ID_FOLIO)
        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER,
            IS_RECONCILIE: 1,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_reconcilier
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de recuperer la liste des folios d'un agent scanning reconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllFolioScannimgReconciliers = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                ID_ETAPE_FOLIO: {
                    [Op.and]: [
                        ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER
                    ]
                }
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
            const equipe =  histo.folio.equipe
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
                    equipe,
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
 * Permet de recuperer la liste des folios d'un agent scanning reconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllVolumerRetourReconcilierPret = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
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
                                ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER
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
 * Permet de recuper les pvs d'un chef plateau deja signer sur les folios dejs donnees
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  25/08/2023
 * 
 */

const findFoliosGetsPvsPlateauReenvoyez = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...pv.toJSON(),
                // pvRetour
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


const checkRetourChefPlateauCkeckReenvoyez = async (req, res) => {
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
                            [Op.and]: [
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER,]
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValid = async (req, res) => {
    try {
        const { ID_FOLIO, folio } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIO: {
                    required: true
                },
                folio: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIO: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
                folio: {
                    image: "folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(folio)
        const folio_reconcilier = folioObjet.map(folio => folio.folio.ID_FOLIO)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
            IS_VALIDE: 1
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_reconcilier
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.folio.ID_FOLIO,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de faire retourner le volumees deja traiter par chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyer = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuper les pvs d'un chef plateau signe avec agent superviseur scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findGetsPvsChefPlateauRetourOriginal = async (req, res) => {
    try {
        const { folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: req.userId
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de recuperer la liste des folios d'un agent scanning reconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllVolumerRetourReconcilierIsValid = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
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
                                ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
                                ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID
                            ]
                        }
                    },
                    include: [{
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME'],
                    },
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: false,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }]
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const volume = user.folio.volume
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
                    volume,
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
 * Permet de recuper les pvs d'un agents sup aille scanning deja signer sur les folios dejs donnees
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  5/09/2023
 * 
 */

const findFoliosGetsPvsPlateauReenvoyezPvsss = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
       

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValidTraiteAille = async (req, res) => {
    try {
        const { ID_FOLIOS } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIOS: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIOS: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(ID_FOLIOS)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folioObjet
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyerGetVolume = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuper les pvs d'un chef plateau signe avec agent superviseur aille scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findGetsPvsChefPlateauRetourOriginalAilleScann = async (req, res) => {
    try {
        const { folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: req.userId
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de recuperer la liste des folios d'un chef equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllVolumerRetourReconcilierPretEquipeChef = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
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
                                ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                                ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
                                ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
                                ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING
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
 * Permet de recuper les pvs d'un agents sup aille scanning deja signer sur les folios dejs donnees
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  5/09/2023
 * 
 */

const findFoliosGetsPvsPlateauReenvoyezChefequipePvsss = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
       

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValidTraiteChefEquipe = async (req, res) => {
    try {
        const { ID_FOLIOS } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIOS: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIOS: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(ID_FOLIOS)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folioObjet
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyerGetVolumeChefEquipe = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                                ETAPES_FOLIO.REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING,
                                ETAPES_FOLIO.REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER,
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,
                                ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuper les pvs d'un chef plateau signe avec agent superviseur aille scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  27/08/2023
 * 
 */

const findGetsPvsChefPlateauRetourOriginalEquipeScann = async (req, res) => {
    try {
        const { folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: req.userId
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "PVS agent superviseur",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de recuperer la liste le details de volumes che chef equipe scannings
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/09/2023
 * 
 */
const getVolumeDetailsVolumeTraitesChefEquiScanValidFolios = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const foliosValid = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_PREPARATION,
                ID_VOLUME: ID_VOLUME,
                IS_VALIDE: 1,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef plateau de la volume",
            result: {
                foliosValid
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
 * Permet de recuper les pvs d'un agents sup aille scanning deja signer sur les folios dejs donnees
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  5/09/2023
 * 
 */

const findFoliosGetsPvsPlateauReenvoyezPvsssFinal= async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
       

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValidTraiteAilleFinal = async (req, res) => {
    try {
        const { ID_FOLIOS } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIOS: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIOS: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(ID_FOLIOS)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folioObjet
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyerGetVolumeOriginal = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValidArchivagesDistr = async (req, res) => {
    try {
        const { ID_FOLIOS, USER_TRAITEMENT } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIOS: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIOS: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(ID_FOLIOS)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_CHEF_EQUIPE_SCANNING_AGENT_DISTRIBUTEUR_PREPARATION,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folioObjet
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_CHEF_EQUIPE_SCANNING_AGENT_DISTRIBUTEUR_PREPARATION,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de recuperer la liste des folios d'un agent scanning reconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllVolumerRetourReconcilierPretArchives = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_CHEF_EQUIPE_SCANNING_AGENT_DISTRIBUTEUR_PREPARATION,
            },
            attributes: ['ID_FOLIO_HISTORIQUE','ID_USER', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            include: [
                {
                    model: Users,
                    as: 'user',
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
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_CHEF_EQUIPE_SCANNING_AGENT_DISTRIBUTEUR_PREPARATION,
                            ]
                        }
                    },
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.user.toJSON()
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
 * Permet de recuper les pvs d'un agents sup aille scanning deja signer sur les folios dejs donnees
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  5/09/2023
 * 
 */

const findFoliosGetsPvsPlateauReenvoyezPvArchivages= async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
       

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_CHEF_EQUIPE_SCANNING_AGENT_DISTRIBUTEUR_PREPARATION,
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...pv.toJSON(),
                // pvRetour
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValidArchivagesArchiv = async (req, res) => {
    try {
        const { ID_FOLIOS, USER_TRAITEMENT } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIOS: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIOS: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(ID_FOLIOS)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folioObjet
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyerOri = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuperer la liste des folios d'un agent scanning reconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllVolumerRetourReconcilierArchivv = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES,
            },
            attributes: ['ID_FOLIO_HISTORIQUE','ID_USER', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            include: [
                {
                    model: Users,
                    as: 'user',
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
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES,
                            ]
                        }
                    },
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.user.toJSON()
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
 * Permet de faire signer un pv agent un scanning et le chef plateau
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */


const updateRetourPlateauSupReenvoyezValidArchivagesDesarchivages = async (req, res) => {
    try {
        const { ID_FOLIOS, USER_TRAITEMENT } = req.body
        const PV = req.files?.PV
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                ID_FOLIOS: {
                    required: true
                },
                PV: {
                    required: true,
                    image: 21000000
                }
            },
            {
                ID_FOLIOS: {
                    image: "Id_folio est inavlide",
                    required: "Le pv est obligatoire"
                },
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
        folioObjet = JSON.parse(ID_FOLIOS)

        await Folio.update({
            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folioObjet
                }
            }
        })
        const folio_historiques_reconcilier = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION,
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_reconcilier)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio scan reconcilier",
            // result: FlashFolios
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyerOriFinArchives = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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
 * Permet de recuperer la liste des folios d'un agent scanning reconcilier
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const findAllVolumerRetourReconcilierArchivvFiniti = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION,
            },
            attributes: ['ID_FOLIO_HISTORIQUE','ID_USER', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            include: [
                {
                    model: Users,
                    as: 'user',
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
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION,
                            ]
                        }
                    },
                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.user.toJSON()
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
 * Permet de d'enregistrer les folios donner a une equipe scanning
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  3/08/2023
 * 
 */

const folioEquipeScanningReenvoyerNiceArchivees = async (req, res) => {
    try {
        const {
            folio
        } = req.body;
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.update(
                {
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_IS_BIEN_ARCHIVES,
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_IS_BIEN_ARCHIVES,
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */
const findAllVolumePlateauChefTraitesReenvoyerOriFinArchivesGGG = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_IS_BIEN_ARCHIVES,
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO', 'DATE_INSERTION', 'PV_PATH'],
            order: [
                ["DATE_INSERTION", "DESC"]
            ],
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
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'IS_RECONCILIE', 'IS_VALIDE'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.and]: [
                                ETAPES_FOLIO.RETOUR_IS_BIEN_ARCHIVES,
                            ]
                        }
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

                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
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
            message: "Liste des folio donnees",
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

const findAllVolumeSupAilleScanningAllVolumeNice = async (req, res) => {
    try {
        const userObject = await Users.findOne({
            where: { USERS_ID: req.userId },
            attributes: ['ID_PROFIL', 'USERS_ID']
        })

        const user = userObject.toJSON()
        var condition = {}
        condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES, USER_TRAITEMENT: req.userId }

        const result = await Etapes_volume_historiques.findAll({
            attributes: ['ID_VOLUME_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION'],
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
                }]

        })
        const allVolume = []
        const volume = await Promise.all(result?.map(async resObject => {
            const util = resObject.toJSON()
            const folios = await Folio.findAll({
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'NUMERO_FOLIO'],
                where: {
                    [Op.and]: [{
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
                    }, {
                        ID_VOLUME: util.volume.ID_VOLUME
                    }]
                },
            })
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
            message: "Liste des volumes",
            result: allVolume
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const checkRetourChefEquipeReenvoyezHHH = async (req, res) => {
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
                            [Op.and]: [
                                ETAPES_FOLIO.REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING,]
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
 * Permet de faire retourner le volumees deja traiter par agent superviseur aile
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  4/09/2023
 * 
 */

const checkRetourChefEquipeReenvoyezSupGGG = async (req, res) => {
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
                            [Op.and]: [
                                ETAPES_FOLIO.REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID,]
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
    findAllVolumerEnvoyerScanning,
    findFoliosGetsPvsPlateau,
    checkRetourChefPlateau,
    getFoliosAll,
    findGetsPvsAgentSupervieur,
    checkRetourAgentSupScann,
    updateRetourPlateauSup,
    findAllVolumerRetourAgentSupeArchives,
    findAllVolumerRetourDesarchivages,
    findAllVolumePlateauChef,
    findAllVolumePlateauChefTraites,
    findGetsPvsChefPlateauRetour,
    findAllVolumeSupAileScanningTraites,
    findGetsPvsSupAilleScanRetour,
    findAllVolumeChefEquipScanningTraites,
    findAllVolumeAgentDistributeurTraites,
    findAllVolumeAgenSupArchivesTraites,
    volumeArchivesAgentDesarchivages,
    findAllVolumeAgenDesarchivagesTraites,
    findAllVolumeChefEquipePrepqrqtionTraites,
    findAllVolumePlateauChefNonValide,
    findAllVolumePlateauChefNonValideRetour,
    findGetsPvsAgentSupervieurRetourNonValid,
    findVolumeAssocierAgentsupAilleScan,
    retourAgentSupAile,
    getFoliosAllRetourner,
    getFoliosAllRetournernotValid,
    getVolumeDetailsVolume,
    getVolumeDetailsVolumeTraitesSup,
    getVolumeDetailsVolumeTraitesChefEquiScan,
    getVolumeDetailsVolumeTraitesPretArchives,
    getVolumeDetailsVolumeNonScanNonValid,
    getMalesDisponible,
    findAgentAllSupAgentScanning,
    retourAgentSupAileReenvoyezScan,
    renvoyezVoluSupAilleScanning,
    volumeChefPlateauReenvoyez,
    renvoyezVoluSupAilleScanningRetour,
    folioChefScanningReenvoyez,
    renvoyezVoluSupAilleScanningPlateau,
    folioEquipeScanningReenvoyer,
    findAllAgentsFolioRetour,
    findGetsPvsAgentSupervieurReenvoyer,
    updateRetourEquipeFolioReenvoyez,
    findAllFolioScannimgReconciliers,
    findAllVolumerRetourReconcilierPret,
    findFoliosGetsPvsPlateauReenvoyez,
    checkRetourChefPlateauCkeckReenvoyez,
    updateRetourPlateauSupReenvoyezValid,
    findAllVolumePlateauChefTraitesReenvoyer,
    findGetsPvsChefPlateauRetourOriginal,
    findAllVolumerRetourReconcilierIsValid,
    findFoliosGetsPvsPlateauReenvoyezPvsss,
    updateRetourPlateauSupReenvoyezValidTraiteAille,
    findAllVolumePlateauChefTraitesReenvoyerGetVolume,
    findGetsPvsChefPlateauRetourOriginalAilleScann,
    findAllVolumerRetourReconcilierPretEquipeChef,
    findFoliosGetsPvsPlateauReenvoyezChefequipePvsss,
    updateRetourPlateauSupReenvoyezValidTraiteChefEquipe,
    findAllVolumePlateauChefTraitesReenvoyerGetVolumeChefEquipe,
    findGetsPvsChefPlateauRetourOriginalEquipeScann,
    getVolumeDetailsVolumeTraitesChefEquiScanValidFolios,
    findFoliosGetsPvsPlateauReenvoyezPvsssFinal,
    updateRetourPlateauSupReenvoyezValidTraiteAilleFinal,
    findAllVolumePlateauChefTraitesReenvoyerGetVolumeOriginal,
    updateRetourPlateauSupReenvoyezValidArchivagesDistr,
    findAllVolumerRetourReconcilierPretArchives,
    findFoliosGetsPvsPlateauReenvoyezPvArchivages,
    updateRetourPlateauSupReenvoyezValidArchivagesArchiv,
    findAllVolumePlateauChefTraitesReenvoyerOri,
    findAllVolumerRetourReconcilierArchivv,
    updateRetourPlateauSupReenvoyezValidArchivagesDesarchivages,
    findAllVolumePlateauChefTraitesReenvoyerOriFinArchives,
    findAllVolumerRetourReconcilierArchivvFiniti,
    folioEquipeScanningReenvoyerNiceArchivees,
    findAllVolumePlateauChefTraitesReenvoyerOriFinArchivesGGG,
    findAllVolumeSupAilleScanningAllVolumeNice,
    checkRetourChefEquipeReenvoyezHHH,
    checkRetourChefEquipeReenvoyezSupGGG
    
}
