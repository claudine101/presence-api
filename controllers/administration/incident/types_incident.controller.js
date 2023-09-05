const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Types_incident = require("../../../models/Types_incident")
const Ordres_incident = require("../../../models/Ordres_incident")

const allordre = async ( req, res) => {
    try {
        const result = await  Ordres_incident.findAll({
            attributes: [
                'ID_ORDRE_INCIDENT',
                'ORDRE_INCIDENT',
                'DATE_INSERTION'
              ],
              order:[[
                'DATE_INSERTION','DESC'
            ]],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des types incident",
            result: {
                data: result,
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
 * Permet d'ajouter le type d'incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */

const createtypes_incident = async (req, res) => {
    try {
        const { ID_ORDRE_INCIDENT,TYPE_INCIDENT,ID_USER } = req.body
        const data = { ...req.body }
        const validation = new Validation(data, {
          
            TYPE_INCIDENT: {
                required: true,
            },
            ID_ORDRE_INCIDENT:{
                required: true,
            }

        }, {
            TYPE_INCIDENT: {
                required: "Champ obligatoire"
            },
            ID_ORDRE_INCIDENT:{
                required: "Champ obligatoire"
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

        const IS_AUTRE = 0
        const types_incident = await Types_incident.create({
            ID_ORDRE_INCIDENT,
            TYPE_INCIDENT,
            IS_AUTRE,
            ID_USER
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "L'utilisateur est bien enregistré avec succes",
            result: types_incident
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
 * Permet d'afficher tous  les type d'incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */

const findAlltype = async (req, res) => {
    try {
        const {ordreincident,rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "TYPE_INCIDENT"
        const defaultSortDirection = "ASC"
        const sortColumns = {
            types_incident: {
                as: "types_incident",
                fields: {
                    TYPE_INCIDENT: 'TYPE_INCIDENT',
                    DATE_INSERTION: 'DATE_INSERTION',

                }
            },
        }

        var orderColumn, orderDirection
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
            orderColumn = sortColumns.types_incident.fields.TYPE_INCIDENT
            sortModel = {
                model: 'types_incident',
                as: sortColumns.types_incident.as
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
           'TYPE_INCIDENT',
            'DATE_INSERTION',
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

        var orderincident_data = {}
        if (ordreincident) {
            orderincident_data = { ID_ORDRE_INCIDENT: ordreincident }
        }

        const result = await   Types_incident.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: [
                'ID_TYPE_INCIDENT',
                'TYPE_INCIDENT',
                'DATE_INSERTION'
              ],
              include :{
                model: Ordres_incident,
                as: 'ordre_incident',
                required: false,
                attributes: ['ID_ORDRE_INCIDENT','ORDRE_INCIDENT']
              },
            where: {
                ...globalSearchWhereLike,
                ...orderincident_data
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des types incident",
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
 * Permet de modifier type d'incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */
const Updatetypeincident = async (req, res) => {
    try {
        const { ID_TYPE_INCIDENT } = req.params
        const { ID_ORDRE_INCIDENT,TYPE_INCIDENT } = req.body

        const data = { ...req.body }

        const validation = new Validation(data, {
          
            TYPE_INCIDENT: {
                required: true,
            },
            ID_ORDRE_INCIDENT:{
                required: true,
            }

        }, {
            TYPE_INCIDENT: {
                required: "Champ obligatoire"
            },
            ID_ORDRE_INCIDENT:{
                required: "Champ obligatoire"
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
       

        const typeincidentUpdate = await Types_incident.update({
            ID_ORDRE_INCIDENT,
            TYPE_INCIDENT
        }, {
            where: {
                ID_TYPE_INCIDENT : ID_TYPE_INCIDENT 
            }
        })

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "L'utilisateur  a bien été modifie avec succes",
            result: {
                typeincidentUpdate,
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
 * Permet de recuperer  un type d'incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date  1/9/2023
 */


const findOnetype = async (req, res) => {
    try {
        const { ID_TYPE_INCIDENT } = req.params
        const typeincident = await Types_incident.findOne({
            attributes: [
                'ID_TYPE_INCIDENT',
                'TYPE_INCIDENT',
                'IS_AUTRE',
                'ID_USER',
                'DATE_INSERTION'
              ],
              include :{
                model: Ordres_incident,
                as: 'ordre_incident',
                required: false,
                attributes: ['ID_ORDRE_INCIDENT','ORDRE_INCIDENT']
              },
            where: {
                ID_TYPE_INCIDENT
            },
        })
        if (typeincident) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Type incident trouvee",
                result: typeincident
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
 * Permet de supprimer  type d'incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date  1/9/2023
 */


const deleteypeincident = async (req, res) => {
    try {
        const { ids} = req.body
        const itemsIds = JSON.parse(ids)
        await   Types_incident.destroy({
            where: {
                ID_TYPE_INCIDENT: {
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
 * Permet d'afficher tous  les incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */

const findAllincident = async (req, res) => {
    try {
        const {  rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "DESCRIPTION"
        const defaultSortDirection = "ASC"
        const sortColumns = {
            incidents: {
                as: "incidents",
                fields: {
                    DESCRIPTION: 'DESCRIPTION',
                    DATE_INSERTION: 'DATE_INSERTION'

                }
            },
            types_incident: {
                as: "types_incident",
                fields: {
                    TYPE_INCIDENT: 'TYPE_INCIDENT'
                }
            },
            users: {
                as: "users",
                fields: {
                    NOM: 'NOM',
                    PRENOM: 'PRENOM',
                    EMAIL:'EMAIL',
                    PHOTO_USER:'PHOTO_USER'

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
            orderColumn = sortColumns.incidents.fields.DATE_INSERTION
            sortModel = {
                model: 'incidents',
                as: sortColumns.incidents.as
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
            'DESCRIPTION',
            'DATE_INSERTION',
            '$types_incident.TYPE_INCIDENT$',
            '$users.NOM$',
            '$users.PRENOM$',
            '$users.EMAIL$',
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
       
        const result = await Incidents.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: [
                'ID_INCIDENT',
                'DESCRIPTION',
                'DATE_INSERTION',
              ],
            where: {
                ...globalSearchWhereLike,
            },
            include: [{
                model: Types_incident,
                as: 'types_incident',
                required: false,
                attributes: ['TYPE_INCIDENT']
            },{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['NOM', 'PRENOM','EMAIL','PHOTO_USER']
            }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des incidents",
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

module.exports = {
    createtypes_incident,
    allordre,
    Updatetypeincident,
    findOnetype,
    findAlltype,
    deleteypeincident,
    findAllincident
}