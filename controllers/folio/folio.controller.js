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
const Folio = require('../../models/folio');
const Users = require('../../models/Users');
const Affectation_users = require('../../models/affectation_users');
const ExecQuery = require('../../models/ExecQuery');

const Aile = require('../../models/Aile');
const { excludedProperties } = require('juice');
const Batiment = require('../../models/Batiment');
const Nature_folio = require('../../models/Nature_folio');
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
        var results = (await folio_model.findMaille());
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les mailles",
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
            where:{
                ID_BATIMENT:ID_BATIMENT
            }
        });
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les ailes",
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
 * Permet recuperer  les ailes de chaque batiment
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAgentDistributeurAile = async (req, res) => {
    try {
        const { ID_AILE } = req.params
        var requete=`
        SELECT * FROM affectation_users au 
        LEFT JOIN  users u ON u.USERS_ID=au.USERS_ID
         WHERE au.ID_AILE=${ID_AILE} AND  u.ID_PROFIL=29
           `
           const results = await ExecQuery.readRequete(requete)
           
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
        var folioObjet = {}
        // folioObjet = JSON.parse(folio)
        folioObjet = folio
        await Promise.all(folioObjet.map(async (folio) => {
            const CODE_REFERENCE = `${folio.NUMERO_FOLIO}${req.userId}${moment().get("s")}`
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.create(
                {
                    ID_VOLUME: ID_VOLUME,
                    ID_NATURE: folio.ID_NATURE,
                    NUMERO_FOLIO: folio.NUMERO_FOLIO,
                    CODE_FOLIO:CODE_REFERENCE,
                    NUMERO_DOSSIERS: folio.NUMERO_DOSSIERS,
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

            var histo = await folio_model.createHisto(
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




module.exports = {
    findById,
    createFalio,
    findAll,
    findNature,
    findMaille,
    findBatiment,
    findAile,
    findAgentDistributeurAile
}