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
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques');
const Users = require('../../models/Users');
const ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const PROFILS = require('../../constants/PROFILS');
const Nature_folio = require('../../models/Nature_folio');
const Folio = require('../../models/Folio');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');

const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');
const DossiersUpload = require('../../class/uploads/DossiersUpload');
const { Op } = require('sequelize');
const Volume = require('../../models/Volume');
const IDS_ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const Maille = require('../../models/Maille');
const Etapes_folio = require('../../models/Etapes_folio');
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
            const CODE_REFERENCE = `${req.userId}${moment().get("s")}`
            const folioInsert = await Folio.create({
                ID_VOLUME: ID_VOLUME,
                NUMERO_FOLIO: folio.NUMERO_DOSSIER,
                FOLIO: folio.NUMERO_FOLIO,
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
 * Permet de afficher tous FOLIO NO  TRAITE
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 4/09/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllFolioNoTraite = async (req, res) => {
    try {
        const { ID_MAILLE } = req.params
        const result = await Folio.findAll({
            attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'NUMERO_FOLIO'],
            where: {
                ID_MALLE_NO_TRAITE: ID_MAILLE, ID_ETAPE_FOLIO: ETAPES_FOLIO.AGENT_SUP_AILE_SELECT_CHEF_PLATEAU
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
 * Permet de afficher tous volume pour  chef equipe preparation
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 2/09/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllFolioEquipe = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const etapes = await Volume.findOne(
            {
                attributes: ['ID_ETAPE_VOLUME'],
                where: {
                    ID_VOLUME: ID_VOLUME
                },
            }
        )
        const etapesIds = etapes.toJSON()
        if (etapesIds.ID_ETAPE_VOLUME == 18) {
            const result = await Folio.findAll({
                attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO'],
                where: {
                    ID_VOLUME: ID_VOLUME
                },
            })
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Liste des folios no prepare",
                result: result
            })
        }
        else {
            const result = await Folio.findAll({
                attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO'],
                where: {
                    ID_VOLUME: ID_VOLUME,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_CHEF_EQUIPE_SELECT_AGENT_SUP_AILE
                },
            })
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Liste des folios",
                result: result
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
 * Permet de afficher tous volume pour  chef equipe preparation
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 2/09/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllFolioEquipeNoPrepare = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const result = await Folio.findAll({
            attributes: ['ID_FOLIO', 'ID_VOLUME', 'CODE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO'],
            where: {
                ID_VOLUME: ID_VOLUME,
                IS_PREPARE: 0
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios no prepare",
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
 * Permet permet  de nommer  agent superviseur  Preparation
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 02/08/2023
 */
const renommerSuperviseurPreparation = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folio, ID_MAILLE_NO_TRAITE } = req.body
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION
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
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION
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
 * Permet permet  de renommer  agent  Preparation
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author NDAYISABA Claudine <claudine@mdiabox.bi>
 * @date 03/09/2023
 */
const renommerAgentPreparation = async (req, res) => {
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
                ID_ETAPE_FOLIO: ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION
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
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION
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
        const { AGENT_PREPARATION, folio, folioPrepare, ID_MAILLE_NO_TRAITE } = req.body
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
        var folioPrepareObjet = {}
        folioPrepareObjet = JSON.parse(folioPrepare)
        if (ID_MAILLE_NO_TRAITE) {
            await Promise.all(folioObjet.map(async (folio) => {
                const results = await Folio.update({
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                    IS_PREPARE: 0
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
                        USER_TRAITEMENT: AGENT_PREPARATION,
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION
                    }
                )
            }))
            await Promise.all(folioPrepareObjet.map(async (folio) => {
                const results = await Folio.update({
                    IS_PREPARE: 1
                }, {
                    where: {
                        ID_FOLIO: folio.ID_FOLIO,
                    }
                })
            }))
        }
        else {
            await Promise.all(folioObjet.map(async (folio) => {
                const results = await Folio.update({
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                    IS_PREPARE: 0
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
                        USER_TRAITEMENT: AGENT_PREPARATION,
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP
                    }
                )
            }))
            await Promise.all(folioPrepareObjet.map(async (folio) => {
                const results = await Folio.update({
                    IS_PREPARE: 1
                }, {
                    where: {
                        ID_FOLIO: folio.ID_FOLIO,
                    }
                })
            }))
        }
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
        const folio_ids = folioObjet?.map(folio => folio.ID_FOLIO)
        const malle = await Folio.findAll({
            attributes: ['ID_MALLE_NO_TRAITE'],
            where: {
                [Op.and]: [
                    {
                        ID_FOLIO: {
                            [Op.in]: folio_ids

                        }
                    },
                    {
                        ID_MALLE_NO_TRAITE: { [Op.not]: null }

                    }
                ]
            }
        })
        if (malle.length > 0) {
            await Promise.all(folioObjet.map(async (folio) => {
                const results = await Folio.update({
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION
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
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION
                    }
                )
            }))
        }
        else {
            await Promise.all(folioObjet.map(async (folio) => {
                const results = await Folio.update({
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
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
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
                    }
                )
            }))
        }

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
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
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
                    include: {
                        model: Volume,
                        as: 'volume',
                        required: false,
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME'],
                    }
                }]
        })
        var volumeFolios = []
        result.forEach(folio => {
            const ID_VOLUME = folio.folio.ID_VOLUME
            const volume = folio.folio.volume
            const date = folio.DATE_INSERTION
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
 * Permet de afficher tous volume d'un  chef  plateau
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 24/08/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAllFolioChefPlateau = async (req, res) => {
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
        condition = { '$volume.ID_ETAPE_VOLUME$': ETAPES_VOLUME.CHOIX_CHEF_PLATAEU, USER_TRAITEMENT: req.userId }

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
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO'],
                where: {
                    [Op.and]: [{
                        ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_ENREG
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
            message: "Liste des volume",
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
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
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
            message: "Liste des volumes",
            result: PvFolios
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
 * @date  4/09/2023
 * 
 */
const findAllAgentRetourne = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
            },
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                                ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                            ]
                        }
                    },
                    include: {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: true,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }
                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
            const date = histo.DATE_INSERTION
            const mailleNoTraite = histo.folio.malleNonTraite
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
                    mailleNoTraite,
                    folios: [folio]
                })
            }



        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result: PvFolios
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
                '$folio.ID_ETAPE_FOLIO$': {
                    [Op.in]: [
                        ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                        //  ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                    ]
                },
                ID_ETAPE_FOLIO: {
                    [Op.in]: [
                        ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                        //  ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                    ]
                }

            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        IS_PREPARE: 1,
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
 * @date  4/09/2023
 * 
 */
const findAllAgentsRetourne = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        IS_PREPARE: 1,
                    },
                    include: {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: true,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }

                }
            ]
        })
        var UserFolios = []
        result.forEach(user => {
            const USERS_ID = user.traitement?.USERS_ID
            const users = user.traitement
            const mailleNoTraite = user.folio.malleNonTraite
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
                    mailleNoTraite,
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
 * Une route  permet  les agents superviseur 
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
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'USER_TRAITEMENT', 'DATE_INSERTION'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [ETAPES_FOLIO.SELECTION_AGENT_SUP,
                            ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                            ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                            ETAPES_FOLIO.ADD_DETAILLER_FOLIO,
                            ]
                        }
                    }
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
            message: "Liste des pvs",
            result: PvFolios
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
 * Une route  permet  les agents superviseur 
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllSuperviseurRetourPhase = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            ETAPES_FOLIO.CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION,
                            ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                            ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                            ETAPES_FOLIO.ADD_DETAILLER_FOLIO,
                        ]
                    }

                }]
            },
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'USER_TRAITEMENT', 'DATE_INSERTION'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: true,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                ETAPES_FOLIO.CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION,
                                ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                                ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                                ETAPES_FOLIO.ADD_DETAILLER_FOLIO,
                            ]
                        }
                    },
                    include: {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: true,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }
                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
            const date = histo.DATE_INSERTION
            const mailleNoTraite = histo.folio.malleNonTraite
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
                    mailleNoTraite,
                    folios: [folio]
                })
            }



        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des pvs",
            result: PvFolios
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
 * Une route  permet  un agents superviseur valides
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllSuperviseursValides = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', "PV_PATH", 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
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
            message: "Liste des pvs retours",
            result: PvFolios
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
 * Une route  permet  un agents superviseur revalides
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllSuperviseursReValides = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', "PV_PATH", 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
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
            message: "Liste des pvs retours",
            result: PvFolios
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
 * Une route  permet  un agents superviseur revalides
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllChefPlateauReValides = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_SELECT_CHEF_PLATEAU
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', "PV_PATH", 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
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
            message: "Liste des pvs retours",
            result: PvFolios
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
 * Une route  permet  un agents superviseur revalides
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllAgentReValides = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_CHEF_EQUIPE_SELECT_AGENT_SUP_AILE
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', "PV_PATH", 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_CHEF_EQUIPE_SELECT_AGENT_SUP_AILE
                    },
                    include: [{
                        model: Volume,
                        as: 'volume',
                        attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    },
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: true,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }
                    ]
                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
            const date = histo.DATE_INSERTION
            const volume = histo.folio.volume
            const mailleNoTraite = histo.folio.malleNonTraite
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
                    volume,
                    mailleNoTraite,
                    folios: [folio]
                })
            }



        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des pvs retours",
            result: PvFolios
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
 * Une route  permet  un agents superviseur revalides
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const findAllAgentRetraites = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING
                }]
            },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', "PV_PATH", 'DATE_INSERTION'],
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: true,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'IS_PREPARE', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    include: [{
                        model: Volume,
                        as: 'volume',
                        attributes: ['ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'NOMBRE_DOSSIER', 'USERS_ID', 'ID_MALLE', 'ID_ETAPE_VOLUME'],
                    },
                    {
                        model: Maille,
                        as: 'malleNonTraite',
                        required: true,
                        attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
                    }
                    ]
                }
            ]
        })
        var PvFolios = []
        result.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
            const users = histo.traitement
            const date = histo.DATE_INSERTION
            const volume = histo.folio.volume
            const mailleNoTraite = histo.folio.malleNonTraite
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
                    volume,
                    mailleNoTraite,
                    folios: [folio]
                })
            }



        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des pvs retours",
            result: PvFolios
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
        const { USERS_ID,
            folioIds
        } = req.body
        const IdsObjet = JSON.parse(folioIds)
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
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],

                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: {
                                [Op.in]: [
                                    ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                                    ETAPES_FOLIO.ADD_DETAILLER_FOLIO]
                            }
                        }, {
                            ID_FOLIO: {
                                [Op.in]: IdsObjet
                            }
                        },]
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
const checkAgentsupDetails = async (req, res) => {
    try {
        const { USERS_ID,
            folioIds
        } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const result = await  Folio.findAll(
            {
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        [Op.and]: [{
                            IS_PREPARE: 1,
                            NOM_PROPRIETAIRE:null
                        }, {
                            ID_FOLIO: {
                                [Op.in]: IdsObjet
                            }
                        },]
                    }
                }
          )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result: result
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
const checkPlateau = async (req, res) => {
    try {
        const { ID_VOLUME} = req.body
        const result = await  Folio.findAll( {
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
                        }]
                    },
                    include: [{
                        model: Volume,
                        as: 'volume',
                        required: true,
                        attributes: ["ID_VOLUME","NOMBRE_DOSSIER"],
                        where:{
                            ID_VOLUME:ID_VOLUME
                        }
        
                    }]
                },
               
          )
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes",
            result: result
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
 * Une route  permet  un  chef equipe 
 * de voir  les si il temps de faire retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const checkAgentsupAile = async (req, res) => {
    try {
        const { USERS_ID,
            folioIds
        } = req.body
        const IdsObjet = JSON.parse(folioIds)
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
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],

                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: {
                                [Op.in]: [
                                    ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_SELECT_CHEF_PLATEAU,
                                ]
                            }
                        }, {

                            ID_FOLIO: {
                                [Op.in]: IdsObjet
                            }
                        },]
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
 * Une route  permet  un  agent  super  aile 
 * de voir  les si il temps de faire retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  16/07/2023
 * 
 */
