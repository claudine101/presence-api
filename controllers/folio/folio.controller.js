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
/**
 * Permet de recuperer les folio traitetement  par un users connecte
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const findById = async (req, res) => {
    try {
        var results = (await folio_model.findFolio(req.userId));
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
        const  { ID_VOLUME}=req.params
        var results = (await Folio.findAll(
           { where: {
            ID_VOLUME: ID_VOLUME,
            ID_FOLIO_AILE_PREPARATION:null
            }}
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

        //     const results = await Users.findAll({
        //         where: {
        //             ID_AILE: ID_AILE
        //         },
        //         include: {
        //                 model: Affectation_users,
        //                 as: 'users',
        //                 required: false,
        //                 include: {
        //                     model: Aile,
        //                     as: 'aile',
        //                     required: false,
        //                     attributes: ['ID_AILE', 'NUMERO_AILE'],
        //             }
        //         },

        // })
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
        // console.log(user[0].ID_AILE)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=7 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)

        //     const results = await Users.findAll({
        //         where: {
        //             ID_AILE: ID_AILE
        //         },
        //         include: {
        //                 model: Affectation_users,
        //                 as: 'users',
        //                 required: false,
        //                 include: {
        //                     model: Aile,
        //                     as: 'aile',
        //                     required: false,
        //                     attributes: ['ID_AILE', 'NUMERO_AILE'],
        //             }
        //         },

        // })
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
        // console.log(user[0].ID_AILE)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=8 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)

        //     const results = await Users.findAll({
        //         where: {
        //             ID_AILE: ID_AILE
        //         },
        //         include: {
        //                 model: Affectation_users,
        //                 as: 'users',
        //                 required: false,
        //                 include: {
        //                     model: Aile,
        //                     as: 'aile',
        //                     required: false,
        //                     attributes: ['ID_AILE', 'NUMERO_AILE'],
        //             }
        //         },

        // })
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
        // console.log(user[0].ID_AILE)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=22 AND au.IS_ACTIF=1
           `
        const [results] = await ExecQuery.readRequete(requete)

        //     const results = await Users.findAll({
        //         where: {
        //             ID_AILE: ID_AILE
        //         },
        //         include: {
        //                 model: Affectation_users,
        //                 as: 'users',
        //                 required: false,
        //                 include: {
        //                     model: Aile,
        //                     as: 'aile',
        //                     required: false,
        //                     attributes: ['ID_AILE', 'NUMERO_AILE'],
        //             }
        //         },

        // })
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
        // console.log(user[0].ID_AILE)
        var requete = `
        SELECT * FROM user_ailes au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${user[0].ID_AILE} AND  u.ID_PROFIL=15 AND au.IS_ACTIF=1`
        const [results] = await ExecQuery.readRequete(requete)
        //     const results = await Users.findAll({
        //         where: {
        //             ID_AILE: ID_AILE
        //         },
        //         include: {
        //                 model: Affectation_users,
        //                 as: 'users',
        //                 required: false,
        //                 include: {
        //                     model: Aile,
        //                     as: 'aile',
        //                     required: false,
        //                     attributes: ['ID_AILE', 'NUMERO_AILE'],
        //             }
        //         },

        // })
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
        // const validation = new Validation({ ...req.body, ...req.files },
        //     {
        //         PV: {
        //             PV: 21000000
        //         },

        //     },
        //     {
        //         PV: {
        //             PV: "La taille invalide"
        //         }
        //     }
        // )
        // await validation.run();
        // const isValide = await validation.isValidate()
        // const errors = await validation.getErrors()
        // if (!isValide) {
        //     return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
        //         statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
        //         httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
        //         message: "Probleme de validation des donnees",
        //         result: errors
        //     })
        // }
        const pvUpload = new VolumePvUpload()
        const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        const PV = req.files?.PV
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
        const histo = await Folio_pv.create(
            {
                PV_PATH: fileUrl ? fileUrl : "local",
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
                    ID_FOLIO_PV: histoPv.ID_FOLIO_PV
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
        // const validation = new Validation({ ...req.body, ...req.files },
        //     {
        //         PV: {
        //             PV: 21000000
        //         },

        //     },
        //     {
        //         PV: {
        //             PV: "La taille invalide"
        //         }
        //     }
        // )
        // await validation.run();
        // const isValide = await validation.isValidate()
        // const errors = await validation.getErrors()
        // if (!isValide) {
        //     return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
        //         statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
        //         httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
        //         message: "Probleme de validation des donnees",
        //         result: errors
        //     })
        // }
        const pvUpload = new VolumePvUpload()
        const PV = req.files?.PV
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
        const histo = await Folio_aile_preparation.create(
            {
                ID_USER_AILE_SUPERVISEUR_PREPARATION: AGENT_SUPERVISEUR,
                PATH_PV_SUPERVISEUR_PREPARATION: fileUrl ? fileUrl : "local",
                ID_ETAPE_FOLIO: 1
            }
        )
        const histoPv = histo.toJSON()
        var folioObjet = {}
        folioObjet = JSON.parse(folio)
        // folioObjet = folio
        console.log(folioObjet)

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
        // const validation = new Validation({ ...req.body, ...req.files },
        //     {
        //         PV: {
        //             PV: 21000000
        //         },

        //     },
        //     {
        //         PV: {
        //             PV: "La taille invalide"
        //         }
        //     }
        // )
        // await validation.run();
        // const isValide = await validation.isValidate()
        // const errors = await validation.getErrors()
        // if (!isValide) {
        //     return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
        //         statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
        //         httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
        //         message: "Probleme de validation des donnees",
        //         result: errors
        //     })
        // }
        const pvUpload = new VolumePvUpload()
        const PV = req.files?.PV
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
        const histo = await Folio_aile_agent_preparation.create(
            {
                ID_USER_AILE_AGENT_PREPARATION: AGENT_PREPARATION,
                PATH_PV_PREPARATION: fileUrl ? fileUrl : "local",
                ID_ETAPE_FOLIO: 2
            }
        )
        const histoPv = histo.toJSON()
        var folioObjet = {}
        // folioObjet = JSON.parse(folio)
        folioObjet = folio


        await Promise.all(folioObjet.map(async (folio) => {
            await Folio.update(
                {
                    ID_FOLIO_AILE_AGENT_PREPARATION: histoPv.ID_FOLIO_AILE_AGENT_PREPARATION,
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
        const {
            AGENT_PREPARATION
        } = req.body;
        const { ID_USER_AILE_AGENT_PREPARATION } = req.params
        const pvUpload = new VolumePvUpload()
        const PV = req.files?.PV
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
        var requete = `
                SELECT F.ID_FOLIO_AILE_PREPARATION,
                    FAAP.ID_FOLIO_AILE_AGENT_PREPARATION
                FROM folio_aile_agent_preparation FAAP
                    LEFT JOIN folio F ON f.ID_FOLIO_AILE_AGENT_PREPARATION = FAAP.ID_FOLIO_AILE_AGENT_PREPARATION
                WHERE FAAP.ID_USER_AILE_AGENT_PREPARATION = ${ID_USER_AILE_AGENT_PREPARATION}
                    AND FAAP.ID_ETAPE_FOLIO = 2
              `
        const [results] = await ExecQuery.readRequete(requete)
        console.log(results)
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
            }, {
            where: {
                ID_FOLIO_AILE_AGENT_PREPARATION: results[0].ID_FOLIO_AILE_AGENT_PREPARATION
            }
        })
        await Etapes_folio_historiques.create({
            ID_USER: req.userId,
            ID_FOLIO_AILE_PREPARATION: results[0].ID_FOLIO_AILE_PREPARATION,
            ID_FOLIO_AILE_AGENT_PREPARATION:  results[0].ID_FOLIO_AILE_AGENT_PREPARATION,
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
            ID_COLLINE,
            LOCALITE,
            NOM_PROPRIETAIRE,
            PRENOM_PROPRIETAIRE,
            PHOTO_DOSSIER,
            NUMERO_FEUILLE,
            NOMBRE_DOUBLON
        } = req.body;
        // const validation = new Validation({ ...req.body, ...req.files },
        //     {
        //         PV: {
        //             PV: 21000000
        //         },

        //     },
        //     {
        //         PV: {
        //             PV: "La taille invalide"
        //         }
        //     }
        // )
        // await validation.run();
        // const isValide = await validation.isValidate()
        // const errors = await validation.getErrors()
        // if (!isValide) {
        //     return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
        //         statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
        //         httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
        //         message: "Probleme de validation des donnees",
        //         result: errors
        //     })
        // }
        const pvUpload = new VolumePvUpload()
        const PV = req.files?.PV
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
        const histo = await Folio_aile_agent_preparation.create(
            {
                ID_USER_AILE_AGENT_PREPARATION: AGENT_PREPARATION,
                PATH_PV_PREPARATION: fileUrl ? fileUrl : "local",
                ID_ETAPE_FOLIO: 2
            }
        )
        const histoPv = histo.toJSON()
        var folioObjet = {}
        // folioObjet = JSON.parse(folio)
        folioObjet = folio


        await Promise.all(folioObjet.map(async (folio) => {
            await Folio.update(
                {
                    NUMERO_PARCELLE: NUMERO_PARCELLE,
                    ID_COLLINE: ID_COLLINE,
                    LOCALITE: LOCALITE,
                    NOM_PROPRIETAIRE: NOM_PROPRIETAIRE,
                    PRENOM_PROPRIETAIRE: PRENOM_PROPRIETAIRE,
                    PHOTO_DOSSIER: PHOTO_DOSSIER,
                    NUMERO_FEUILLE: NUMERO_FEUILLE,
                    NOMBRE_DOUBLON: NOMBRE_DOUBLON
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
    findAlls
}