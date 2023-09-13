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
const Folio_documents = require('../../models/Folio_documents')
const Folio_document_non_enregistres_historiques = require('../../models/Folio_document_non_enregistres_historiques')
const Nature_folio = require('../../models/Nature_folio')


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
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'FOLIO', 'ID_NATURE'],
            where: { ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE },
            include: [{

                model: Flashs,
                as: 'flashindexe',
                required: true,
                attributes: ['ID_FLASH', 'NOM_FLASH']
            }, {
                model: Nature_folio,
                as: 'natures',
                required: false,
                attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
            }]
        })
        var FlashFolios = []
        flashsIndexe.forEach(flash => {
            const ID_FLASH = flash.flashindexe?.ID_FLASH
            const flashs = flash.flashindexe
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
            attributes: [`USERS_ID`, `ID_INSTITUTION`, `NOM`, `PRENOM`, `EMAIL`, `TELEPHONE`, `ID_PROFIL`, `PASSEWORD`, `PHOTO_USER`, `IS_ACTIF`],
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
                ID_FLASH_INDEXE: ID_FLASH
            }
        })
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
        }, {
            where: {
                ID_FLASH_INDEXE: ID_FLASH
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


        whereFilter = {
            ID_ETAPE_FOLIO:
                IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
        }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO',
                    'DATE_INSERTION']
            },
            order: [['DATE_INSERTION', 'DESC']],
            where: {
                [Op.and]: [{
                    USER_TRAITEMENT: req.userId,
                },
                    whereFilter]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO','FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                    'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                    'NUMERO_PARCELLE', 'NOMBRE_DOUBLON', 'LOCALITE', 'ID_ETAPE_FOLIO'],
                include: [{
                    model: Flashs,
                    as: 'flashindexe',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }, {
                    model: Nature_folio,
                    as: 'natures',
                    required: true,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
                }],
                where: whereFilter
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            order: [['DATE_INSERTION', 'DESC']]
        })
        var PvFolios = []
        flashs.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const flash = histo.folio.flashindexe
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
                    flash,
                    users,
                    date,
                    folios: [folio]
                })
            }



        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
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
 * Permet de recuperer les USB des d'un chef d'equipe
 * @author claudine <claudine@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefEquipeENattante = async (req, res) => {
    try {
        var whereFilter = {}
        whereFilter = {
            ID_ETAPE_FOLIO: {
                [Op.in]: [
                    IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                    IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
                    IDS_ETAPES_FOLIO.FOLIO_NO_UPLOADED_EDRMS,
                    IDS_ETAPES_FOLIO.SELECTION_VERIF_EDRMS,
                    IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
                    IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,

                ]
            }
        }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                },
                    whereFilter]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'FOLIO', 'NUMERO_FOLIO', 'ID_NATURE'],
                include: [{
                    model: Flashs,
                    as: 'flashindexe',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }, {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                }],
                where: whereFilter
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            order: [['DATE_INSERTION', 'DESC']]
        })

        var PvFolios = []
        flashs.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const flash = histo.folio.flashindexe
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
                    flash,
                    users,
                    date,
                    folios: [folio]
                })
            }



        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
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
 * Une route  permet  les folio enregistre et  upload
 * de voir  les agents preparation apres retour
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  28/08/2023
 * 
 */
