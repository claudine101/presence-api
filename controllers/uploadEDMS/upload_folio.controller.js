const express = require('express')
const Folio = require('../../models/Folio')
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS')
const Flashs = require('../../models/Flashs')
const Users = require('../../models/Users')
const PROFILS = require('../../constants/PROFILS')
const IDS_ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO')
const { Op, Sequelize } = require('sequelize')
const Etapes_folio_historiques = require('../../models/Etapes_folio_historiques')
const VolumePvUpload = require('../../class/uploads/VolumePvUpload')
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS')
const Validation = require('../../class/Validation')
const Etapes_folio = require('../../models/Etapes_folio')
const Folio_types_documents = require('../../models/Folio_types_documents')


/**
 * Permet de recuperer les folio qui ont un etape quelconque
 * @author claudine <claudine@mediabox.bi>
 * @date 09/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefEquipe = async (req, res) => {
    try {
       
        const flashsIndexe = await Folio.findAll({
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO','ID_NATURE'],
            where: { ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE },
            include: {

                model: Flashs,
                as: 'flash',
                required: true,
                attributes: ['ID_FLASH', 'NOM_FLASH']
            }
        })
        var FlashFolios = []
        flashsIndexe.forEach(flash => {
            const ID_FLASH = flash.flash?.ID_FLASH
            const flashs = flash.flash
            const isExists = FlashFolios.find(vol => vol.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const folio = FlashFolios.find(vol => vol.ID_FLASH == ID_FLASH)
                const newFolios = { ...folio, folios: [...folio.folios, flash] }

                FlashFolios = FlashFolios.map(flash => {
                    if (flash.ID_FLASH == ID_FLASH) {
                        return newFolios
                    } else {
                        return flash
                    }
                })
            } else {
                FlashFolios.push({
                    ID_FLASH,
                    flashs,
                    folios: [flash]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
            result: FlashFolios
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
 * Permet de recuperer les agents uploadEDRMS
 * @author claudine <claudine@mediabox.bi>
 * @date 09/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getAgentsByProfil = async (req, res) => {
    try {
        const { ID_PROFIL } = req.params
        const agents = await Users.findAll({
            where: {
                ID_PROFIL: ID_PROFIL
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents uploadEDRMS",
            result: agents
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
 * Permet d'enregistrer le chef de plateau indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 03/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const saveAgent = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH, ID_AGENT } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH: {
                required: true
            },
            ID_AGENT: {
                required: true
            },
            pv: {
                image: 4000000
            }
        })
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
        const folios = await Folio.findAll({
            attributes: ['ID_FOLIO'],
            where: {
                ID_FLASH
            }
        })
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
        }, {
            where: {
                ID_FLASH
            }
        })
        const pvUpload = new VolumePvUpload()
        const { fileInfo } = await pvUpload.upload(pv, false)
        const PV_PATH = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${fileInfo.fileName}`
        const etapes_folio_historiques = folios.map(folio => {
            return {
                ID_USER: userId,
                USER_TRAITEMENT: ID_AGENT,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent chef plateau enregisté avec succes"
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
 * Permet de recuperer les USB des d'un agent uploadEDRMS
 * @author claudine <claudine@mediabox.bi>
 * @date 10/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByAgent = async (req, res) => {
    try {
        const { precision } = req.query
        var whereFilter = {}

        if (precision == 'valides') {
            whereFilter = {
                ID_ETAPE_FOLIO: {
                    [Op.notIn]: [
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION,
                        IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                        IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
                    ]
                }
            }
        }
        else {
            whereFilter = {
                ID_ETAPE_FOLIO: 
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                }
            }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION'] 
            },
            where: {
                [Op.and]: [{
                    USER_TRAITEMENT: req.userId,
                },
               whereFilter ]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO','ID_NATURE'],
                include: {
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                where: whereFilter
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            order: [['DATE_INSERTION', 'DESC']]
        })
        var FlashFolios = []
        flashs.forEach(flash => {
            const ID_FLASH = flash.folio?.ID_FLASH
            const flashs = flash.folio.flash
            const users=flash.traitement
            const isExists = FlashFolios.find(vol => vol.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const folio = FlashFolios.find(vol => vol.ID_FLASH == ID_FLASH)
                const newFolios = { ...folio, folios: [...folio.folios, flash] }

                FlashFolios = FlashFolios.map(flash => {
                    if (flash.ID_FLASH == ID_FLASH) {
                        return newFolios
                    } else {
                        return flash
                    }
                })
            } else {
                FlashFolios.push({
                    ID_FLASH,
                    flashs,
                    users,
                    folios: [flash]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
            result: FlashFolios
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
 * Permet de recuperer les USB des d'un chef d'equipe
 * @author claudine <claudine@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefEquipeENattante = async (req, res) => {
    try {
        const { precision } = req.query
        var whereFilter = {}

        if (precision == 'valides') {
            whereFilter = {
                ID_ETAPE_FOLIO: {
                    [Op.notIn]: [
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION,
                        IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                        IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
                    ]
                }
            }
        }
        else {
            whereFilter = {
                ID_ETAPE_FOLIO: {
                    [Op.in]: [
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                        IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS
                    ]
                }
            }
        }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION'] 
            },
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                },
               whereFilter ]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO','ID_NATURE'],
                include: {
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                where: whereFilter
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            order: [['DATE_INSERTION', 'DESC']]
        })
        var FlashFolios = []
        flashs.forEach(flash => {
            const ID_FLASH = flash.folio?.ID_FLASH
            const flashs = flash.folio.flash
            const users=flash.traitement
            const isExists = FlashFolios.find(vol => vol.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const folio = FlashFolios.find(vol => vol.ID_FLASH == ID_FLASH)
                const newFolios = { ...folio, folios: [...folio.folios, flash] }

                FlashFolios = FlashFolios.map(flash => {
                    if (flash.ID_FLASH == ID_FLASH) {
                        return newFolios
                    } else {
                        return flash
                    }
                })
            } else {
                FlashFolios.push({
                    ID_FLASH,
                    flashs,
                    users,
                    folios: [flash]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
            result: FlashFolios
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
 * Permet de recuperer les nature du  dossier
 * @author claudine <claudine@mediabox.bi>
 * @date 10/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getDocuments = async (req, res) => {
    try {
        const { ID_NATURE } = req.params
        
        const type = await Folio_types_documents.findAll({
            attributes: {
                include: ['ID_TYPE_FOLIO_DOCUMENT', 'ID_NATURE', 'NOM_DOCUMENT'] 
            },
            where: {
                [Op.and]: [{
                    ID_NATURE: ID_NATURE,
                } ]
            },
            order: [['NOM_DOCUMENT', 'DESC']]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Type document",
            result: type
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
    getFlashByChefEquipe,
    getAgentsByProfil,
    saveAgent,
    getFlashByChefEquipeENattante,
    getFlashByAgent,
    getDocuments
}