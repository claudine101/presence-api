const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Profils = require("../../../models/Profils")
const Equipe= require('../../../models/Equipes')
const Equipes_agents = require("../../../models/Equipes_agents")
const Users = require("../../../models/Users")
const PROFILS = require("../../../constants/PROFILS")

/**
 * Permet de creer un nature folio
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author derick <derick@mdiabox.bi>
 * 
 * 
 * mise a jour par
 * @author leonard<leonard@mediabox.bi>
 * @date 17/08/2023
 */


const createequipe = async (req, res) => {
    try {
        const {NOM_EQUIPE,CHAINE,ORDINATEUR,selectedUser} = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NOM_EQUIPE: {
                required: true,
                length: [1, 245],
                alpha: true
            },
            CHAINE: {
                required: true,
                length: [1, 245],
                alpha: true
            },
            ORDINATEUR: {
                required: true,
                length: [1, 245],
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

        const userselect= JSON.parse(selectedUser)

        const equipe = await Equipe.create({
            NOM_EQUIPE,
            CHAINE,
            ORDINATEUR
        })
        const last_id = equipe.toJSON()
        const equipeData=userselect.map(reponse=>{
            return {
                ID_USER: reponse,
                ID_EQUIPE: last_id.ID_EQUIPE,
            }
        })

         //Insertion de multiselect alors
         await Equipes_agents.bulkCreate(equipeData)

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "equipe a ete cree avec succes",
            result: equipe
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

// /**
// * Permet d'afficher la nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
const findAllequipe = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "ID_EQUIPE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            equipe: {
                as: "equipe",
                fields: {
                    ID_EQUIPE: "ID_EQUIPE",
                    CHAINE:"CHAINE",
                    ORDINATEUR:"ORDINATEUR",
                }
            },
            equipes_agents:{
                as: "equipeAgents",
                fields: {
                    ID_EQUIPE_AGENT: 'ID_EQUIPE_AGENT'
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
            orderColumn = sortColumns.equipe.fields.ID_EQUIPE
            sortModel = {
                model: 'equipe',
                as: sortColumns.equipe.as
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
        const result = await Equipe.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include:[{
                model: Equipes_agents,
                attributes: ['ID_EQUIPE_AGENT'],
                as: 'equipeAgents',
                include: [
                    {
                        model: Users,
                        attributes: ['USERS_ID', 'NOM','PRENOM','EMAIL','TELEPHONE'],
                        as: 'users',
                    },
                ],
            },
        ],
            order: [['ID_EQUIPE', 'DESC']],
            limit: 10,
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des equipe",
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
// * Permet de faire la suppression du nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Equipe.destroy({
            where: {
                ID_EQUIPE: {
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
* @author derick <derick@mdiabox.bi>
*/

const findOneequipe = async (req, res) => {
    try {
        const {ID_EQUIPE} = req.params
        const equipeone= await Equipe.findOne({
            where: {
                ID_EQUIPE 
            },
           include: {
                model: Equipes_agents,
                attributes: ['ID_EQUIPE_AGENT'],
                as: 'equipeAgents',
                include: [
                    {
                        model: Users,
                        attributes: ['USERS_ID', 'NOM', 'PRENOM'],
                        as: 'users',
                    },
                ],
            },
        })
        if (equipeone) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Numero batimet trouvee",
                result: equipeone
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: " non trouvé",
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
* @author derick <derick@mdiabox.bi>
*/
const updateequipe = async (req, res) => {

    const {ID_EQUIPE} = req.params

    try {
        // Validate request
        const { NOM_EQUIPE,CHAINE,ORDINATEUR,selectedUser} = req.body
        const alluser = JSON.parse(selectedUser)
        const data = { ...req.body };
        const validation = new Validation(data, {
            NOM_EQUIPE: {
                required: true,
                length: [2, 245],
                alpha: true
            },
            CHAINE: {
                required: true,
                length: [2, 245],
                alpha: true
            },
            ORDINATEUR: {
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

        const equip = await Equipe.update({
            NOM_EQUIPE,
            CHAINE,
            ORDINATEUR
        }, {
            where: {
                ID_EQUIPE : ID_EQUIPE  
            }
        })

        await Equipes_agents.destroy({
            where: { ID_EQUIPE: ID_EQUIPE }
        })

        //arrangement de l'insertion de multiselect
        const userdata = alluser.map(reponse => {
            return {
                ID_USER: reponse,
                ID_EQUIPE: ID_EQUIPE,
            }
        })

        //Insertion de multiselect alors
        await Equipes_agents.bulkCreate(userdata)


        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Les equipes  sont bien été modifie avec succes",
            result: equip
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
 * Permet de lister les utilisateurs
 * @date  17/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard <leonard@mdiabox.bi>
 */
const findalluser = async (req, res) => {
    try {
        const users = await Users.findAll({
            where:{
                ID_PROFIL:{
                    [Op.in]:[PROFILS.AGENT_SCANNING]
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

module.exports = {
    createequipe,
    findAllequipe,
    findOneequipe,
    updateequipe,
    deleteItems,
    findalluser

}