const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Flashs = require("../../../models/Flashs")



/**
 * Permet de creer un flashs
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */


const createflashs = async (req, res) => {
    try {
        const { NOM_FLASH } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NOM_FLASH: {
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

        const flash = await Flashs.create({
            NOM_FLASH
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Flashs a ete cree avec succes",
            result: flash
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
* Permet d'afficher la nflashs
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const findAllflash = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "DATE_INSERTION"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            flashs: {
                as: "flashs",
                fields: {
                    ID_FLASH: "ID_FLASH",
                    NOM_FLASH: "NOM_FLASH",
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
            orderColumn = sortColumns.flashs.fields.ID_FLASH
            sortModel = {
                model: 'flashs',
                as: sortColumns.flashs.as
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
            'NOM_FLASH',
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
            message: "Liste des flashs",
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
* Permet de faire la suppression du flash
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Flashs.destroy({
            where: {
                ID_FLASH: {
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
* Permet de recuperer la flash
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/

const findOneFlash = async (req, res) => {
    try {
        const { ID_FLASH } = req.params
        const flash = await Flashs.findOne({
            where: {
                ID_FLASH
            },
        })
        if (flash) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Flash trouvee",
                result: flash
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Flash non trouvé",
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
* Permet de faire la modification du flash
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const updateflash = async (req, res) => {

    const { ID_FLASH } = req.params

    try {
        const { NOM_FLASH } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NOM_FLASH: {
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

        const flash = await Flashs.update({
            NOM_FLASH
        }, {
            where: {
                ID_FLASH: ID_FLASH
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Flash  a bien été modifie avec succes",
            result: flash
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
    createflashs,
    findAllflash,
    deleteItems,
    findOneFlash,
    updateflash

}