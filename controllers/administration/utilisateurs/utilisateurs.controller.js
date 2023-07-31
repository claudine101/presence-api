const express = require("express")

const RESPONSE_CODES =require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const { query } = require('../../../utils/db')
// const { EMPTY } = require("sqlite3")
// const ETAPES_STATUTS = require("../../../constants/ETAPES_STATUTS")
const IMAGES_DESTINATIONS = require("../../../constants/IMAGES_DESTINATIONS")
const UserUpload = require("../../../class/uploads/UserUpload")
const Users = require("../../../models/Users")
const md5 = require("md5")
const Profils = require("../../../models/Profils")

/**
 * Permet d'enregistrer un utilisateur
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 31/07/2023
 */
const createuser = async (req, res) => {
    try {
        const { NOM, PRENOM, EMAIL, TELEPHONE, ID_PROFIL, PASSEWORD,IS_ACTIF } = req.body
        const files = req.files || {}
        const { PHOTO_USER } = files
        const data = { ...req.body, ...req.files }
        const validation = new Validation(data, {
            NOM: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            PRENOM: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            PASSWORD: {
                required: true,
                alpha: true
            },
            EMAIL: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            TELEPHONE: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            ID_PROFIL: {
                required: true,
                number: true,
                exists: "profils,ID_PROFIL"
            },
           
            PHOTO_USER: {
                required: true,
                image: 4000000
            }
            

        })
     
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        const photoUpload = new UserUpload()
        const { fileInfo } = await photoUpload.upload(PHOTO_USER, false)
        const filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.photousers}/${fileInfo.fileName}`

        const creptePswd = md5(PASSEWORD);
        const user = await Users.create({
            NOM, 
            PRENOM, 
            EMAIL, 
            TELEPHONE, 
            ID_PROFIL, 
            PASSEWORD:creptePswd,
            PHOTO_USER:filename,
            IS_ACTIF:0
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "L'utilisateur est bien enregistré avec succes",
            result: user
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
 * Permet de faire une modification d'un utilisateur 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 31/07/2023
 */
const Updateuser = async (req, res) => {
    try {
        const { USERS_ID } = req.params
        const { NOM, PRENOM, EMAIL, TELEPHONE, ID_PROFIL, PASSEWORD,IS_ACTIF} = req.body

        const files = req.files || {}
        const { PHOTO_USER } = files
        const usertObject = await Users.findByPk(USERS_ID, {
            attributes: ["PHOTO_USER", "USERS_ID"]
        })
        const user = usertObject.toJSON()

        const data = { ...req.body, ...req.files }
        // const data = { ...req.body }
        const validation = new Validation(data, {
            NOM: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            PRENOM: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            PASSWORD: {
                required: true,
                alpha: true
            },
            EMAIL: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            TELEPHONE: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            ID_PROFIL: {
                required: true,
                number: true,
                exists: "profils,ID_PROFIL"
            },
           
            PHOTO_USER: {
                required: true,
                image: 4000000
            }

        })
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        var filename
        if (PHOTO_USER) {
            const userUpload = new UserUpload()
            const { fileInfo } = await userUpload.upload(PHOTO_USER, false)
            filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.photousers}/${fileInfo.fileName}`
        }

        const ctptage=md5(PASSEWORD)
        const userUpdate = await Users.update({
            NOM, 
            PRENOM, 
            EMAIL, 
            TELEPHONE,
            ID_PROFIL, 
            PASSEWORD:ctptage,
            PHOTO_USER: filename ? filename : user.PHOTO_USER
        }, {
            where: {
                USERS_ID: USERS_ID
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "L'utilisateur  a bien été modifie avec succes",
            result: userUpdate
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
 * Permet de recuperer un utilisateur 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 31/07/2023
 */

const findOneuser = async (req, res) => {
    try {
        const { USERS_ID } = req.params
        const userone = await Users.findOne({
            where: {
                USERS_ID
            },
            include: [{
                model: Profils,
                as: 'profile',
                required: false,
                attributes: ['ID_PROFIL', 'DESCRIPTION']

            }
           ]
        })
        if (userone) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "L'utilisateur trouvee",
                result: payementone
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "L'utilisateur non trouve",
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
 * Permet de lister et effectuer des recherches sur l'utlisateur'
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 31/07/2023
 */
const findAlluser = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "NOM"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            users: {
                as: "users",
                fields: {
                    NOM: 'NOM',
                    PRENOM: 'PRENOM',
                    EMAIL: 'EMAIL',
                    TELEPHONE:'TELEPHONE'

                }
            },
            profils: {
                as: "profile",
                fields: {
                    DESCRIPTION: 'DESCRIPTION'
                }
            }
         
          
        }

        var orderColumn, orderDirection

        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.users.fields.NOM
            sortModel = {
                model: 'users',
                as: sortColumns.users.as
            }
        }

        // ordering
        if (sortOrder == 1) {
            orderDirection = 'ASC'
        } else if (sortOrder == -1) {
            orderDirection = 'DESC'
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = [ 
           ' NOM',
           ' PRENOM',
           ' EMAIL',
           ' TELEPHONE',
            '$profile.DESCRIPTION$'
        ]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach(column => {
                searchWildCard[column] = {
                    [Op.substring]: search
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard
            }
        }
        const result = await Users.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include: [{
                model: Profils,
                as: 'profile',
                required: false,
                attributes: ['ID_PROFIL','DESCRIPTION']

            }
           
          
           ]

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des utilisateurs",
            result: {
                data: result.rows,
                totalRecords: result.count
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
 * Permet de faire la suppression d'utilisateur'
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 31/07/2023
 */

const deleteItemsuser = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Users.destroy({
            where: {
                USERS_ID: {
                    [Op.in]: itemsIds
                }
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les elements ont ete supprimer avec success",
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
 * Permet de lister les payements types
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 05/07/2023
 */
const listepayementtype = async (req, res) => {
    try {
        const payementtype = await query('SELECT * FROM payement_type ORDER BY TYPE_PAYEMENT')
        res.status(200).json(payementtype)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

const listepayementtype1 = async (req, res) => {
    try {
        const payementtype = await Payement_type.findAll()
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les payements types a bien trouvee",
            result: payementtype
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
 * Permet de lister les demandes permis types
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 05/07/2023
 */


const listedemandepermis = async (req, res) => {
    try {
        const permistype = await query('SELECT * FROM type_demande_permis ORDER BY DESCRIPTION_DEMANDE')
        res.status(200).json(permistype)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}
const listedemandepermis1 = async (req, res) => {
    try {
        const permistype = await Type_demande_permis.findAll()
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les demandes permis types a bien trouvee",
            result: permistype
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
 * Permet de lister les devise
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 05/07/2023
 */


const listedevise = async (req, res) => {
    try {
        const devis = await query('SELECT * FROM devise ORDER BY CODE_DEVISE')
        res.status(200).json(devis)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}
const listedevise1 = async (req, res) => {
    try {
        const devis = await Devise.findAll()
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les devises a bien trouvee",
            result: devis
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
 * Permet de lister et effectuer des requerant
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 05/07/2023
 */
const listrequerant = async (req, res) => {
    try {
        const reqerant = await query('SELECT ID_REQUERENT, NOM, PRENOM FROM requerant WHERE ID_STATUT_VALIDATION = ? ORDER BY NOM', [ETAPES_STATUTS.ETTENTE_PAIEMENT])
        res.status(200).json(reqerant)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

/**
 * Permet de lister et effectuer des requerant
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 05/07/2023
 */

const listrequerant1 = async (req, res) => {
    try {
        const reqerant = await Requerant.findAll()
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les requerants a bien trouvee",
            result: reqerant
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
    createuser,
    Updateuser,
    findOneuser,
    findAlluser,
    deleteItemsuser,
    // findAllpayement,
    // listrequerant,
    // listepayementtype,
    // listedemandepermis,
    // listedevise,
    // findOnepayement,
    // Updatepayement,
    // deleteItemspayement

}