const checkAgentsuper = async (req, res) => {
    try {
        const { USERS_ID,
            folioIds
        } = req.body
        const IdsObjet = JSON.parse(folioIds)
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
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],

                    where: {
                        [Op.and]: [{
                            ID_ETAPE_FOLIO: {
                                [Op.in]: [
                                    ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION,
                                ]
                            }
                        }, {

                            ID_FOLIO: {
                                [Op.in]: IdsObjet
                            }
                        },]
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
            ID_FOLIO,
            ID_MAILLE_NO_TRAITE

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
                PHOTO_DOSSIER: filename_dossiers ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.dossiers}/${filename_dossiers.fileName}` : null,
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
const getPvs = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [
                {
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP,
                            IDS_ETAPES_FOLIO.CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION,
                        ]
                    }
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
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
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
                pvRetour
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
const getPvsAgentPREPARATION = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const pv = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],

            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                            IDS_ETAPES_FOLIO.AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                        ]
                    }
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "IS_PREPARE", "ID_NATURE", "FOLIO"],

            }]

        })
        var PvFolios = []
        pv.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
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
                    date,
                    folios: [folio]
                })
            }



        })
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                            IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                        ]
                    }
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
        var foliosPrepares = []
        var foliosNoPrepare = []

        if (pvRetour) {
            foliosPrepares = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 1
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })

            foliosNoPrepare = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 0
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...PvFolios[0],
                pvRetour,
                foliosPrepares,
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
const getPvsAgentSuperviseur = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const pv = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],

            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "IS_PREPARE", "ID_NATURE", "FOLIO"],

            }]

        })
        var PvFolios = []
        pv.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
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
                    date,
                    folios: [folio]
                })
            }



        })
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR__AGENT_SUP_V_CHEF_PLATEAU,
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
        var foliosPrepares = []
        var foliosNoPrepare = []

        if (pvRetour) {
            foliosPrepares = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 1
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })

            foliosNoPrepare = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 0
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...PvFolios[0],
                pvRetour,
                foliosPrepares,
                foliosNoPrepare

            }
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
const getPvsAgentSupRetour = async (req, res) => {
    try {
        const { AGENT_SUPERVISEUR, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const pv = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],

            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUPERVISEUR
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "IS_PREPARE", "ID_NATURE", "FOLIO"],

            }]

        })
        var PvFolios = []
        pv.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
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
                    date,
                    folios: [folio]
                })
            }



        })
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION,
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
        var foliosPrepares = []
        var foliosNoPrepare = []

        if (pvRetour) {
            foliosPrepares = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 1
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })

            foliosNoPrepare = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 0
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...PvFolios[0],
                pvRetour,
                foliosPrepares,
                foliosNoPrepare

            }
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
const getPvsChefPlateau = async (req, res) => {
    try {
        const { CHEF_PLATEAU, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const pv = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],

            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.AGENT_SUP_AILE_SELECT_CHEF_PLATEAU,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: CHEF_PLATEAU
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "IS_PREPARE", "ID_NATURE", "FOLIO"],

            }]

        })
        var PvFolios = []
        pv.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
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
                    date,
                    folios: [folio]
                })
            }



        })
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_SELECT_CHEF_PLATEAU,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: CHEF_PLATEAU
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }
        })
        var foliosPrepares = []
        var foliosNoPrepare = []

        if (pvRetour) {
            foliosPrepares = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 1
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })

            foliosNoPrepare = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 0
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...PvFolios[0],
                pvRetour,
                foliosPrepares,
                foliosNoPrepare

            }
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
const getPvsAgentSupAile = async (req, res) => {
    try {
        const { AGENT_SUP_AILE, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const pv = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],

            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUP_AILE
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "IS_PREPARE", "ID_NATURE", "FOLIO"],

            }]

        })
        var PvFolios = []
        pv.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const folio = histo.folio
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
                    date,
                    folios: [folio]
                })
            }



        })
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_SUP_AILE
                }, {
                    ID_FOLIO: {
                        [Op.in]: IdsObjet
                    }
                }]
            }
        })
        var foliosPrepares = []
        var foliosNoPrepare = []

        if (pvRetour) {
            foliosPrepares = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 1
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })

            foliosNoPrepare = await Folio.findAll({
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                where: {
                    [Op.and]: [{
                        IS_PREPARE: 0
                    },
                        , {
                        ID_FOLIO: {
                            [Op.in]: IdsObjet
                        }
                    }]
                }
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef platteau de la volume",
            result: {
                ...PvFolios[0],
                pvRetour,
                foliosPrepares,
                foliosNoPrepare

            }
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
 * Une route  permet  les  agents de preparation et  leurs folio  prepare et  non prepare
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  22/08/2023
 * 
 */
const findAllFolioPrepare = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: {
                ID_USER: req.userId,
                USER_TRAITEMENT: { [Op.not]: req.userId },
                ID_ETAPE_FOLIO: {
                    [Op.in]: [
                        IDS_ETAPES_FOLIO.ADD_DETAILLER_FOLIO,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION,
                    ]
                }
            },
            order: [
                ['DATE_INSERTION', 'DESC']
            ],
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            include: [
                {
                    model: Users,
                    as: 'traitement',
                    required: true,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],

                },
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO'],
                    where: {
                        IS_PREPARE: { [Op.in]: [1, 0] },
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
            message: "Liste des folios prépare et  non  prépare",
            result: PvFolios
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
const getAgentDetail = async (req, res) => {
    try {
        const { USERS_ID } = req.params
        const agent = (
            await Etapes_folio_historiques.findOne({
                attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
                where: {
                    USER_TRAITEMENT: USERS_ID,
                    ID_USER: req.userId,
                    USER_TRAITEMENT: { [Op.not]: req.userId },
                    '$folio.ID_ETAPE_FOLIO$': {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.ADD_DETAILLER_FOLIO,
                            IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                        ]
                    },
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.ADD_DETAILLER_FOLIO,
                            IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                        ]
                    }


                },
                include: [{
                    model: Folio,
                    as: 'folio',
                    required: false,
                    attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"]
                }]
            })).toJSON()

        const agentPreparation = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    USER_TRAITEMENT: USERS_ID,
                    ID_USER: req.userId,
                    USER_TRAITEMENT: { [Op.not]: req.userId },
                    '$folio.ID_ETAPE_FOLIO$': {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                        ]
                    },
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                        ]
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],

            }]
        })
        const agentPreparationRetour =
            await Etapes_folio_historiques.findOne({
                attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
                where: {
                    [Op.and]: [{
                        USER_TRAITEMENT: USERS_ID,
                        ID_USER: req.userId,
                        USER_TRAITEMENT: { [Op.not]: req.userId },
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                            ]
                        }
                    }]
                },

            })
        var foliosPrepares = []
        if (agentPreparationRetour) {
            foliosPrepares = await Etapes_folio_historiques.findOne({
                attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
                where: {
                    [Op.and]: [{
                        USER_TRAITEMENT: USERS_ID,
                        ID_USER: req.userId,
                        USER_TRAITEMENT: { [Op.not]: req.userId },
                        '$folio.ID_ETAPE_FOLIO$': {
                            [Op.in]: [
                                IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                            ]
                        },
                        ID_ETAPE_FOLIO: {
                            [Op.in]: [
                                IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                            ]
                        }
                    }]
                },
                include: [{
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "FOLIO"],
                    where: {
                        [Op.and]: [{
                            IS_PREPARE: 1
                        }]
                    }
                }]
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Detail d'un flash",
            result: {
                ...agent,
                agentPreparation,
                agentPreparationRetour,
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
    nbre,
    getPvs,
    findAllFolioPrepare,
    getAgentDetail,
    getPvsAgentPREPARATION,
    findAllSuperviseursValides,
    getPvsAgentSuperviseur,
    findAllFolioChefPlateau,
    findAllFolioEquipe,
    findAllFolioEquipeNoPrepare,
    findAllFolioNoTraite,
    renommerSuperviseurPreparation,
    findAllSuperviseurRetourPhase,
    renommerAgentPreparation,
    findAllAgentRetourne,
    findAllAgentsRetourne,
    findAllSuperviseursReValides,
    findAllChefPlateauReValides,
    getPvsChefPlateau,
    findAllAgentReValides,
    findAllAgentRetraites,
    getPvsAgentSupAile,
    checkAgentsupAile,
    checkAgentsuper,
    getPvsAgentSupRetour,
    checkAgentsupDetails,
    checkPlateau
}