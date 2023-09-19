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
const Nature_folio = require('../../models/Nature_folio')
const Etapes_folio = require('../../models/Etapes_folio')

/**
 * Permet de recuperer les folio qui ont un etape quelconque
 * @author darcydev <darcy@mediabox.bi>
 * @date 31/07/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFolioByEtapes = async (req, res) => {
    try {
        const { ID_ETAPE_FOLIO } = req.params
        const folios = await Folio.findAll({
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: {[Op.in]:[
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                        IDS_ETAPES_FOLIO.REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING
                    ]
                    }
                }, {
                    IS_RECONCILIE: 1
                }, {
                    IS_VALIDE: 1
                }]
            },
            include: {
                model: Nature_folio,
                as: 'natures',
                required: false,
                attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio d'une etape",
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
 * Permet de recuperer les folio qui ont un etape quelconque
 * @author darcydev <darcy@mediabox.bi>
 * @date 01/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashs = async (req, res) => {
    try {
        const flashs = await Flashs.findAll({
            where: {
                IS_DISPO: 1
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flashs disponibles",
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

/**
 * Permet de recuperer les agents sup aile indexations
 * @author darcydev <darcy@mediabox.bi>
 * @date 01/08/2023
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
            message: "Liste des agents sup aile indexations",
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
 * Permet d'enregistrer l'agent sup aile indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const saveAgentSupAile = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH, ID_SUP_AILE_INDEXATION, folios: foliosStr } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH: {
                required: true
            },
            ID_SUP_AILE_INDEXATION: {
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
        const folios = JSON.parse(foliosStr)
        await Flashs.update({
            IS_DISPO: 0
        }, {
            where: {
                ID_FLASH: ID_FLASH
            }
        })
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION,
            ID_FLASH
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folios
                }
            }
        })
        const pvUpload = new VolumePvUpload()
        const { fileInfo } = await pvUpload.upload(pv, false)
        const PV_PATH = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${fileInfo.fileName}`
        const etapes_folio_historiques = folios.map(folio => {
            return {
                ID_USER: userId,
                USER_TRAITEMENT: ID_SUP_AILE_INDEXATION,
                ID_FOLIO: folio,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent sup. aile indexation enregisté avec succes"
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
const saveChefPlateau = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH, ID_CHEF_PLATEAU_INDEXATION } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH: {
                required: true
            },
            ID_CHEF_PLATEAU_INDEXATION: {
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
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
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
                USER_TRAITEMENT: ID_CHEF_PLATEAU_INDEXATION,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
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
 * Permet d'enregistrer un agent d'indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 03/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const saveAgentIndexation = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH, ID_AGENT_INDEXATION } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH: {
                required: true
            },
            ID_AGENT_INDEXATION: {
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
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
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
                USER_TRAITEMENT: ID_AGENT_INDEXATION,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent indexation enregisté avec succes"
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
 * Permet d'enregistrer indexes par un agent d'indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 03/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const retourAgentIndexation = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH, ID_FLASH_INDEXES, foliosIndexesIds: foliosIndexesIdsStr, ID_AGENT_INDEXATION } = req.body
        const { pv } = req.files || {}
        const foliosIndexesIds = JSON.parse(foliosIndexesIdsStr)
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH_INDEXES: {
                required: true
            },
            pv: {
                image: 4000000
            },
            ID_AGENT_INDEXATION: {
                required: true
            }
        })
        if (!foliosIndexesIds || foliosIndexesIds.length == 0) {
            validation.setError('foliosIndexesIds', "Les folios sont obligatoire")
        }
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

        await Flashs.update({
            IS_DISPO: 0
        }, {
            where: {
                ID_FLASH: ID_FLASH_INDEXES
            }
        })

        // update des folios indexes
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
            IS_INDEXE: 1,
            ID_FLASH_INDEXE: ID_FLASH_INDEXES
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: foliosIndexesIds
                }
            }
        })
        const pvUpload = new VolumePvUpload()
        const { fileInfo } = await pvUpload.upload(pv, false)
        const PV_PATH = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${fileInfo.fileName}`
        const etapes_folio_historiques = foliosIndexesIds.map(folioId => {
            return {
                ID_USER: userId,
                USER_TRAITEMENT: ID_AGENT_INDEXATION,
                ID_FOLIO: folioId,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent indexation enregisté avec succes"
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
 * Permet de recuperer les les USB qui sont attribues a un agent sup. aile indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashBySupAile = async (req, res) => {
    try {
        const { precision } = req.query
        var whereFilter = {
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION
        }
        if (precision == 'ettente_retour') {
            var whereFilter = {
                ID_ETAPE_FOLIO: {
                    [Op.in]: [
                        IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
                    ]
                }
            }
        } else if (precision == 'valides') {
            var whereFilter = {
                ID_ETAPE_FOLIO: {
                    [Op.notIn]: [
                        IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
                    ]
                }
            }
        }
        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                USER_TRAITEMENT: req.userId
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    ...whereFilter
                },
                include: {
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })
        var PvFolios = []
        allFlashs.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const flash = histo.folio.flash
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
            message: "Liste des flash indexés",
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
 * Permet de recuperer les les USB qui sont attribues a un chef plateau
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashBySupAileENattante = async (req, res) => {
    try {
        var whereFilter = {
            ID_ETAPE_FOLIO: {
                [Op.in]: [
                    IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                    IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                    IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
                ]
            }
        }
        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                ID_USER: req.userId
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    ...whereFilter
                },
                include: [{
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }],
            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })
        var PvFolios = []
        allFlashs.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const flash = histo.folio.flash
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
            message: "Liste des flash indexés",
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
 * Permet de recuperer les les USB qui sont retourne par un chef plateau
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashBySupAileValide = async (req, res) => {
    try {

        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    [Op.and]: [{
                        IS_INDEXE: 1
                    }]
                },
                include: [
                    {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                    {
                        model: Flashs,
                        as: 'flashindexe',
                        required: false,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    }
                ]

            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })

        var FlashFoliosIndexe = []
        allFlashs.forEach(folio => {
            const flash = folio.folio.flashindexe
            const ID_FLASH = folio.folio.flashindexe.ID_FLASH
            const flashInitial = folio.folio.flash
            const fol = folio
            const date = folio.DATE_INSERTION
            const isExists = FlashFoliosIndexe.find(flash => flash.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const allflash = FlashFoliosIndexe.find(flas => flas.ID_FLASH == ID_FLASH)
                const newFlashs = { ...allflash, folios: [...allflash.folios, folio] }
                FlashFoliosIndexe = FlashFoliosIndexe.map(fla => {
                    if (fla.ID_FLASH == ID_FLASH) {
                        return newFlashs
                    } else {
                        return fla
                    }
                })
            }
            else {
                FlashFoliosIndexe.push({
                    ID_FLASH,
                    date,
                    flash,
                    flashInitial,
                    folios: [fol]
                })
            }
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe",
            result: FlashFoliosIndexe
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
 * Permet de recuperer les les USB qui sont retourne par un chef plateau
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefEquipeValide = async (req, res) => {
    try {

        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    [Op.and]: [{
                        IS_INDEXE: 1
                    }]
                },
                include: [
                    {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                    {
                        model: Flashs,
                        as: 'flashindexe',
                        required: false,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    }
                ]

            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })

        var FlashFoliosIndexe = []
        allFlashs.forEach(folio => {
            const flash = folio.folio.flashindexe
            const ID_FLASH = folio.folio.flashindexe.ID_FLASH
            const flashInitial = folio.folio.flash
            const fol = folio
            const date = folio.DATE_INSERTION
            const isExists = FlashFoliosIndexe.find(flash => flash.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const allflash = FlashFoliosIndexe.find(flas => flas.ID_FLASH == ID_FLASH)
                const newFlashs = { ...allflash, folios: [...allflash.folios, folio] }
                FlashFoliosIndexe = FlashFoliosIndexe.map(fla => {
                    if (fla.ID_FLASH == ID_FLASH) {
                        return newFlashs
                    } else {
                        return fla
                    }
                })
            }
            else {
                FlashFoliosIndexe.push({
                    ID_FLASH,
                    date,
                    flash,
                    flashInitial,
                    folios: [fol]
                })
            }
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des flash indexe pour  chef equipe",
            result: FlashFoliosIndexe
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
 * Permet de recuperer les USB retourne par un chef d'equipe
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefEquipe = async (req, res) => {
    try {
        const { precision } = req.query
        var whereFilter = {
            ID_ETAPE_FOLIO: {
                [Op.in]: [
                    IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION,
                    IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                    IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                    IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                    IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
                ]
            }
        }
        if (precision == 'valides') {
            var whereFilter = {
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
        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                },
                precision == 'valides' ? whereFilter : {}]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                include: {
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                where: precision == 'valides' ? {} : whereFilter
            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })



        const allFlash = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_USER: req.userId,
                },
                precision == 'valides' ? whereFilter : {}]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'ID_NATURE'],
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
        // const uniqueIds = [];
        // const uniqueFlashs = allFlashs.filter(element => {
        //     const isDuplicate = uniqueIds.includes(element.folio.flash.ID_FLASH);
        //     if (!isDuplicate) {
        //         uniqueIds.push(element.folio.flash.ID_FLASH);
        //         return true;
        //     }
        //     return false;
        // });
        // const flashs = await Promise.all(uniqueFlashs.map(async flashObject => {
        //     const flash = flashObject.toJSON()
        //     const folioCounts = await Folio.count({
        //         where: {
        //             ID_FLASH: flash.folio.flash.ID_FLASH
        //         }
        //     })
        //     return {
        //         ...flash,
        //         folioCounts
        //     }
        // }))
        var PvFolios = []
        allFlashs.forEach(histo => {
            const PV_PATH = histo.PV_PATH
            const flash = histo.folio.flash
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
            message: "Liste des flash indexés",
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
 * Permet de recuperer les les USB qui sont attribues a un chef plateau indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 03/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefPlateauIndexation = async (req, res) => {
    try {
        var ID_ETAPE_FOLIO = IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION
        var whereFilter = {
            ID_ETAPE_FOLIO: ID_ETAPE_FOLIO
        }
        var filterUser = {
            USER_TRAITEMENT: req.userId
        }
        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                ...filterUser
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    ...whereFilter
                },
                include: [{
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                {
                    model: Flashs,
                    as: 'flashindexe',
                    required: false,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }
                ]

            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })
        const uniqueIds = [];
        const uniqueFlashs = allFlashs.filter(element => {
            const isDuplicate = uniqueIds.includes(element.folio.flash.ID_FLASH);
            if (!isDuplicate) {
                uniqueIds.push(element.folio.flash.ID_FLASH);
                return true;
            }
            return false;
        });
        const flashs = await Promise.all(uniqueFlashs.map(async flashObject => {
            const flash = flashObject.toJSON()
            const folioCounts = await Folio.count({
                where: {
                    ID_FLASH: flash.folio.flash.ID_FLASH
                }
            })
            return {
                ...flash,
                folioCounts
            }
        }))
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
/**
 * Permet de recuperer les les USB qui sont en attante de retour
 * @author darcydev <darcy@mediabox.bi>
 * @date 03/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefPlateauEnAttante = async (req, res) => {
    try {
        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    [Op.and]: [{
                        ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                    },
                    { IS_INDEXE: null }
                    ]
                },
                include: [{
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                {
                    model: Flashs,
                    as: 'flashindexe',
                    required: false,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }
                ]

            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })
        const uniqueIds = [];
        const uniqueFlashs = allFlashs.filter(element => {
            const isDuplicate = uniqueIds.includes(element.folio.flash.ID_FLASH);
            if (!isDuplicate) {
                uniqueIds.push(element.folio.flash.ID_FLASH);
                return true;
            }
            return false;
        });
        const flashs = await Promise.all(uniqueFlashs.map(async flashObject => {
            const flash = flashObject.toJSON()
            const folioCounts = await Folio.count({
                where: {
                    [Op.and]: [{
                        ID_FLASH: flash.folio.flash.ID_FLASH
                    }, {
                        IS_INDEXE: null
                    }]
                },
            })
            return {
                ...flash,
                folioCounts
            }
        }))
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
/**
 * Permet de recuperer les les USB qui est valide par  un chef plateau indexation
 * @author NDAYSISABA claudine <claudine@mediabox.bi>
 * @date 31/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashByChefPlateauValides = async (req, res) => {
    try {

        const allFlashs = await Etapes_folio_historiques.findAll({
            attributes: {
                include: ['ID_FOLIO_HISTORIQUE', 'ID_FOLIO', 'DATE_INSERTION']
            },
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO', 'ID_FLASH'],
                where: {
                    [Op.and]: [{
                        IS_INDEXE: 1
                    }]
                },
                include: [{
                    model: Flashs,
                    as: 'flash',
                    required: true,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                },
                {
                    model: Flashs,
                    as: 'flashindexe',
                    required: false,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }
                ]

            }, {
                model: Users,
                as: 'user',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }],
            // group: ['folio->flash.ID_FLASH'],
            order: [['DATE_INSERTION', 'DESC']]
        })
        // const uniqueIds = [];
        // const uniqueFlashs = allFlashs.filter(element => {
        //     const isDuplicate = uniqueIds.includes(element.folio.flash.ID_FLASH);
        //     if (!isDuplicate) {
        //         uniqueIds.push(element.folio.flash.ID_FLASH);
        //         return true;
        //     }
        //     return false;
        // });
        // const flashs = await Promise.all(uniqueFlashs.map(async flashObject => {
        //     const flash = flashObject.toJSON()
        //     const folioCounts = await Folio.count({
        //         where: {
        //             ID_FLASH: flash.folio.flash.ID_FLASH
        //         }
        //     })
        //     return {
        //         ...flash,
        //         folioCounts
        //     }
        // }))

        var PvFolios = []
        allFlashs.forEach(histo => {
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
 * Permet de recuperer les details d'une cle USB
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashDetail = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const flash = (await Flashs.findOne({
            where: {
                ID_FLASH
            },
            include: [{
                model: Folio,
                as: 'folios',
                required: false,
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE"]
            }]
        })).toJSON()


        const folios = (await Folio.findAll({
            attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "IS_INDEXE", "ID_ETAPE_FOLIO"],
            where: {
                IS_INDEXE: 1,
                ID_FLASH: ID_FLASH,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
            },
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
        }))
        var FlashFoliosIndexe = []
        folios.forEach(folio => {
            const flash = folio.flashindexe
            const ID_FLASH = folio.flashindexe.ID_FLASH
            const fol = folio

            const isExists = FlashFoliosIndexe.find(flash => flash.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const allflash = FlashFoliosIndexe.find(flas => flas.ID_FLASH == ID_FLASH)
                const newFlashs = { ...allflash, folios: [...allflash.folios, folio] }
                FlashFoliosIndexe = FlashFoliosIndexe.map(fla => {
                    if (fla.ID_FLASH == ID_FLASH) {
                        return newFlashs
                    } else {
                        return fla
                    }
                })
            }
            else {
                FlashFoliosIndexe.push({
                    ID_FLASH,
                    flash,
                    folios: [fol]
                })
            }
        })
        const agentIndexation = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }, {
                    ID_FOLIO: flash.folios[0].ID_FOLIO
                }]
            },
            include: [{
                model: Users,
                as: 'traitement',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        const agentIndexationRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO'],
                where: {
                    [Op.and]: [{
                        ID_FOLIO: flash.folios[0].ID_FOLIO,
                    }, {
                        IS_INDEXE: 1
                    }]
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        var foliosIndexes = []
        if (agentIndexationRetour) {
            foliosIndexes = await Folio.findAll({
                attributes: ['ID_FLASH', 'IS_INDEXE', 'ID_FOLIO', 'NUMERO_FOLIO', 'ID_FLASH_INDEXE'],
                where: {
                    [Op.and]: [{
                        ID_FLASH: ID_FLASH,
                    }, {
                        IS_INDEXE: 1
                    }]
                },
                include: [{
                    model: Flashs,
                    as: 'flash',
                    required: false,
                    attributes: ['ID_FLASH', 'NOM_FLASH']
                }, {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                }
                ]
            })
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Detail d'un flash",
            result: {
                ...flash,
                agentIndexation,
                agentIndexationRetour,
                foliosIndexes,
                FlashFoliosIndexe
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
/**
 * Permet de recuperer les details d'une cle USB valide
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashDetailValide = async (req, res) => {
    try {
        const { ID_FLASH } = req.params

        const folios = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ["ID_FOLIO","FOLIO", "NUMERO_FOLIO", "ID_NATURE"],
                    where: {
                        IS_INDEXE: 1,
                        ID_FLASH_INDEXE: ID_FLASH,
                    },
                    include: [{
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    }, {
                        model: Nature_folio,
                        as: 'natures',
                        required: false,
                        attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    }],
                }]
        })
        const folio_ids = folios.map(folio => folio.folio.ID_FOLIO)
        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }, {
                    ID_FOLIO: { [Op.in]: folio_ids }
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO'],
                    include: [{
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    }, {
                        model: Nature_folio,
                        as: 'natures',
                        required: false,
                        attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    }],
                }, {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM']
                }]
        })
        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                }, {
                    ID_FOLIO: { [Op.in]: folio_ids }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                required: true,
                attributes: ['ID_FOLIO'],
                where: {
                    [Op.and]: [{
                        ID_FOLIO: { [Op.in]: folio_ids },
                    }, {
                        IS_INDEXE: 1
                    }]
                },
                include:{
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Detail d'un flash",
            result: {
                folios,
                pv,
                pvRetour,
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

/**
 * Permet de recuperer les details d'une cle USB valide
 * @author darcydev <darcy@mediabox.bi>
 * @date 02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFlashDetailEnattente = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const flash = (await Flashs.findOne({
            where: {
                ID_FLASH
            },
            include: [{
                model: Folio,
                as: 'folios',
                required: false,
                where: {

                    IS_INDEXE: null
                },
                attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE"],
                include: {
                    model: Nature_folio,
                    as: 'natures',
                    required: false,
                    attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                }
            }]
        })).toJSON()
        const agentIndexation = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }, {
                    ID_FOLIO: flash.folios[0].ID_FOLIO
                }]
            },
            include: [{
                model: Users,
                as: 'traitement',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Detail d'un flash",
            result: {
                ...flash,
                agentIndexation,
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


/**
 * Permet de recupere le chef de plateau d'une cle USB
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashChefPlateau = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const chefPlateau = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        const retour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef de plateau de la cle USB",
            result: {
                ...chefPlateau.toJSON(),
                retour: retour ? retour.toJSON() : null
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
/**
 * Permet de recupere le chef de plateau d'une cle USB
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashSupAileRetour = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const folios = (await Folio.findAll({
            attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "IS_INDEXE", "ID_ETAPE_FOLIO"],
            where: {
                IS_INDEXE: 1,
                ID_FLASH: ID_FLASH,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
            },
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
        }))
        var FlashFoliosIndexe = []
        folios.forEach(folio => {
            const flash = folio.flashindexe
            const ID_FLASH = folio.flashindexe.ID_FLASH
            const fol = folio

            const isExists = FlashFoliosIndexe.find(flash => flash.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const allflash = FlashFoliosIndexe.find(flas => flas.ID_FLASH == ID_FLASH)
                const newFlashs = { ...allflash, folios: [...allflash.folios, folio] }
                FlashFoliosIndexe = FlashFoliosIndexe.map(fla => {
                    if (fla.ID_FLASH == ID_FLASH) {
                        return newFlashs
                    } else {
                        return fla
                    }
                })
            }
            else {
                FlashFoliosIndexe.push({
                    ID_FLASH,
                    flash,
                    folios: [fol]
                })
            }
        })

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO'],
                    include: {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                }, {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM']
                }]
        })









        const chefPlateau = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })

        const retour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef de plateau de la cle USB",
            result: {
                FlashFoliosIndexe,
                pv
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

/**
 * Permet de recupere le chef de plateau d'une cle USB
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashChefPlateauRetour = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const folios = (await Folio.findAll({
            attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "IS_INDEXE", "ID_ETAPE_FOLIO"],
            where: {
                IS_INDEXE: 1,
                ID_FLASH: ID_FLASH,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU
            },
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
        }))
        var FlashFoliosIndexe = []
        folios.forEach(folio => {
            const flash = folio.flashindexe
            const ID_FLASH = folio.flashindexe.ID_FLASH
            const fol = folio

            const isExists = FlashFoliosIndexe.find(flash => flash.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const allflash = FlashFoliosIndexe.find(flas => flas.ID_FLASH == ID_FLASH)
                const newFlashs = { ...allflash, folios: [...allflash.folios, folio] }
                FlashFoliosIndexe = FlashFoliosIndexe.map(fla => {
                    if (fla.ID_FLASH == ID_FLASH) {
                        return newFlashs
                    } else {
                        return fla
                    }
                })
            }
            else {
                FlashFoliosIndexe.push({
                    ID_FLASH,
                    flash,
                    folios: [fol]
                })
            }
        })

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO'],
                    include: {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                }, {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM']
                }]
        })









        const chefPlateau = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })

        const retour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef de plateau de la cle USB",
            result: {
                FlashFoliosIndexe,
                pv
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

/**
 * Permet de recupere le chef equipe d'une cle USB des dossiers indexes
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashChefEquipeRetour = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const folios = (await Folio.findAll({
            attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE", "IS_INDEXE", "ID_ETAPE_FOLIO"],
            where: {
                IS_INDEXE: 1,
                ID_FLASH: ID_FLASH,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
            },
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
        }))
        var FlashFoliosIndexe = []
        folios.forEach(folio => {
            const flash = folio.flashindexe
            const ID_FLASH = folio.flashindexe.ID_FLASH
            const fol = folio

            const isExists = FlashFoliosIndexe.find(flash => flash.ID_FLASH == ID_FLASH) ? true : false
            if (isExists) {
                const allflash = FlashFoliosIndexe.find(flas => flas.ID_FLASH == ID_FLASH)
                const newFlashs = { ...allflash, folios: [...allflash.folios, folio] }
                FlashFoliosIndexe = FlashFoliosIndexe.map(fla => {
                    if (fla.ID_FLASH == ID_FLASH) {
                        return newFlashs
                    } else {
                        return fla
                    }
                })
            }
            else {
                FlashFoliosIndexe.push({
                    ID_FLASH,
                    flash,
                    folios: [fol]
                })
            }
        })

        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO'],
                    include: {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                }, {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM']
                }]
        })


        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef de plateau de la cle USB",
            result: {
                FlashFoliosIndexe,
                pv
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
/**
 * Permet de recupere le chef de plateau d'une cle USB
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashChefPlateauValide = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const folios = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ["ID_FOLIO", "NUMERO_FOLIO", "ID_NATURE"],
                    where: {
                        IS_INDEXE: 1,
                        ID_FLASH_INDEXE: ID_FLASH,
                    },
                    include: {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                }]
        })
        const folio_ids = folios.map(folio => folio.folio.ID_FOLIO)
        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION
                }, {
                    ID_FOLIO: { [Op.in]: folio_ids }
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO'],
                    include: {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                }, {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM']
                }]
        })


        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE
                },
                {
                    ID_FOLIO: { [Op.in]: folio_ids }
                }]
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef de plateau de la cle USB",
            result: {
                folios,
                pv,
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

/**
 * Permet de recupere de recupere les details  d'une cle USB valide par un chef equipe
 * @author darcydev <darcy@mediabox.bi>
 * @date 9/09/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashChefEquipeValide = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const folios = await Etapes_folio_historiques.findAll({
            attributes: ['ID_FOLIO_HISTORIQUE'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE
                }, {
                    ID_USER: req.userId
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ["ID_FOLIO", "FOLIO", "NUMERO_FOLIO", "ID_NATURE"],
                    where: {
                        IS_INDEXE: 1,
                        ID_FLASH_INDEXE: ID_FLASH,
                    },
                    include: [{
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                    {
                        model: Nature_folio,
                        as: 'natures',
                        required: false,
                        attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION'],
                    }

                    ],
                }]
        })
        const folio_ids = folios.map(folio => folio.folio.ID_FOLIO)
        const pv = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION
                }, {
                    ID_FOLIO: { [Op.in]: folio_ids }
                }]
            },
            include: [
                {
                    model: Folio,
                    as: 'folio',
                    required: true,
                    attributes: ['ID_FOLIO'],
                    include: {
                        model: Flashs,
                        as: 'flash',
                        required: true,
                        attributes: ['ID_FLASH', 'NOM_FLASH']
                    },
                }, {
                    model: Users,
                    as: 'traitement',
                    required: false,
                    attributes: ['USERS_ID', 'NOM', 'PRENOM']
                }]
        })


        const pvRetour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'PV_PATH', 'DATE_INSERTION', 'USER_TRAITEMENT'],
            where: {
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE
                },
                {
                    ID_FOLIO: { [Op.in]: folio_ids }
                }]
            },

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Chef de plateau de la cle USB",
            result: {
                folios,
                pv,
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

/**
 * Permet de recuperer un sup aile indexation d'une cle USB
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFrashSupAileIndexation = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const supAile = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        const retour = await Etapes_folio_historiques.findOne({
            attributes: ['ID_FOLIO_HISTORIQUE', 'USER_TRAITEMENT', 'PV_PATH', 'DATE_INSERTION'],
            where: {
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE
            },
            include: [{
                model: Folio,
                required: true,
                as: 'folio',
                attributes: ['ID_FOLIO'],
                where: {
                    ID_FLASH
                }
            }, {
                model: Users,
                as: 'traitement',
                required: true,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']
            }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Sup aile indexation de la cle USB",
            result: {
                ...supAile.toJSON(),
                retour: retour ? retour.toJSON() : null
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

/**
 * Permet d'enregistrer le retour entre le chef de plateau et le sup. aile indexation
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const retourChefPlateau = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH_INDEXE, ID_CHEF_PLATEAU } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH_INDEXE: {
                required: true
            },
            ID_CHEF_PLATEAU: {
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
                ID_FLASH: ID_FLASH_INDEXE,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                IS_INDEXE: 1
            }
        })
        const folio_ids = folios.map(folio => folio.ID_FOLIO)
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_ids
                }
            }
        })
        const pvUpload = new VolumePvUpload()
        const { fileInfo } = await pvUpload.upload(pv, false)
        const PV_PATH = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${fileInfo.fileName}`
        const etapes_folio_historiques = folios.map(folio => {
            return {
                ID_USER: userId,
                USER_TRAITEMENT: ID_CHEF_PLATEAU,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent indexation enregisté avec succes"
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
 * Permet d'enregistrer le retour entre le sup aile indexation et le chef d'equipe
 * @author darcydev <darcy@mediabox.bi>
 * @date 04/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const retourSupAileIndexation = async (req, res) => {
    try {
        const userId = req.userId
        const { ID_FLASH_INDEXE, ID_SUP_AILE_INDEXATION } = req.body
        const { pv } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files || {} }, {
            ID_FLASH_INDEXE: {
                required: true
            },
            ID_SUP_AILE_INDEXATION: {
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
                ID_FLASH: ID_FLASH_INDEXE,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE,
                IS_INDEXE: 1
            }
        })
        const folio_ids = folios.map(folio => folio.ID_FOLIO)
        await Folio.update({
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE,
        }, {
            where: {
                ID_FOLIO: {
                    [Op.in]: folio_ids
                }
            }
        })
        const pvUpload = new VolumePvUpload()
        const { fileInfo } = await pvUpload.upload(pv, false)
        const PV_PATH = `${req.protocol}://${req.get("host")}${IMAGES_DESTINATIONS.pv}/${fileInfo.fileName}`
        const etapes_folio_historiques = folios.map(folio => {
            return {
                ID_USER: userId,
                USER_TRAITEMENT: ID_SUP_AILE_INDEXATION,
                ID_FOLIO: folio.ID_FOLIO,
                ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE,
                PV_PATH
            }
        })
        await Etapes_folio_historiques.bulkCreate(etapes_folio_historiques)
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Agent indexation enregisté avec succes"
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
    getFolioByEtapes,
    getFlashs,
    getAgentsByProfil,
    saveAgentSupAile,
    getFlashBySupAile,
    getFlashDetail,
    saveChefPlateau,
    getFlashByChefPlateauIndexation,
    saveAgentIndexation,
    retourAgentIndexation,
    getFrashChefPlateau,
    retourChefPlateau,
    getFlashByChefEquipe,
    getFrashSupAileIndexation,
    retourSupAileIndexation,
    getFlashBySupAileENattante,
    getFlashBySupAileValide,
    getFlashByChefPlateauEnAttante,
    getFlashByChefPlateauValides,
    getFlashDetailValide,
    getFlashDetailEnattente,
    getFrashChefPlateauRetour,
    getFrashChefPlateauValide,
    getFrashChefEquipeRetour,
    getFlashByChefEquipeValide,
    getFrashChefEquipeValide
}