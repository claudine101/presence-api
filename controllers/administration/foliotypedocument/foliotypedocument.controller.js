const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Nature_folio = require("../../../models/Nature_folio")
const Folio_types_documents = require("../../../models/Folio_types_documents")



/**
 * Permet de creer un folio type document
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */


const createfoliotypedocument = async (req, res) => {
    try {
        const { ID_NATURE, NOM_DOCUMENT } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            ID_NATURE: {
                required: true,
            },
            NOM_DOCUMENT: {
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

        const foliotype = await Folio_types_documents.create({
            ID_NATURE, NOM_DOCUMENT
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Folio type document a ete cree avec succes",
            result: foliotype
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
* Permet d'afficher folio type document
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const findAllfoliotypedocument = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "DATE_INSERTION"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            folio_types_documents: {
                as: "folio_types_documents",
                fields: {
                    ID_TYPE_FOLIO_DOCUMENT: "ID_TYPE_FOLIO_DOCUMENT",
                    NOM_DOCUMENT: "NOM_DOCUMENT",
                }
            }, nature_folio: {
                as: "naturefolio",
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
            orderColumn = sortColumns.folio_types_documents.fields.ID_TYPE_FOLIO_DOCUMENT
            sortModel = {
                model: 'folio_types_documents',
                as: sortColumns.folio_types_documents.as
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
            "NOM_DOCUMENT",
            '$naturefolio.DESCRIPTION$'
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
        const result = await Folio_types_documents.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include: {
                model: Nature_folio,
                as: 'naturefolio',
                required: false,
                attributes: ['ID_NATURE_FOLIO','DESCRIPTION']

            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folio types document",
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
* Permet de faire la suppression du folio type document
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Folio_types_documents.destroy({
            where: {
                ID_TYPE_FOLIO_DOCUMENT: {
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
* Permet de recuperer la folio types document
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/

const findOneFoliotypedocument = async (req, res) => {
    try {
        const { ID_TYPE_FOLIO_DOCUMENT } = req.params
        const foliotype = await Folio_types_documents.findOne({
            where: {
                ID_TYPE_FOLIO_DOCUMENT
            },
            include: {
                model: Nature_folio,
                as: 'naturefolio',
                required: false,
                attributes: ['ID_NATURE_FOLIO','DESCRIPTION']

            }
            
        })
        if (foliotype) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Folio type document trouvee",
                result: foliotype
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
* Permet de faire la modification du folio type document
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
*/
const updateFoliotypedocument= async (req, res) => {

    const { ID_TYPE_FOLIO_DOCUMENT } = req.params

    try {
        const { ID_NATURE,NOM_DOCUMENT } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            ID_NATURE:{
                required: true,
            },
            NOM_DOCUMENT: {
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

        const foliotypedocument = await Folio_types_documents.update({
            ID_NATURE,NOM_DOCUMENT
        }, {
            where: {
                ID_TYPE_FOLIO_DOCUMENT: ID_TYPE_FOLIO_DOCUMENT
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Folio type document  a bien été modifie avec succes",
            result: foliotypedocument
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


/**
* Permet de listes les natures folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author leonard <leonard@mdiabox.bi>
* @date 1/8/2023
*/

const findallnaturefolio=async(req,res)=>{
    try {
       const naturefolio=await Nature_folio.findAll({
        attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
       }) 
       res.status(RESPONSE_CODES.CREATED).json({
        statusCode: RESPONSE_CODES.CREATED,
        httpStatus: RESPONSE_STATUS.CREATED,
        message: "listes des natures folios",
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

module.exports = {
    createfoliotypedocument,
    findAllfoliotypedocument,
    deleteItems,
    findOneFoliotypedocument,
    updateFoliotypedocument,
    findallnaturefolio


}