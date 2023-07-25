const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const volume_model = require('../../models/volume/volume.model');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const Volume_pv = require('../../models/volume_pv');
const Volume = require('../../models/volume');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');
const ExecQuery = require('../../models/ExecQuery');
const Users = require('../../models/Users');

/**
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const findById = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: {
                USERS_ID: req.userId
            }
        })
        if (user?.ID_PROFIL == 2) {
            const results = await Volume.findAll({
                where: {
                    ID_ETAPE_VOLUME: 1
                }
            })
            res.status(RESPONSE_CODES.CREATED).json({
                statusCode: RESPONSE_CODES.CREATED,
                httpStatus: RESPONSE_STATUS.CREATED,
                message: "Vous êtes connecté avec succès",
                result: results
            })
        }
        else if (user?.ID_PROFIL == 3) {
            const results = await Volume.findAll({
                where: {
                    USER_TRAITEMENT: req.userId
                }
            })
            res.status(RESPONSE_CODES.CREATED).json({
                statusCode: RESPONSE_CODES.CREATED,
                httpStatus: RESPONSE_STATUS.CREATED,
                message: "Vous êtes connecté avec succès",
                result: results
            })
        }
        else if (user?.ID_PROFIL == 29) {
            var requete = `SELECT * FROM  volume 
            v LEFT JOIN user_ailes ua ON
             ua.ID_USER_AILE=v.ID_USER_AILE_DISTRIBUTEUR
            WHERE ua.USERS_ID=${req.userId}`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        else if (user?.ID_PROFIL == 7) {
            var requete = `SELECT * FROM  volume 
            v LEFT JOIN user_ailes ua ON
             ua.ID_USER_AILE=v.ID_USER_AILE_SUPERVISEUR
            WHERE ua.USERS_ID=${req.userId}`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        //	Chef Plateau Phase de preparation
        else if (user?.ID_PROFIL == 15) {
            var requete = `SELECT * FROM  volume 
            v LEFT JOIN user_ailes ua ON
             ua.ID_USER_AILE=v.ID_USER_AILE_PLATEAU
            WHERE ua.USERS_ID=${req.userId}`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        else {
            const results = await Volume.findAll({
                where: {
                    ID_USERS: req.userId
                }
            })
            res.status(RESPONSE_CODES.CREATED).json({
                statusCode: RESPONSE_CODES.CREATED,
                httpStatus: RESPONSE_STATUS.CREATED,
                message: "Vous êtes connecté avec succès",
                result: results
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
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const find = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: {
                USERS_ID: req.userId
            }
        })
        if (user?.ID_PROFIL == 3) {
            var requete = `SELECT * FROM  volume 
            v 
            WHERE v.USER_TRAITEMENT=${req.userId} AND v.ID_ETAPE_VOLUME=3`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
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
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const findBy = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: {
                USERS_ID: req.userId
            }
        })
         //Agents superviseur  archive
         if (user?.ID_PROFIL == 3) {
            var requete = `SELECT * FROM  volume 
            v 
            WHERE v.USER_TRAITEMENT=${req.userId} AND v.ID_ETAPE_VOLUME=2`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        //Agents de distribution
        else if (user?.ID_PROFIL == 29) {
            var requete = `SELECT * FROM  volume 
            v LEFT JOIN user_ailes ua ON
             ua.ID_USER_AILE=v.ID_USER_AILE_DISTRIBUTEUR
            WHERE ua.USERS_ID=${req.userId} AND v.ID_ETAPE_VOLUME=4`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        //Agents des superviseur Aile
        else if (user?.ID_PROFIL == 7) {
            var requete = `SELECT * FROM  volume 
            v LEFT JOIN user_ailes ua ON
             ua.ID_USER_AILE=v.ID_USER_AILE_SUPERVISEUR
            WHERE ua.USERS_ID=${req.userId} AND v.ID_ETAPE_VOLUME=5`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        //Chef Plateau Phase de preparation
        else if (user?.ID_PROFIL == 15) {
            var requete = `SELECT * FROM  volume 
            v LEFT JOIN user_ailes ua ON
             ua.ID_USER_AILE=v.ID_USER_AILE_PLATEAU
            WHERE ua.USERS_ID=${req.userId} AND v.ID_ETAPE_VOLUME=6`
            const [results] = await ExecQuery.readRequete(requete)
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
            })
        }
        else {
            const results = await Volume.findAll({
                where: {
                    USER_TRAITEMENT: req.userId
                }
            })
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Les volumes",
                result: results
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
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const findChefPlateauVolume = async (req, res) => {
    try {
        var reque = `SELECT ua.ID_USER_AILE FROM  user_ailes ua 
        WHERE ua.USERS_ID=${req.userId}`
        const [resuls] = await ExecQuery.readRequete(reque)
        var requete = `
        SELECT v.*,
            u.NOM,
            u.PRENOM
        FROM volume v
            LEFT JOIN user_ailes ua ON ua.ID_USER_AILE = v.ID_USER_AILE_PLATEAU
            LEFT JOIN users u ON u.USERS_ID = ua.USERS_ID
        WHERE v.ID_USER_AILE_SUPERVISEUR = ${resuls[0].ID_USER_AILE} AND v.ID_USER_AILE_PLATEAU!=0
        `
        const [resultans] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les volumes",
            result: resultans
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
 * Permet de recuper un volume
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  12/07/2023
 * 
 */
