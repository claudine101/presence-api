const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const User_ailes = require("../../../models/User_ailes")
const Aile = require("../../../models/Aile")
const Users = require("../../../models/Users")
const sequelize = require('sequelize');



/**
 * Permet de creer un aile user
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */


const createuseraile = async (req, res) => {
    try {

        const { USERS_ID, ID_AILE, IS_ACTIF } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            USERS_ID: {
                required: true,

            },
            ID_AILE: {
                required: true,
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

        const aileuser = await User_ailes.create({
            USERS_ID,
            ID_AILE,
            IS_ACTIF: 0
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Aile a ete cree avec succes",
            result: aileuser
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
* Permet de listes les utilisateurs
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
* @date 1/8/2023
*/

const findalluser = async (req, res) => {
    try {
        const user = await Users.findAll({
            attributes: ['USERS_ID', 'NOM', 'PRENOM']
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "listes des utilisateurs",
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
* Permet de listes les ailes
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
* @date 1/8/2023
*/

const findaile = async (req, res) => {
    try {
        const aile = await Aile.findAll({
            attributes: ['ID_AILE', 'ID_BATIMENT', 'NUMERO_AILE']
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "listes des ailes",
            result: aile
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
 * Permet de lister et effectuer des recherches sur l'utlisateur aile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 01/08/2023
 */
const findAlluseraile = async (req, res) => {

    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "ID_USER_AILE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            user_ailes: {
                as: "user_ailes",
                fields: {
                    ID_USER_AILE: 'ID_USER_AILE'
                }
            },
            aile: {
                as: "ailes",
                fields: {
                    NUMERO_AILE: 'NUMERO_AILE'
                }
            },
            users: {
                as: "users",
                fields: {
                    NOM: 'NOM',
                    PRENOM: 'PRENOM'
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
            orderColumn = sortColumns.user_ailes.fields.ID_USER_AILE
            sortModel = {
                model: 'user_ailes',
                as: sortColumns.user_ailes.as
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
            '$aile.NUMERO_AILE$',
            '$user.NOM$',
            '$user.PRENOM$'
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

        const result = await User_ailes.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike
            },

            include: [{
                model: Aile,
                as: 'ailes',
                required: false,
                attributes: ['ID_AILE', 'NUMERO_AILE']

            },
            {
                model: Users,
                as: 'users',
                required: false,
                attributes: ['USERS_ID', 'NOM', 'PRENOM']

            }
            ],
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des utilisateurs ailes",
            result: {
                data: result.rows,
                totalRecords: result.count,
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
* Permet de listes les ailes
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
* @date 1/8/2023
*/



const findALL = async (req, res) => {
    const { ID_AILE } = req.params
    try {
        const ailetes = await User_ailes.findAndCountAll({
            where: {
                ID_AILE: ID_AILE,
            },
            include: [
                {
                    model: Aile,
                    as: 'ailes',
                    attributes: [[sequelize.fn('COUNT', sequelize.col('USERS_ID')), 'nombre_Utilisateur'], 'NUMERO_AILE', 'ID_AILE'],
                    where: {
                        ID_AILE: ID_AILE,
                    },
                    required: false,
                },
            ],
            attributes: [],
        })

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "listes des ailes",
            result: ailetes
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

// Sequelize query


module.exports = {
    createuseraile,
    findaile,
    findAlluseraile,
    findalluser

}