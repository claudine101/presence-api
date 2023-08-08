const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const { query } = require('../../../utils/db')
const IMAGES_DESTINATIONS = require("../../../constants/IMAGES_DESTINATIONS")
const UserUpload = require("../../../class/uploads/UserUpload")
const Users = require("../../../models/Users")
const md5 = require("md5")
const generateToken = require('../../../utils/generateToken')
const Profils = require("../../../models/Profils")
const PROFILS = require("../../../constants/PROFILS")



/**
 * Permet un utilsateur de s'authentifier
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 07/08/2023
 */
const login = async (req, res) => {
    try {
        const { EMAIL, PASSEWORD, PUSH_NOTIFICATION_TOKEN, DEVICE, LOCALE } = req.body;
        const validation = new Validation(
            req.body,
            {
                EMAIL: {
                    required: true,
                    email: true
                },
                PASSEWORD:
                {
                    required: true,
                },
            },
            {
                PASSEWORD:
                {
                    required: "Le mot de passe est obligatoire",
                },
                EMAIL: {
                    required: "L'email est obligatoire",
                    email: "Email invalide"
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
        const userObject = await Users.findOne({
            where: { EMAIL: EMAIL, ID_PROFIL: PROFILS.ADMIN },
            attributes: ['USERS_ID', 'PASSEWORD', 'ID_PROFIL', 'TELEPHONE', 'EMAIL', 'NOM', 'PRENOM', 'IS_ACTIF'],
            include: [{
                model: Profils,
                as: 'profil',
                required: false,
                attributes: ['ID_PROFIL', 'DESCRIPTION']
            }]
        })
        if (userObject) {
            const user = userObject.toJSON()
            if (user.PASSEWORD == md5(PASSEWORD)) {
                const token = generateToken({ user: user.USERS_ID, ID_PROFIL: user.ID_PROFIL, PHOTO_USER: user.PHOTO_USER }, 3 * 12 * 30 * 24 * 3600)
                const { PASSEWORD, ...other } = user

                res.status(RESPONSE_CODES.CREATED).json({
                    statusCode: RESPONSE_CODES.CREATED,
                    httpStatus: RESPONSE_STATUS.CREATED,
                    message: "Vous êtes connecté avec succès",
                    result: {
                        ...other,
                        token
                    }
                })
            } else {
                validation.setError('main', 'Identifiants incorrects')
                const errors = await validation.getErrors()
                res.status(RESPONSE_CODES.NOT_FOUND).json({
                    statusCode: RESPONSE_CODES.NOT_FOUND,
                    httpStatus: RESPONSE_STATUS.NOT_FOUND,
                    message: "Utilisateur n'existe pas",
                    result: errors
                })
            }
        } else {
            validation.setError('main', 'Identifiants incorrects')
            const errors = await validation.getErrors()
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Utilisateur n'existe pas",
                result: errors
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
 * Permet d'enregistrer un utilisateur
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 31/07/2023
 */
const createuser = async (req, res) => {
    try {
        const { NOM, PRENOM, EMAIL, TELEPHONE, ID_PROFIL, PASSEWORD, IS_ACTIF } = req.body
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
            // PASSWORD: {
            //     required: true,
            //     length: [1, 8],
            //     alpha: true
            // },
            EMAIL: {
                required: true,
                length: [1, 255],
                email: true,
                unique: "users,EMAIL"
            },

            TELEPHONE: {
                required: true,
                number: [1, 50],
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


        }, {
            EMAIL: {
                unique: "L'email doit etre unique"
            },
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
        const generatepassword = `${TELEPHONE}`
        const user = await Users.create({
            NOM,
            PRENOM,
            EMAIL,
            TELEPHONE,
            ID_PROFIL,
            PASSEWORD: md5(generatepassword),
            PHOTO_USER: filename,
            IS_ACTIF: 0
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
        const { NOM, PRENOM, EMAIL, TELEPHONE, ID_PROFIL, IS_ACTIF } = req.body

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
                alpha: true,
                length: [2, 50]
            },
            PRENOM: {
                required: true,
                alpha: true,
                length: [2, 50]
            },
            EMAIL: {
                required: true,
                email: true,
                length: [2, 250]
            },
            TELEPHONE: {
                required: true,
                number: true,
                length: [2, 50]
            },

            ID_PROFIL: {
                required: true,
                number: true,
                exists: "profils,ID_PROFIL"
            },
            // PHOTO_USER: {
            //     required: true,
            //     image: 4000000
            // }

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

        const userUpdate = await Users.update({
            NOM,
            PRENOM,
            EMAIL,
            TELEPHONE,
            ID_PROFIL,
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
                as: 'profil',
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
                result: userone
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
        const { profilebackend, rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "NOM"
        const defaultSortDirection = "ASC"
        const sortColumns = {
            users: {
                as: "users",
                fields: {
                    NOM: 'NOM',
                    PRENOM: 'PRENOM',
                    EMAIL: 'EMAIL',
                    TELEPHONE: 'TELEPHONE'

                }
            },
            profils: {
                as: "profil",
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
            'NOM',
            'PRENOM',
            'EMAIL',
            'TELEPHONE',
            '$profil.DESCRIPTION$'
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
        var profileInfo = {}
        if (profilebackend) {
            profileInfo = { ID_PROFIL: profilebackend }
        }
        const result = await Users.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
                ...profileInfo,
            },
            include: {
                model: Profils,
                as: 'profil',
                required: false,
                attributes: ['ID_PROFIL', 'DESCRIPTION']

            }
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
 * Permet de lister les profiles
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 31/07/2023
 */

const listeprofiles = async (req, res) => {
    try {
        const profil = await Profils.findAll({
            attributes: ['ID_PROFIL', 'DESCRIPTION'],
            order: [
                ['DESCRIPTION', 'ASC']
            ]
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Listes des profiles",
            result: profil
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
* Permet de desactiver et d'activer le status de l'utilisateur
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
* @date 07/08/2023
*/
const activer_descativer_utilisateur = async (req, res) => {
    try {
        const { USERS_ID } = req.params;
        const userObjet = await Users.findByPk(USERS_ID, { attributes: ['USERS_ID', 'IS_ACTIF'] })

        const user = userObjet.toJSON()
        let IS_ACTIF
        if (user.IS_ACTIF) {
            IS_ACTIF = 0
        } else {
            IS_ACTIF = 1
        }
        // Update the IS_ACTIF user data
        await Users.update(
            { IS_ACTIF: IS_ACTIF },
            {
                where: {
                    USERS_ID: USERS_ID,
                },
            }
        );
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Activation/Desactivation est fait succès"
        });
    } catch (error) {
        console.log(error);
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
    listeprofiles,
    activer_descativer_utilisateur,
    login
}