const findOne = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const results = await Volume.findOne({
            where: {
                ID_VOLUME
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Volume ",
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
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAll = async (req, res) => {
    try {
        // var orderColumn='DATE_INSERTION DESC'
        // var orderDirection=' '
        var results = await Volume.findAll({
            //     order: [
            //         [orderColumn]
            // ],
            where: {
                NOMBRE_DOSSIER: null, USER_TRAITEMENT: null, ID_ETAPE_VOLUME: 1
            }
        });
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les volumes",
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
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
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
        const histo = await Volume_pv.create(
            {
                PV_PATH:filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                USERS_ID: req.userId
            }
        )
        const histoPv = histo.toJSON()
        var volumeObjet = {}
        volumeObjet = JSON.parse(volume)
        // volumeObjet = volume
        await Promise.all(volumeObjet.map(async (volume) => {
            const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            const CODE_REFERENCE = `${volume.NUMERO_VOLUME}${req.userId}${moment().get("s")}`
            await Volume.create({
                NUMERO_VOLUME: volume.NUMERO_VOLUME,
                CODE_VOLUME: CODE_REFERENCE,
                ID_USERS: req.userId,
                ID_ETAPE_VOLUME: 1,
                ID_VOLUME_PV: histoPv.ID_VOLUME_PV
            }
            )
        }))
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Insertion faite  avec succès",
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
 * Permet d'affecte un volume à un agent distributeur 
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 15/07/2023
 * 
 */
const affectation = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { MAILLE, AGENT_DISTRIBUTEUR } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                MAILLE: {
                    required: true,
                },
                AGENT_DISTRIBUTEUR: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                MAILLE: {
                    required:"MAILLE est obligatoire",
                },
                AGENT_DISTRIBUTEUR: {
                    required:"AGENT_DISTRIBUTEUR est obligatoire",
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
            ID_MALLE: MAILLE,
            ID_USER_AILE_DISTRIBUTEUR: AGENT_DISTRIBUTEUR,
            PATH_PV_DISTRIBUTEUR: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: 4
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: AGENT_DISTRIBUTEUR,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: 4
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: results.toJSON()
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
 * Permet d'affecte un volume à un agent superviseur  aile
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 15/07/2023
 * 
 */
const affectationSuperviseur = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { AGENT_SUPERVISEUR } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                AGENT_SUPERVISEUR: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                AGENT_SUPERVISEUR: {
                    required:"AGENT_SUPERVISEUR est obligatoire",
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
            ID_USER_AILE_SUPERVISEUR: AGENT_SUPERVISEUR,
            PV_PATH_SUPERVISEUR: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: 5
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: AGENT_SUPERVISEUR,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: 5
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: results.toJSON()
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
 * Permet d'affecte un volume à un agent superviseur  aile
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 15/07/2023
 * 
 */
const affectationPlateau = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { CHEF_PLATEAU } = req.body
        const validation = new Validation(
            { ...req.body, ...req.files },
            {
                PV: {
                    required: true,
                    image: 21000000
                },
                CHEF_PLATEAU: {
                    required: true,
                }
            },
            {
                PV: {
                    image: "La taille invalide",
                    required: "Le nom est obligatoire"
                },
                CHEF_PLATEAU: {
                    required:"CHEF_PLATEAU est obligatoire",
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
            ID_USER_AILE_PLATEAU: CHEF_PLATEAU,
            PV_PATH_PLATEAU: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: 6
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: CHEF_PLATEAU,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: 6
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: results.toJSON()
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
 * Permet d'ajouter  les nbres de folios
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const update = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const { NOMBRE_DOSSIER, ID_USERS } = req.body
        const validation = new Validation(
            {...req.body,...req.files},
            {
                NOMBRE_DOSSIER: {
                    required: true,
                },
                ID_USERS: {
                    required: true,
                },
                PV:{
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
            NOMBRE_DOSSIER,
            USER_TRAITEMENT: ID_USERS,
            PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: 2
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: ID_USERS,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: 2
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: results.toJSON()
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
 * Permet de recuper un volume
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  12/07/2023
 * 
 */
const getPv = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        var results = (await Volume_pv.findAll());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Volume ",
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
const findVolume = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        var requete = `SELECT b.NUMERO_BATIMENT,
                        a.NUMERO_AILE,
                        m.NUMERO_MAILLE,
                        v.NOMBRE_DOSSIER
                    FROM volume v
                        LEFT JOIN user_ailes au ON au.ID_USER_AILE = v.ID_USER_AILE_DISTRIBUTEUR
                        LEFT JOIN aile a ON a.ID_AILE = au.ID_AILE
                        LEFT JOIN batiment b ON b.ID_BATIMENT = a.ID_BATIMENT
                        LEFT JOIN maille m on m.ID_MAILLE = v.ID_MALLE
                    WHERE v.ID_VOLUME = ${ID_VOLUME}
       `
        const [results] = await ExecQuery.readRequete(requete)
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les batiments ,ailes et mailles",
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
 * Permet le retour  un volume à un agent superviseur  aile
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 15/07/2023
 * 
 */
const retourPlateau = async (req, res) => {
    try {
        const { ID_USER_AILE_PLATEAU ,ID_VOLUME} = req.params

        const PV = req.files?.PV
        const volumeUpload = new VolumePvUpload()
        var filename_pv
        if (PV) {
            const { fileInfo: fileInfo_2, thumbInfo: thumbInfo_2 } = await volumeUpload.upload(PV, false)
            filename_pv = fileInfo_2
        }
       const results = await Volume.update({
            PV_PATH_SUPERVISEUR_RETOUR: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
            ID_ETAPE_VOLUME: 7
        }, {
            where: {
                ID_VOLUME: ID_VOLUME,
                ID_USER_AILE_PLATEAU:ID_USER_AILE_PLATEAU
            }
        })
        await Etapes_volume_historiques.create({
            USERS_ID: req.userId,
            USER_TRAITEMENT: ID_USER_AILE_PLATEAU,
            ID_VOLUME: ID_VOLUME,
            ID_ETAPE_VOLUME: 7
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
            // result: results.toJSON()
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
    createVolume,
    findAll,
    update,
    findOne,
    getPv,
    findBy,
    affectation,
    affectationSuperviseur,
    affectationPlateau,
    findVolume,
    findChefPlateauVolume,
    retourPlateau,
    find

}