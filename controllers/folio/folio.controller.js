const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const folio_model = require('../../models/folio/folio.model');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const Folio = require('../../models/Folio');
const Users = require('../../models/Users');
const Affectation_users = require('../../models/User_ailes');
const ExecQuery = require('../../models/ExecQuery');

const Aile = require('../../models/Aile');
const { excludedProperties } = require('juice');
const Batiment = require('../../models/Batiment');
const Nature_folio = require('../../models/Nature_folio');
const Folio_pv = require('../../models/Folio_pv');
const Folio_aile_preparation = require('../../models/Folio_aile_preparation');
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques');
const Folio_aile_agent_preparation = require('../../models/Folio_aile_agent_preparation');
const Volume = require('../../models/volume');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');
const DossiersUpload = require('../../class/uploads/DossiersUpload');
/**
 * Permet de recuperer les folio par un agent  superviseur  phase preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const findById = async (req, res) => {
    try {
        var requete = `
        SELECT F.ID_FOLIO,
            F.ID_VOLUME,
            F.NUMERO_FOLIO,
            F.CODE_FOLIO,
            FAP.DATE_INSERTION
        FROM folio F
            LEFT JOIN folio_aile_preparation FAP ON FAP.ID_FOLIO_AILE_PREPARATION = F.ID_FOLIO_AILE_PREPARATION
            LEFT JOIN user_ailes UA ON UA.ID_USER_AILE = FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION
        WHERE UA.USERS_ID= ${req.userId} `
        const [folio] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios",
            result: folio
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
 * Permet de recuperer  tous folio
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAll = async (req, res) => {
    try {
        var results = (await folio_model.findAll());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios",
            result: results
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
 * Permet de recuperer  tous folio d'un  volume
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 17/07/2023
 * 
 */
