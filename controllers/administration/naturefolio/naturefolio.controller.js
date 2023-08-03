const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Profils = require("../../../models/Profils")
const Nature_folio = require("../../../models/Nature_folio")



/**
 * Permet de creer un nature folio
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */


const createnaturefolio = async (req, res) => {
    try {
        const { DESCRIPTION } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            DESCRIPTION: {
                required: true,
                length: [1, 245],
                alpha: true
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

        const naturefolio = await Nature_folio.create({
            DESCRIPTION
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Nature folio a ete cree avec succes",
            result: naturefolio
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
* Permet d'afficher la nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const findAllnaturefolio = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "ID_NATURE_FOLIO"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            nature_folio: {
                as: "nature_folio",
                fields: {
                    ID_NATURE_FOLIO: "ID_NATURE_FOLIO",
                    DESCRIPTION: "DESCRIPTION",
                }
            },
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
            orderColumn = sortColumns.nature_folio.fields.ID_NATURE_FOLIO
            sortModel = {
                model: 'nature_folio',
                as: sortColumns.nature_folio.as
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
            "ID_NATURE_FOLIO",
            'DESCRIPTION',
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
        const result = await Nature_folio.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des nature folio",
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
* Permet de faire la suppression du nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Nature_folio.destroy({
            where: {
                ID_NATURE_FOLIO: {
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
* Permet de recuperer la nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/

const findOneNaturefolio = async (req, res) => {
    try {
        const { ID_NATURE_FOLIO } = req.params
        const naturefolio = await Nature_folio.findOne({
            where: {
                ID_NATURE_FOLIO
            },
        })
        if (naturefolio) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Nature folio trouvee",
                result: naturefolio
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Nature folio non trouvé",
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
* Permet de faire la modification du nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const updateNaturefolio = async (req, res) => {

    const { ID_NATURE_FOLIO } = req.params

    try {
        // Validate request
        const { DESCRIPTION } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            DESCRIPTION: {
                required: true,
                length: [2, 245],
                alpha: true
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

        const naturefolioupdate = await Nature_folio.update({
            DESCRIPTION
        }, {
            where: {
                ID_NATURE_FOLIO: ID_NATURE_FOLIO
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Nature folio  a bien été modifie avec succes",
            result: naturefolioupdate
        })


    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur"
        });
    }

};

module.exports = {
    createnaturefolio,
    findAllnaturefolio,
    deleteItems,
    findOneNaturefolio,
    updateNaturefolio

}