const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Aile = require("../../../models/Aile")
const Batiment = require("../../../models/Batiment")
const Users = require("../../../models/Users")
const User_ailes = require("../../../models/User_ailes")
const Profils = require("../../../models/Profils")
const PROFILS = require("../../../constants/PROFILS")
const { Sequelize } = require('sequelize');


/**
 * Permet de lister et effectuer des recherches sur l'aile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 02/08/2023
 */
const findAllaile = async (req, res) => {

    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "ID_AILE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            aile: {
                as: "aile",
                fields: {
                    ID_AILE:'ID_AILE',
                    NUMERO_AILE:'NUMERO_AILE'
                }
            }
             ,
            batiment: {
                as: "batiment",
                fields: {
                    NUMERO_BATIMENT:'NUMERO_BATIMENT'
                }
            }
            ,
            user_ailes: {
                as: "userAile",
                fields: {
                    ID_USER_AILE: 'ID_USER_AILE'
                }
            },
            users: {
                as: "users",
                fields: {
                    NOM: 'NOM',PRENOM: 'PRENOM',EMAIL: 'EMAIL',TELEPHONE: 'TELEPHONE'
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
            orderColumn = sortColumns.aile.fields.ID_AILE
            sortModel = {
                model: 'aile',
                as: sortColumns.aile.as
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
            'NUMERO_AILE',
            // '$batiment.NUMERO_BATIMENT$'
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

        const result = await Aile.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike
            },

            include: [
                {
                    model: Batiment,
                    as: 'batiment',
                    required: false,
                    attributes: ['ID_BATIMENT', 'NUMERO_BATIMENT']
                    
                },
                {
                    model: User_ailes,
                    attributes: ['ID_USER_AILE'],
                    as: 'userAile',
                    include: [
                        {
                            model: Users,
                            attributes: ['USERS_ID', 'NOM','PRENOM','EMAIL','TELEPHONE'],
                            as: 'users',
                        },
                    ],
                },
            ],
            order: [['ID_AILE', 'DESC']],
            limit: 10,

        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des ailes",
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
 * Permet de lister les utilisateurs
 * @date  02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */
const findalluser = async (req, res) => {
    try {
        const users = await Users.findAll({
            where:{
                ID_PROFIL:{
                    [Op.in]:[PROFILS.AGENTS_DISTRIBUTEUR,PROFILS.CHEF_PLATEAU,
                            PROFILS.AGENTS_SUPERVISEUR_AILE,PROFILS.AGENT_SUPERVISEUR,PROFILS.AGENT_PREPARATION]
                }
            },
            attributes: ['USERS_ID', 'NOM', 'PRENOM'],
           
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "listes des utilisateurs",
            result: users
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
 * Permet de lister les batiments
 * @date  02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */

const findallbatiment = async (req, res) => {
    try {
        const batimen = await Batiment.findAll({
            attributes: ['ID_BATIMENT', 'NUMERO_BATIMENT']
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "listes des batiments",
            result: batimen
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
 * Permet de creer un aile
 * @date  02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */
const createaile = async (req, res) => {
    try {
        const { ID_BATIMENT, NUMERO_AILE, selectedUser } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NUMERO_AILE: {
                required: true,
                length: [1, 245],
                alpha: true
            },
            ID_BATIMENT: {
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

        const allQst = JSON.parse(selectedUser)
        const aile = await Aile.create({
            NUMERO_AILE,
            ID_BATIMENT

        })
        const ls_Id = aile.toJSON()

        //arrangement de l'insertion de multiselect
        const buildQstData = allQst.map(reponse => {
            return {
                USERS_ID: reponse,
                ID_AILE: ls_Id.ID_AILE,
            }
        })

        //Insertion de multiselect alors
        await User_ailes.bulkCreate(buildQstData)

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Aile a ete cree avec succes",
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
 * Permet de recuperer un aile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 02/08/2023
 */

const findOneaile = async (req, res) => {
    try {
        const { ID_AILE } = req.params
        const aile = await Aile.findOne({
            where: {
                ID_AILE
            },
            include: [
                {
                    model: Batiment,
                    attributes: ['ID_BATIMENT', 'NUMERO_BATIMENT'],
                    as: 'batiment',
                },
                {
                    model: User_ailes,
                    attributes: ['ID_USER_AILE'],
                    as: 'userAile',
                    include: [
                        {
                            model: Users,
                            attributes: ['USERS_ID', 'NOM', 'PRENOM'],
                            as: 'users',
                        },
                    ],
                },
            ],
        })
        if (aile) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "L'aile trouvee",
                result: aile
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "L'aile non trouve",
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
 * Permet de mettre a jour un aile
 * @date  02/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */
const updateaile = async (req, res) => {
    const { ID_AILE } = req.params
    try {
        const { ID_BATIMENT, NUMERO_AILE, selectedUser } = req.body
        const alluser = JSON.parse(selectedUser)
        const data = { ...req.body };
        const validation = new Validation(data, {
            NUMERO_AILE: {
                required: true,
                length: [1, 245],
                alpha: true
            },
            ID_BATIMENT: {
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
        const aile = await Aile.update({
            NUMERO_AILE,
            ID_BATIMENT

        }, {
            where: {
                ID_AILE: ID_AILE
            }
        })

        await User_ailes.destroy({
            where: { ID_AILE: ID_AILE }
        })

        //arrangement de l'insertion de multiselect
        const userdata = alluser.map(reponse => {
            return {
                USERS_ID: reponse,
                ID_AILE: ID_AILE,
            }
        })

        //Insertion de multiselect alors
        await User_ailes.bulkCreate(userdata)

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Aile a ete modifie avec succes",
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
 * Permet de faire la suppression l'aile
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 * @date 2/8/2023
 */
const deleteItemsaile = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Aile.destroy({
            where: {
                ID_AILE: {
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



module.exports = {
    findAllaile,
    findallbatiment,
    findalluser,
    createaile,
    findOneaile,
    updateaile,
    deleteItemsaile
}