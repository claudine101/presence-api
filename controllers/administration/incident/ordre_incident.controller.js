const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Types_incident = require("../../../models/Types_incident")
const Ordres_incident = require("../../../models/Ordres_incident")

/**
 * Permet d'ajouter ordre d'incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */

const createordre_incident = async (req, res) => {
    try {
        const { ORDRE_INCIDENT, ID_USER } = req.body
        const data = { ...req.body }
        const validation = new Validation(data, {

            ORDRE_INCIDENT: {
                required: true,
            }
        }, {
            ORDRE_INCIDENT: {
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
        const ordre_incident = await Ordres_incident.create({
            ORDRE_INCIDENT,
            IS_AUTRE,
            ID_USER
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "L'utilisateur est bien enregistré avec succes",
            result: ordre_incident
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
 * Permet d'afficher tous les ordre incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */

const findAllordre = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "ORDRE_INCIDENT"
        const defaultSortDirection = "ASC"
        const sortColumns = {
            ordres_incident: {
                as: "ordres_incident",
                fields: {
                    ORDRE_INCIDENT: 'ORDRE_INCIDENT',
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
            orderColumn = sortColumns.ordres_incident.fields.ORDRE_INCIDENT
            sortModel = {
                model: 'ordres_incident',
                as: sortColumns.ordres_incident.as
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
            'ORDRE_INCIDENT',
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


        const result = await Ordres_incident.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            order:[[
                'DATE_INSERTION','DESC'
            ]],
            attributes: [
                'ID_ORDRE_INCIDENT',
                'ORDRE_INCIDENT',
                'DATE_INSERTION'
            ],
            where: {
                ...globalSearchWhereLike,
            },
        })
        const gettype = await Promise.all(result.rows.map(async countObject => {
            const ordre_incident = countObject.toJSON()
            const gettypeincident = await Types_incident.findAndCountAll({
                attributes:[
                    'ID_TYPE_INCIDENT','TYPE_INCIDENT','DATE_INSERTION'
                ],
                where: {
                    ID_ORDRE_INCIDENT: ordre_incident.ID_ORDRE_INCIDENT
                }
            })
            return {
                ...ordre_incident,
                data: gettypeincident.rows,
                count: gettypeincident.count
            }
        }))

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des ordres incident",
            result:
            {
                gettype,
                totalRecords: gettype.length

            },


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
 * Permet de modifier ordre incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */
const Updateordreincident = async (req, res) => {
    try {
        const { ID_ORDRE_INCIDENT } = req.params
        const { ORDRE_INCIDENT } = req.body
        const data = { ...req.body }

        const validation = new Validation(data, {

            ORDRE_INCIDENT: {
                required: true,
            }
        }, {
            ORDRE_INCIDENT: {
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


        const ordreincidentUpdate = await Ordres_incident.update({
            ORDRE_INCIDENT,
        }, {
            where: {
                ID_ORDRE_INCIDENT: ID_ORDRE_INCIDENT
            }
        })

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "L'utilisateur  a bien été modifie avec succes",
            result: {
                ordreincidentUpdate,
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
 * Permet de recuperer ordre incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date  1/9/2023
 */


const findOneOrdre = async (req, res) => {
    try {
        const { ID_ORDRE_INCIDENT } = req.params
        const ordreincident = await Ordres_incident.findOne({
            attributes: [
                'ID_ORDRE_INCIDENT',
                'ORDRE_INCIDENT',
                'IS_AUTRE',
                'ID_USER',
                'DATE_INSERTION'
            ],
            where: {
                ID_ORDRE_INCIDENT
            },
        })
        if (ordreincident) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Ordre incident trouvee",
                result: ordreincident
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "L'ordre non trouve",
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

const deleteOrdreincident = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Ordres_incident.destroy({
            where: {
                ID_ORDRE_INCIDENT: {
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
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
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
                    EMAIL: 'EMAIL',
                    PHOTO_USER: 'PHOTO_USER'

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
            }, {
                model: Users,
                as: 'users',
                required: false,
                attributes: ['NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER']
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
    createordre_incident,
    Updateordreincident,
    findOneOrdre,
    findAllordre,
    deleteOrdreincident,
    findAllincident
}