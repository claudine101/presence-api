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
        const results = await Volume.findAll({
            where: {
                ID_USERS:req.userId
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Vous êtes connecté avec succès",
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
const findBy = async (req, res) => {
    try {
        const results = await Volume.findAll({
            where: {
                USER_TRAITEMENT:req.userId
            }
        })
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
        var results = await Volume.findAll({
            where:{
                NOMBRE_DOSSIER:null,USER_TRAITEMENT:null
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
        var volumeObjet = {}
        volumeObjet = JSON.parse(volume)
        // volumeObjet = volume
        await Promise.all(volumeObjet.map(async (volume) => {
            const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            const CODE_REFERENCE = `${volume.NUMERO_VOLUME}${req.userId}${moment().get("s")}`
            await Volume.create({
                NUMERO_VOLUME: volume.NUMERO_VOLUME,
                CODE_VOLUME: CODE_REFERENCE,
                ID_USERS: req.userId
            }
            )
        }))
        const pvUpload = new VolumePvUpload()
        const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        const PV = req.files?.PV
        if (PV) {
            // const { fileInfo: fileInfo_1, thumbInfo: thumbInfo_1 } = await pvUpload.upload(PV, false)
            // filename = fileInfo_1
            // console.log(filename ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.pv}/${filename.fileName}` : null,)

            const destination = path.resolve("./") + path.sep + "public" + path.sep + "uploads" + path.sep + "pv" + path.sep
            console.log(destination)
            const CODE_REFERENCE = `${moment().get("h")}${req.userId}${moment().get("M")}${moment().get("s")}`
            const fileName = `${Date.now()}_${CODE_REFERENCE}${path.extname(PV.name)}`;
            const newFile = await PV.mv(destination + fileName);
            fileUrl = `${req.protocol}://${req.get("host")}/uploads/pv/${fileName}`;

            var histo = await volume_model.createHisto(
                // filename ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.pv}/${filename.fileName}` : null,
                fileUrl,
                req.userId,
                date
            )
        }
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
 * Permet de vérifier la connexion dun utilisateur
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
        const results = await Volume.update({
            NOMBRE_DOSSIER,
            USER_TRAITEMENT: ID_USERS
        }, {
            where: {
                ID_VOLUME: ID_VOLUME
            }
        })
        const pvUpload = new VolumePvUpload()
        var filename
        const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        const PV = req.files?.PV
        if (PV) {
            // const { fileInfo: fileInfo_1, thumbInfo: thumbInfo_1 } = await pvUpload.upload(PV, false)
            // filename = fileInfo_1
            // console.log(filename ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.pv}/${filename.fileName}` : null,)

            const destination = path.resolve("./") + path.sep + "public" + path.sep + "uploads" + path.sep + "pv" + path.sep
            console.log(destination)
            const CODE_REFERENCE = `${moment().get("h")}${req.userId}${moment().get("M")}${moment().get("s")}`
            const fileName = `${Date.now()}_${CODE_REFERENCE}${path.extname(PV.name)}`;
            const newFile = await PV.mv(destination + fileName);
            fileUrl = `${req.protocol}://${req.get("host")}/uploads/pv/${fileName}`;

            var histo = await Volume_pv.create({
                PV_PATH: fileUrl,
                USERS_ID: req.userId,
            }

            )
        }
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "modification faite  avec succès",
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



module.exports = {
    findById,
    createVolume,
    findAll,
    update,
    findOne,
    getPv,
    findBy

}