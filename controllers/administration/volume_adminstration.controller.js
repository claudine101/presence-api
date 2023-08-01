const express = require('express');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const Volume=require('../../models/Volume');
const Etapes_volumes= require('../../models/Etapes_volumes');
const maille =require= require('../../models/Maille')



/**
 * permet de 
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */

const findAll = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = 'ID_VOLUME'
        const defaultSortDirection = "DESC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    ID_VOLUME: 'ID_VOLUME',
                    NUMERO_VOLUME: "NUMERO_VOLUME",
                    CODE_VOLUME:"CODE_VOLUME",
                    NOMBRE_DOSSIER :"NOMBRE_DOSSIER",
                    DATE_INSERTION :"DATE_INSERTION"
                   
                }
            },


            etapes_volumes: {
                as: "etapes_volumes",
                fields: {
                    NOM_ETAPE: 'NOM_ETAPE',
                 
                }
            },

            malle: {
                as: "malle",
                fields: {
                    NUMERO_MAILLE: 'NUMERO_MAILLE',
                  
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
            orderColumn = sortColumns.volume.fields.ID_VOLUME
            sortModel = {
                model: 'volume',
                as: sortColumns.volume.as
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
        const result = await Volume.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include:[
                { model:Etapes_volumes,
                as: 'etapes_volumes',
                attributes: ['NOM_ETAPE'],
                required: false
                 }, 
               
                 { model:maille,
                  as: 'malle',
                  attributes: ['NUMERO_MAILLE'],
                  required: false
                }]
            
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes ",
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
module.exports={
    findAll
}