const findAlls = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        var results = (await Folio.findAll(
            {
                where: {
                    ID_VOLUME: ID_VOLUME,
                    ID_FOLIO_AILE_PREPARATION: null
                }
            }
        ));
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios",
            result: results
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
 * Permet recuperer  nature du folio
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findNature = async (req, res) => {
    try {
        var results = (await Nature_folio.findAll());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les nature du folio",
            result: results
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
 * Permet recuperer  les mailles
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findMaille = async (req, res) => {
    try {
        var [results] = (await folio_model.findMaille());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les mailles",
            result: results
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
 * Permet recuperer  les batiments
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findBatiment = async (req, res) => {
    try {
        var results = (await Batiment.findAll());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les batiments",
            result: results
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
 * Permet recuperer  les ailes de chaque batiment
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAile = async (req, res) => {
    try {
        const { ID_BATIMENT } = req.params

        var results = await Aile.findAll({
            where: {
                ID_BATIMENT: ID_BATIMENT
            }
        });
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les ailes",
            result: results
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
 * Permet recuperer agent  distributeur par  ailes
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAgentDistributeurAile = async (req, res) => {
    try {
        const { ID_AILE } = req.params
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${ID_AILE} AND  u.ID_PROFIL=29 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les agents de distribution",
            result: results
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
 * Permet recuperer  agent  superviseur aile par  ailes
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAgentSuperviseur = async (req, res) => {
    try {
        var reque = `
        SELECT au.ID_AILE FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE u.USERS_ID=${req.userId} `
        const [user] = await ExecQuery.readRequete(reque)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=7 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les agents superviseur aile",
            result: results
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
 * Permet recuperer  agent  superviseur phase preparation par  ailes
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 17/07/2023
 * 
 */
const findAgentPreparation = async (req, res) => {
    try {
        var reque = `
        SELECT au.ID_AILE FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE u.USERS_ID=${req.userId} `
        const [user] = await ExecQuery.readRequete(reque)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=8 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les agents superviseur phase  preparation",
            result: results
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
 * Permet recuperer  agent   preparation par  ailes
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 17/07/2023
 * 
 */
const findAgentsPreparation = async (req, res) => {
    try {
        var reque = `
        SELECT au.ID_AILE FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE u.USERS_ID=${req.userId} `
        const [user] = await ExecQuery.readRequete(reque)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=22 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les agents preparations",
            result: results
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
 * Permet recuperer  chef plateau par  ailes
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 17/07/2023
 * 
 */
const findChefPlateau = async (req, res) => {
    try {
        var reque = `
        SELECT au.ID_AILE FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE u.USERS_ID=${req.userId} `
        const [user] = await ExecQuery.readRequete(reque)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=15 AND au.IS_ACTIF=1`
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les chefs de plateau phase de preparations",
            result: results
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
 * Permet d'inserer les folio dans la base
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const createFalio = async (req, res) => {
    try {
        const {
            ID_VOLUME,
            folio,
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
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        const histo = await Folio_pv.create(
            {
                PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                USERS_ID: req.userId
            }
        )
        const histoPv = histo.toJSON()
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        // folioObjet = folio
        await Promise.all(folioObjet.map(async (folio) => {
            const CODE_REFERENCE = `${folio.NUMERO_FOLIO}${req.userId}${moment().get("s")}`
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.create(
                {
                    ID_VOLUME: ID_VOLUME,
                    ID_NATURE: folio.ID_NATURE,
                    NUMERO_FOLIO: folio.NUMERO_FOLIO,
                    CODE_FOLIO: CODE_REFERENCE,
                    NUMERO_DOSSIERS: folio.NUMERO_DOSSIERS,
                    ID_USERS: req.userId,
                    ID_FOLIO_PV: histoPv.ID_FOLIO_PV,
                    ID_ETAPE_FOLIO: 1
                }
            )
        }))
        const results = await Volume.update({
            ID_ETAPE_VOLUME: 3,
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: req.userId,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: 3
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Insertion faite  avec succès",
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
 * Permet  de nommer  un agent  superviseur  
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  15/07/2023
 * 
 */
const superviser = async (req, res) => {
    try {
        const {
            folio,
            AGENT_SUPERVISEUR
        } = req.body;
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
                    required: "AGENT_SUPERVISEUR est obligatoire",
                },
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
        const histo = await Folio_aile_preparation.create(
            {
                ID_USER_AILE_SUPERVISEUR_PREPARATION: AGENT_SUPERVISEUR,
                PATH_PV_SUPERVISEUR_PREPARATION: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                ID_ETAPE_FOLIO: 1
            }
        )
        const histoPv = histo.toJSON()
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        // folioObjet = folio

        await Promise.all(folioObjet.map(async (folio) => {
            await Folio.update(
                {
                    ID_FOLIO_AILE_PREPARATION: histoPv.ID_FOLIO_AILE_PREPARATION,
                }, {
                where: {
                    ID_FOLIO: folio.ID_FOLIO
                }
            })
        }))
        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: histoPv.ID_FOLIO_AILE_PREPARATION,
            ID_ETAPE_FOLIO: 1
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Modification faite  avec succès",
            result: histoPv
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
const preparation = async (req, res) => {
    try {
        const {
            folio,
            AGENT_PREPARATION
        } = req.body;
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                AGENT_PREPARATION: {
                    required: true,
                },
                folio: {
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
                folio: {
                    required: "folio est obligatoire"
                },
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
        const histo = await Folio_aile_agent_preparation.create(
            {
                ID_USER_AILE_AGENT_PREPARATION: AGENT_PREPARATION,
                PATH_PV_AGENT_PREPARATION: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                ID_ETAPE_FOLIO: 2
            }
        )
        const histoPv = histo.toJSON()
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        await Promise.all(folioObjet.map(async (folio) => {
            await Folio.update(
                {
                    ID_FOLIO_AILE_AGENT_PREPARATION: histoPv.ID_FOLIO_AILE_AGENT_PREPARATION,
                    ID_ETAPE_FOLIO: 2
                }, {
                where: {
                    ID_FOLIO: folio.ID_FOLIO
                }
            })
        }))
        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: folioObjet[0].ID_FOLIO_AILE_PREPARATION,
            ID_FOLIO_AILE_AGENT_PREPARATION: histoPv.ID_FOLIO_AILE_AGENT_PREPARATION,
            ID_ETAPE_FOLIO: 2
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Modification faite  avec succès",
            result: histoPv
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
 *   Retour  agent  preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  17/07/2023
 * 
 */
const RetourPreparation = async (req, res) => {
    try {
        const { AGENT_PREPARATION } = req.params
        const pvUpload = new VolumePvUpload()
        const PV = req.files?.PV
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
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        var requete = `
                SELECT F.ID_FOLIO_AILE_PREPARATION,
                    FAAP.ID_FOLIO_AILE_AGENT_PREPARATION
                FROM folio_aile_agent_preparation FAAP
                    LEFT JOIN folio F ON f.ID_FOLIO_AILE_AGENT_PREPARATION = FAAP.ID_FOLIO_AILE_AGENT_PREPARATION
                WHERE FAAP.ID_USER_AILE_AGENT_PREPARATION = ${AGENT_PREPARATION}
                    AND FAAP.ID_ETAPE_FOLIO = 2
              `
        const [results] = await ExecQuery.readRequete(requete)
        await Folio.update(
            {
                ID_ETAPE_FOLIO: 3,
            }, {
            where: {
                ID_FOLIO_AILE_AGENT_PREPARATION: results[0].ID_FOLIO_AILE_AGENT_PREPARATION
            }
        })
        await Folio_aile_agent_preparation.update(
            {
                ID_ETAPE_FOLIO: 3,
                PATH_PV_AGENT_PREPARATION_RETOUR: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            }, {
            where: {
                ID_FOLIO_AILE_AGENT_PREPARATION: results[0].ID_FOLIO_AILE_AGENT_PREPARATION
            }
        })

        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: results[0].ID_FOLIO_AILE_PREPARATION,
            ID_FOLIO_AILE_AGENT_PREPARATION: results[0].ID_FOLIO_AILE_AGENT_PREPARATION,
            ID_ETAPE_FOLIO: 3
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
            // ID_COLLINE,
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
        var requete = `
        SELECT 	ID_FOLIO_AILE_PREPARATION,
        ID_FOLIO_AILE_AGENT_PREPARATION
        FROM folio 
        WHERE ID_FOLIO = ${ID_FOLIO}
        `
        const [results] = await ExecQuery.readRequete(requete)

        const dossiersUpload = new DossiersUpload()
        var filename_dossiers
        if (PHOTO_DOSSIER) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await dossiersUpload.upload(PHOTO_DOSSIER, false)
            filename_dossiers = fileInfo_2
        }
        await Folio.update(
            {
                NUMERO_PARCELLE: NUMERO_PARCELLE,
                // ID_COLLINE: ID_COLLINE,
                LOCALITE: LOCALITE,
                NOM_PROPRIETAIRE: NOM_PROPRIETAIRE,
                PRENOM_PROPRIETAIRE: PRENOM_PROPRIETAIRE,
                PHOTO_DOSSIER: filename_dossiers ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_dossiers.fileName}` : null,
                NUMERO_FEUILLE: NUMERO_FEUILLE,
                NOMBRE_DOUBLON: NOMBRE_DOUBLON,
                ID_ETAPE_FOLIO: 4

            }, {
            where: {
                ID_FOLIO: ID_FOLIO
            }
        })
        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: results[0].ID_FOLIO_AILE_PREPARATION,
            ID_FOLIO_AILE_AGENT_PREPARATION: results[0].ID_FOLIO_AILE_AGENT_PREPARATION,
            ID_ETAPE_FOLIO: 4
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
/**
 * Permet recuperer les nbre des folios d'un agent  superviseur phase preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 18/07/2023
 * 
 */
const findNbre = async (req, res) => {
    try {
        const {ID_VOLUME}=req.params
        var requete = `
        SELECT COUNT(F.ID_FOLIO) AS nbre,
            v.NUMERO_VOLUME
        FROM folio F
            LEFT JOIN folio_aile_preparation FAP ON F.ID_FOLIO_AILE_PREPARATION = FAP.ID_FOLIO_AILE_PREPARATION
            LEFT JOIN volume v ON v.ID_VOLUME = F.ID_VOLUME
            LEFT JOIN user_ailes ua ON ua.ID_USER_AILE=FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION
        WHERE ua.USERS_ID = ${req.userId}
            AND F.ID_ETAPE_FOLIO = 1
        `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Nombre folio ",
            result: results[0]
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
 * Permet recuperer les nbre des folios d'un agent  superviseur phase preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 18/07/2023
 * 
 */
const findAllFolio = async (req, res) => {
    try {
        var requete = `
        SELECT F.ID_FOLIO,F.NUMERO_FOLIO ,F.CODE_FOLIO,F.ID_FOLIO_AILE_PREPARATION
        FROM folio F
            LEFT JOIN folio_aile_preparation FAP ON F.ID_FOLIO_AILE_PREPARATION = FAP.ID_FOLIO_AILE_PREPARATION
            LEFT JOIN volume v ON v.ID_VOLUME = F.ID_VOLUME
            LEFT JOIN user_ailes au ON au.ID_USER_AILE=FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION
        WHERE au.USERS_ID= ${req.userId}
            AND F.ID_ETAPE_FOLIO = 1
        `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios ",
            result: results
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
 * Permet recuperer les  folios d'un agent  superviseur phase preparation en retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 18/07/2023
 * 
 */
const findAllFolios = async (req, res) => {
    try {
        var { AGENT_PREPARATION } = req.query
        var requete = `
        SELECT F.ID_FOLIO,
        F.NUMERO_FOLIO,
        F.CODE_FOLIO,
        F.ID_FOLIO_AILE_PREPARATION,
        F.ID_ETAPE_FOLIO
    FROM folio F
        LEFT JOIN folio_aile_preparation FAP ON F.ID_FOLIO_AILE_PREPARATION = FAP.ID_FOLIO_AILE_PREPARATION
        LEFT JOIN user_ailes ua ON ua.ID_USER_AILE = FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION
        LEFT JOIN folio_aile_agent_preparation FAAP ON FAAP.ID_FOLIO_AILE_AGENT_PREPARATION = F.ID_FOLIO_AILE_AGENT_PREPARATION
    WHERE F.ID_ETAPE_FOLIO = 3
        AND ua.USERS_ID = ${req.userId}
        `
        if (AGENT_PREPARATION && AGENT_PREPARATION != "") {
            requete +=
                `AND  FAAP.ID_USER_AILE_AGENT_PREPARATION=${AGENT_PREPARATION}`;
        }
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios ",
            result: results
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
 * Permet de recuperer  tous folio
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const getDetails = async (req, res) => {
    try {
        var results = (await Folio.findAll());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios",
            result: results
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
 * Permet recuperer les  folios d'un agent  superviseur phase preparation en retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 18/07/2023
 * 
 */
const agentPreparations = async (req, res) => {
    try {
        var reqUser = `
                SELECT FAP.ID_FOLIO_AILE_PREPARATION
                    FROM user_ailes ua
                        LEFT JOIN folio_aile_preparation FAP 
                        ON FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION = ua.ID_USER_AILE
                    WHERE ua.USERS_ID= ${req.userId} `
        const [agentSuperviseur] = await ExecQuery.readRequete(reqUser)
        var requete = `
                SELECT F.NUMERO_FOLIO,
                U.USERS_ID,
                U.NOM,
                U.PRENOM,
                F.ID_FOLIO_AILE_AGENT_PREPARATION,
                F.ID_FOLIO_AILE_PREPARATION,
                FAAP.ID_USER_AILE_AGENT_PREPARATION,
                F.ID_ETAPE_FOLIO,
                COUNT(F.ID_FOLIO) AS nbre_folio,
                FAAP.DATE_INSERTION
            FROM folio F
                LEFT JOIN folio_aile_agent_preparation FAAP 
                ON FAAP.ID_FOLIO_AILE_AGENT_PREPARATION = F.ID_FOLIO_AILE_AGENT_PREPARATION
                LEFT JOIN user_ailes UA ON UA.ID_USER_AILE = FAAP.ID_USER_AILE_AGENT_PREPARATION
                LEFT JOIN users U ON U.USERS_ID = UA.USERS_ID
            WHERE F.ID_FOLIO_AILE_AGENT_PREPARATION!=0  AND F.ID_FOLIO_AILE_PREPARATION = ${agentSuperviseur[0].ID_FOLIO_AILE_PREPARATION}
            GROUP BY F.ID_FOLIO_AILE_AGENT_PREPARATION
        `

        const [results] = await ExecQuery.readRequete(requete)

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios ",
            result: results
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
 * Permet de recuperer les folio traitetement  par un users connecte
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const folioPreparations = async (req, res) => {
    try {
        const { ID_FOLIO_AILE_AGENT_PREPARATION } = req.params
        var requete = `
        SELECT F.ID_FOLIO,
            F.ID_VOLUME,
            F.NUMERO_FOLIO,
            F.CODE_FOLIO,
            F.DATE_INSERTION
        FROM folio F 
        WHERE F.ID_FOLIO_AILE_AGENT_PREPARATION= ${ID_FOLIO_AILE_AGENT_PREPARATION} `
        const [folio] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios",
            result: folio
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
 * Permet recuperer les  folios d'un agent  superviseur phase preparation en retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 18/07/2023
 * 
 */
const chefPlateaus = async (req, res) => {
    try {
        var reqUser = `
        SELECT v.ID_VOLUME
        FROM user_ailes ua
            LEFT JOIN volume v ON v.ID_USER_AILE_PLATEAU = ua.ID_USER_AILE
        WHERE ua.USERS_ID = ${req.userId} `
        const [volume] = await ExecQuery.readRequete(reqUser)
        var requete = `
        SELECT F.NUMERO_FOLIO,
            U.USERS_ID,
            U.NOM,
            U.PRENOM,
            F.ID_FOLIO_AILE_AGENT_PREPARATION,
            F.ID_FOLIO_AILE_PREPARATION,
            COUNT(F.ID_FOLIO) AS nbre_folio,
            FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION,
            F.ID_ETAPE_FOLIO,
            FAP.DATE_INSERTION
        FROM folio F
            LEFT JOIN folio_aile_preparation FAP ON FAP.ID_FOLIO_AILE_PREPARATION = F.ID_FOLIO_AILE_PREPARATION
            LEFT JOIN user_ailes UA ON UA.ID_USER_AILE = FAP.ID_USER_AILE_SUPERVISEUR_PREPARATION
            LEFT JOIN users U ON U.USERS_ID = UA.USERS_ID
        WHERE F.ID_FOLIO_AILE_PREPARATION != 0
            AND F.ID_VOLUME = ${volume[0].ID_VOLUME}
        GROUP BY F.ID_FOLIO_AILE_PREPARATION`
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios ",
            result: results
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
 * Permet de recuperer les folio traitetement  par un users connecte
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const folioPreparation = async (req, res) => {
    try {
        const { ID_FOLIO_AILE_PREPARATION } = req.params
        var requete = `
        SELECT F.ID_FOLIO,
            F.ID_VOLUME,
            F.NUMERO_FOLIO,
            F.CODE_FOLIO,
            F.DATE_INSERTION
        FROM folio F 
        WHERE F.ID_FOLIO_AILE_PREPARATION= ${ID_FOLIO_AILE_PREPARATION} `
        const [folio] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios",
            result: folio
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
 *   Retour  agent superviseur phase   preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  20/07/2023
 * 
 */

const folioNonPrepare = async (req, res) => {
    try {
        const { ID_FOLIO_AILE_PREPARATION } = req.params
        var requete = `
        SELECT COUNT(F.ID_FOLIO) AS nbre_folio
        FROM folio F
            LEFT JOIN folio_aile_preparation FAP ON FAP.ID_FOLIO_AILE_PREPARATION = F.ID_FOLIO_AILE_PREPARATION
        WHERE F.ID_FOLIO_AILE_PREPARATION = ${ID_FOLIO_AILE_PREPARATION}
            AND F.ID_ETAPE_FOLIO != 4`
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les folios ",
            result: results[0]
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
 *   Retour  agent superviseur phase   preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  20/07/2023
 * 
 */
const RetourAgentSupervisuerPreparation = async (req, res) => {
    try {
        const { ID_FOLIO_AILE_PREPARATION } = req.params
        const { MOTIF } = req.body
        const pvUpload = new VolumePvUpload()
        const PV = req.files?.PV
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
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
        await Folio.update(
            {
                ID_ETAPE_FOLIO: 5,
            }, {
            where: {
                ID_FOLIO_AILE_PREPARATION: ID_FOLIO_AILE_PREPARATION
            }
        })
        await Folio_aile_preparation.update(
            {
                ID_ETAPE_FOLIO: 5,
                PATH_PV_SUPERVISEUR_PREPARATION_RETOUR: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                MOTIF_NO_FOLIO_PREPAREE: MOTIF ? MOTIF : null
            }, {
            where: {
                ID_FOLIO_AILE_PREPARATION: ID_FOLIO_AILE_PREPARATION
            }
        })

        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: ID_FOLIO_AILE_PREPARATION,
            ID_ETAPE_FOLIO: 5
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
/**
 *   Retour  agent superviseur phase   preparation
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  20/07/2023
 * 
 */
const retourCheftPlateau = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { MOTIF } = req.body
        const PV = req.files?.PV
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
        var fileUrl
        if (PV) {
            // const { fileInfo: fileInfo_1, thumbInfo: thumbInfo_1 } = await pvUpload.upload(PV, false)
            // filename = fileInfo_1
            // console.log(filename ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.pv}/${filename.fileName}` : null,)
            const destination = path.resolve("./") + path.sep + "public" + path.sep + "uploads" + path.sep + "pv" + path.sep
            const CODE_REFERENCE = `${moment().get("h")}${req.userId}${moment().get("M")}${moment().get("s")}`
            const fileName = `${Date.now()}_${CODE_REFERENCE}${path.extname(PV.name)}`;
            const newFile = await PV.mv(destination + fileName);
            fileUrl = `${req.protocol}://${req.get("host")}/uploads/pv/${fileName}`;
        }

        await Folio.update(
            {
                ID_ETAPE_FOLIO: 5,
            }, {
            where: {
                ID_FOLIO_AILE_PREPARATION: ID_FOLIO_AILE_PREPARATION
            }
        })
        await Folio_aile_preparation.update(
            {
                ID_ETAPE_FOLIO: 5,
                PATH_PV_AGENT_PREPARATION_RETOUR: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                MOTIF_NO_FOLIO_PREPAREE: MOTIF ? MOTIF : null
            }, {
            where: {
                ID_FOLIO_AILE_PREPARATION: ID_FOLIO_AILE_PREPARATION
            }
        })

        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: ID_FOLIO_AILE_PREPARATION,
            ID_ETAPE_FOLIO: 5
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
    findById,
    createFalio,
    findAll,
    findNature,
    findMaille,
    findBatiment,
    findAile,
    findAgentDistributeurAile,
    superviser,
    preparation,
    addDetails,
    findAgentSuperviseur,
    findChefPlateau,
    findAgentPreparation,
    findAgentsPreparation,
    RetourPreparation,
    findAlls,
    findNbre,
    findAllFolio,
    findAllFolios,
    getDetails,
    agentPreparations,
    folioPreparations,
    chefPlateaus,
    folioPreparation,
    RetourAgentSupervisuerPreparation,
    folioNonPrepare
}