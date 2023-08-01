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
const folio = require('../../models/folio');
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques');
const Users = require('../../models/Users');
const ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const PROFILS = require('../../constants/PROFILS');
const Nature_folio = require('../../models/Nature_folio');
const Folio = require('../../models/folio');

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
            folio,ID_VOLUME
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
            const CODE_REFERENCE = `${folio.NUMERO_folio}${req.userId}${moment().get("s")}`
            const folioInsert = await Folio.create({
                ID_VOLUME:ID_VOLUME,
                NUMERO_FOLIO: folio.NUMERO_FOLIO,
                ID_NATURE:folio.ID_NATURE,
                CODE_FOLIO: CODE_REFERENCE,
                ID_USERS: req.userId,
                ID_ETAPE_FOLIO:ETAPES_FOLIO.FOLIO_ENREG,
            }
            )
            const insertData = folioInsert.toJSON()
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    ID_USER: req.userId,
                    ID_FOLIO: insertData.ID_FOLIO,
                    ID_ETAPE_FOLIO:ETAPES_FOLIO.FOLIO_ENREG}
            )
        }))
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
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  31/07/2023
 * 
 */
const findfolio = async (req, res) => {
    try {
        const {
            folio,
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
            const CODE_REFERENCE = `${folio.NUMERO_folio}${req.userId}${moment().get("s")}`
            const folioInsert = await folio.create({
                NUMERO_folio: folio.NUMERO_folio,
                CODE_folio: CODE_REFERENCE,
                ID_USERS: req.userId,
                ID_ETAPE_folio:ETAPES_FOLIO.PLANIFICATION,
            }
            )
            const insertData = folioInsert.toJSON()
            await Etapes_folio_historiques.create(
                {
                    PV_PATH: filename_pv ? `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${filename_pv.fileName}` : null,
                    USERS_ID: req.userId,
                    ID_FOLIO: insertData.ID_folio,
                    ID_ETAPE_FOLIO:ETAPES_FOLIO.PLANIFICATION}
            )
        }))
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
 * Permet de afficher tous folio
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 27/06/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
 
module.exports = {
    createfolio,
}