const findAllFolioUpload = async (req, res) => {
    try {
        var whereFilter = {}
        whereFilter = {
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_UPLOAD_CHEF_EQUIPE,
        }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'PV_PATH', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                },
                    whereFilter]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'FOLIO', 'NUMERO_FOLIO', 'ID_NATURE'],
                include: [{
                    model: Flashs,
                    as: 'flashindexe',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }, {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                }],
                where: whereFilter
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            order: [['DATE_INSERTION', 'DESC']]
        })
        var PvFolios = []
        flashs.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const flash = histo.folio.flashindexe
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
                    flash,
                    users,
                    date,
                    folios: [folio]
                })
            }



        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
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
 * Permet de recuperer les  DOCUMENT du  nature DU  DOSSIER
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
                }]
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
/**
 * Permet de recuperer les document du  dossier
 * @author claudine <claudine@mediabox.bi>
 * @date 28/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getDocument = async (req, res) => {
    try {
        const { ID_FOLIO } = req.params
        const type = await Folio_documents.findAll({
            attributes: {
                include: ['ID_FOLIO']
            },
            where: {
                [Op.and]: [{
                    ID_FOLIO: ID_FOLIO,
                }]
            },
            include: [{
                model: Folio_types_documents,
                as: 'types',
                required: true,
                attributes: ['ID_TYPE_FOLIO_DOCUMENT', 'NOM_DOCUMENT']
            }],


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
/**
 * Permet d'inserer les type d'un document  qui est  upload dans EDRMS
 * @author claudine <claudine@mediabox.bi>
 * @date 13/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const saveIsUpload = async (req, res) => {
    try {
        const { ID_FOLIO, TYPE_DOCUMENT } = req.body
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FOLIO: {
                required: true
            },
            TYPE_DOCUMENT: {
                required: true
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
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
            IS_UPLOADED_EDRMS: 1,
        }, {
            where: {
                ID_FOLIO
            }
        })
        typeObjet = JSON.parse(TYPE_DOCUMENT)
        const folio_documents = typeObjet.map(type => {
            return {
                ID_FOLIO: ID_FOLIO,
                ID_TYPE_FOLIO_DOCUMENT: type.ID_TYPE_FOLIO_DOCUMENT,
                USERS_ID: req.userId
            }
        })
        await Folio_documents.bulkCreate(folio_documents)
        await Etapes_folio_historiques.create(
            {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
            }
        )
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Folio  est  verifie avec succes"
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
 * Permet d'inserer les type d'un document  qui est  upload dans EDRMS
 * @author claudine <claudine@mediabox.bi>
 * @date 13/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const saveIsreUpload = async (req, res) => {
    try {
        const { ID_FOLIO, TYPE_DOCUMENT } = req.body
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FOLIO: {
                required: true
            },
            TYPE_DOCUMENT: {
                required: true
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
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
            IS_UPLOADED_EDRMS: 1,
        }, {
            where: {
                ID_FOLIO
            }
        })
        typeObjet = JSON.parse(TYPE_DOCUMENT)
        const folio_documents = typeObjet.map(type => {
            return {
                ID_FOLIO: ID_FOLIO,
                ID_TYPE_FOLIO_DOCUMENT: type.ID_TYPE_FOLIO_DOCUMENT,
                USERS_ID: req.userId
            }
        })
        await Folio_documents.bulkCreate(folio_documents)
        // await Etapes_folio_historiques.create(
        //     {
        //         ID_USER: req.userId,
        //         USER_TRAITEMENT: req.userId,
        //         ID_FOLIO: ID_FOLIO,
        //         ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
        //     }
        // )
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Folio  est  verifie avec succes"
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
const getFolioUpload = async (req, res) => {
    try {
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO',
                    'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    USER_TRAITEMENT: req.userId,
                },
                {
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
                            IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
                        ]
                    }
                }
                ]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                    'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                    'NUMERO_PARCELLE', 'NUMERO_FEUILLE', 'LOCALITE'],
                include: [{
                    model: Flashs,
                    as: 'flashindexe',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                },
                {
                    model: Folio_documents,
                    as: 'documents',
                    required: false,
                    attributes: ['ID_FOLIO_DOCUMENT'],
                    // where: { USERS_ID: req.userId },
                    include: {
                        model: Folio_types_documents,
                        as: 'types',
                        required: false,
                        attributes: ['ID_TYPE_FOLIO_DOCUMENT', 'NOM_DOCUMENT']
                    }
                }],
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
            const ID_FLASH = flash.folio?.flashindexe.ID_FLASH
            const flashs = flash.folio.flashindexe
            const users = flash.traitement
            const date = flash.DATE_INSERTION
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
                    date,
                    folios: [flash]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio upload",
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
 * Permet de recuperer les USB des d'un agent uploadEDRMS
 * @author claudine <claudine@mediabox.bi>
 * @date 10/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFolioInvalide = async (req, res) => {
    try {
        var whereFilter = {}
        whereFilter = {
            ID_ETAPE_FOLIO:
                IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,
        }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO',
                    'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                },
                ]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                where: { ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS },
                attributes: ['ID_FOLIO','FOLIO', 'ID_ETAPE_FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                    'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                    'NUMERO_PARCELLE', 'NUMERO_FEUILLE', 'LOCALITE'],
                include: [{
                    model: Flashs,
                    as: 'flashindexe',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }, 
                    {
                        model:Nature_folio,
                        as: 'natures',
                        required: false,
                        attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    }
                ,
                {
                    model: Folio_documents,
                    as: 'documents',
                    required: false,
                    attributes: ['ID_FOLIO_DOCUMENT'],
                    // where: { USERS_ID: req.userId },
                    include: {
                        model: Folio_types_documents,
                        as: 'types',
                        required: false,
                        attributes: ['ID_TYPE_FOLIO_DOCUMENT', 'NOM_DOCUMENT']
                    }
                }],
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
            const ID_FLASH = flash.folio?.flashindexe.ID_FLASH
            const flashs = flash.folio.flashindexe
            const users = flash.traitement
            const date = flash.DATE_INSERTION
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
                    date,
                    folios: [flash]
                })

            }

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio invalide",
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
 * Permet de recuperer les USB des d'un verificateur
 * @author claudine <claudine@mediabox.bi>
 * @date 14/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFolioUploads = async (req, res) => {
    try {
        var whereFilter = {}
        whereFilter = {
            ID_ETAPE_FOLIO:
                IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
        }
        const flashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO',
                    'DATE_INSERTION']
            },
            where: {
                [Op.and]: [
                    whereFilter]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                where: { ...whereFilter },
                attributes: ['ID_FOLIO', 'FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                    'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                    'NUMERO_PARCELLE', 'NUMERO_FEUILLE', 'LOCALITE'],
                include: [{
                    model: Flashs,
                    as: 'flashindexe',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }, {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                },
                {
                    model: Folio_documents,
                    as: 'documents',
                    required: false,
                    attributes: ['ID_FOLIO_DOCUMENT'],
                    include: {
                        model: Folio_types_documents,
                        as: 'types',
                        required: false,
                        attributes: ['ID_TYPE_FOLIO_DOCUMENT', 'NOM_DOCUMENT']
                    }
                }],
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
            const ID_FLASH = flash.folio?.flashindexe.ID_FLASH
            const flashs = flash.folio.flashindexe
            const users = flash.traitement
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
            message: "Liste des folio upload",
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
 * Permet de recuperer les USB des d'un verificateur
 * @author claudine <claudine@mediabox.bi>
 * @date 14/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const enregistreFolio = async (req, res) => {
    try {
        const { ID_FLASH, FOLIO_ENREGISTRE } = req.body
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH: {
                required: true
            },
            FOLIO_ENREGISTRE: {
                required: true
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

        folioObjet = JSON.parse(FOLIO_ENREGISTRE)
        const folio_enregistres = folioObjet.map(folio => folio.ID_FOLIO)
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
            IS_DOCUMENT_BIEN_ENREGISTRE: 1,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_enregistres
                }
            }
        })
        const folio_historiques_enregi = folioObjet.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_enregi)

        const folios = await Folio.findAll({
            attributes: ['ID_FOLIO'],
            where: {
                [Op.and]: [{
                    ID_FLASH_INDEXE: ID_FLASH,
                },
                {
                    IS_DOCUMENT_BIEN_ENREGISTRE: null
                }, {
                    IS_UPLOADED_EDRMS: 1
                }, {
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS
                },

                ]
            }

        })
        const folio_no_enregistres = folios.map(folio => folio.toJSON().ID_FOLIO)
        await Folio.update({
            IS_DOCUMENT_BIEN_ENREGISTRE: 0,
            IS_UPLOADED_EDRMS: 0,
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,

        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_no_enregistres
                }
            }
        })

        const folio_historiques_no_enregi = folios.map(folio => {
            return {
                ID_USER: req.userId,
                USER_TRAITEMENT: req.userId,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,

            }
        })
        await Etapes_folio_historiques.bulkCreate(folio_historiques_no_enregi)
        const folio_no_enregi = folios.map(folio => {
            return {
                USERS_ID: req.userId,
                ID_FOLIO: folio.ID_FOLIO,
            }
        })
        await Folio_document_non_enregistres_historiques.bulkCreate(folio_no_enregi)
        await Folio_documents.destroy(
            {
                where: {
                    ID_FOLIO: {
                        [Op.in]: folio_no_enregistres
                    }
                }
            }
        )

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio upload",
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
 * Permet de recuperer les folio enregistre
 * @author claudine <claudine@mediabox.bi>
 * @date 14/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFolioEnregistre = async (req, res) => {
    try {
        var whereFilter = {}
        whereFilter = {
            ID_ETAPE_FOLIO:
                IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
        }
        const folios = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO',
                    'DATE_INSERTION']
            },
            where: {
                [Op.and]: [whereFilter,
                    { ID_USER: req.userId },
                    { USER_TRAITEMENT: req.userId }
                ]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                    'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                    'NUMERO_PARCELLE', 'NUMERO_FEUILLE', 'LOCALITE'],
                include: {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                }
            }],
            order: [['DATE_INSERTION', 'DESC']]
        })
   
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio enregistre",
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
 * Permet de recuperer les folio no enregistre
 * @author claudine <claudine@mediabox.bi>
 * @date 14/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFolioNoEnregistre = async (req, res) => {
    try {
        var whereFilter = {}
        whereFilter = {
            ID_ETAPE_FOLIO:
                IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,
        }
        const folios = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO',
                    'DATE_INSERTION']
            },
            where: {
                [Op.and]: [
                    { ...whereFilter },
                    { ID_USER: req.userId },
                ]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                where:
                    { ...whereFilter },
                attributes: ['ID_FOLIO','FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                    'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                    'NUMERO_PARCELLE', 'NUMERO_FEUILLE', 'LOCALITE'],
                    include: {
                        model:Nature_folio,
                        as: 'natures',
                        required: false,
                        attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    },
            }],
            
            order: [['DATE_INSERTION', 'DESC']]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio no enregistre",
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
 * Permet d'enregistrer le retour entre agent  upload  et le chef d'equipe
 * @author claudine <claudine@mediabox.bi>
 * @date 24/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const retourAgentUpload = async (req, res) => {
    try {
        const userId = req.userId
        const { AGENT_UPLOAD, ID_FLASH } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH: {
                required: true
            },
            pv: {
                image: 4000000
            },
            AGENT_UPLOAD: {
                required: true
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
        const foliosEnregistre = await Folio.findAll({
            attributes: ['ID_FOLIO'],
            where: {
                ID_FLASH_INDEXE: ID_FLASH,
                IS_UPLOADED_EDRMS: 1,
                IS_DOCUMENT_BIEN_ENREGISTRE: 1,
            }
        })
        // update des folios indexes
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_UPLOAD_CHEF_EQUIPE
        }, {
            where: {
                ID_FLASH_INDEXE: ID_FLASH,
                IS_UPLOADED_EDRMS: 1,
                IS_DOCUMENT_BIEN_ENREGISTRE: 1,

            }
        })
        const pvUpload = new VolumePvUpload()
        const { fileInfo } = await pvUpload.upload(pv, false)
        const PV_PATH = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${fileInfo.fileName}`
        const etapes_folio_historiques = foliosEnregistre.map(folio => {
            return {
                ID_USER: userId,
                USER_TRAITEMENT: AGENT_UPLOAD,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_UPLOAD_CHEF_EQUIPE,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent upload enregisté avec succes"
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
const check = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        var whereFilter = {}

        whereFilter = {
            ID_ETAPE_FOLIO: {
                [Op.in]: [
                    IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
                    // IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,
                ]
            }
        }
        const flashs = await Folio.findAll({
            required: true,
            attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'ID_NATURE',
                'NOM_PROPRIETAIRE', 'PRENOM_PROPRIETAIRE', 'NUMERO_FEUILLE',
                'NUMERO_PARCELLE', 'NUMERO_FEUILLE', 'LOCALITE'],
            where: {
                [Op.and]: [
                    { ID_FLASH_INDEXE: ID_FLASH },
                    {
                        ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS
                    },
                    {
                        IS_UPLOADED_EDRMS: 1
                    },
                    {
                        IS_DOCUMENT_BIEN_ENREGISTRE: 1,
                    }

                ]
            },
            order: [['DATE_INSERTION', 'DESC']]
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
            result: flashs
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
const getPvsAgentUpload = async (req, res) => {
    try {
        const { AGENT_UPLOAD, folioIds } = req.body
        const IdsObjet = JSON.parse(folioIds)
        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],

            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                }, {
                    ID_USER: req.userId
                }, {
                    USER_TRAITEMENT: AGENT_UPLOAD
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
            message: "PV D'un agent  upload EDRMS",
            result:
                pv.toJSON()
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
    getDocuments,
    saveIsUpload,
    getFolioUpload,
    getFolioUploads,
    enregistreFolio,
    getFolioEnregistre,
    retourAgentUpload,
    getFolioNoEnregistre,
    check,
    getDocument,
    findAllFolioUpload,
    getPvsAgentUpload,
    getFolioInvalide,
    saveIsreUpload
}