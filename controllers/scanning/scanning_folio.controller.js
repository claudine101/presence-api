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

/**
 * Permet de recuperer la liste des tous les folios
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  2/08/2023
 * 
 */
const findAllFolio = async (req, res) => {
    try {
        const { ID_VOLUME } = req.params
        const folios = await Folio.findAll({
            where: { ID_VOLUME: ID_VOLUME, ID_ETAPE_FOLIO: ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP },
            attributes: ['ID_FOLIO', 'ID_VOLUME', 'NUMERO_FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios",
            result: folios
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

const findAll = async (req, res) => {
    try {
        const result = await Etapes_folio_historiques.findAll({
            where: { USER_TRAITEMENT: req.userId, '$folio.ID_ETAPE_FOLIO$': ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG },
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'ID_ETAPE_FOLIO'],
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
                        attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME', 'NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'CODE_VOLUME'],

                    }

                }]


        })
        var volumeFolios = []
        console.log(result)
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
                    folios: []
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

const folioEquipeScanning = async (req, res) => {
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
        // folioObjet = folio
        await Promise.all(folioObjet.map(async (folio) => {
            // const CODE_REFERENCE = `${folio.NUMERO_FOLIO}${req.userId}${moment().get("s")}`
            const dateinsert = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            await Folio.update(
                {
                    ID_ETAPE_FOLIO: ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG
                }, {
                where: {
                    ID_VOLUME: ID_VOLUME,
                    // ID_NATURE: folio.ID_NATURE,
                    NUMERO_FOLIO: folio.folio.NUMERO_FOLIO
                }
            }
            )
            await Etapes_folio_historiques.create({
                ID_USER: req.userId,
                USER_TRAITEMENT: USER_TRAITEMENT,
                ID_FOLIO: folio.folio.ID_FOLIO,
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


module.exports = {
    findAllFolio,
    findAll,
    folioEquipeScanning
}