const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const { query } = require('../../../utils/db')
const Types_incident = require("../../../models/Types_incident")
const Incidents = require("../../../models/Incidents")
const Users = require("../../../models/Users")

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
            orderColumn = sortColumns.incidents.fields.ID_INCIDENT
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
                as: 'types_incidents',
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
    findAllincident,
}