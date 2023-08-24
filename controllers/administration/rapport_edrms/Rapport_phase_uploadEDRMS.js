const express = require('express');
const { Op, where } = require('sequelize');
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES');
const RESPONSE_STATUS = require('../../../constants/RESPONSE_STATUS');
const Users = require('../../../models/Users');
const Folio = require('../../../models/Folio');
const IDS_ETAPES_FOLIO = require('../../../constants/ETAPES_FOLIO');
const Volume = require('../../../models/Volume');
const Etapes_volumes = require('../../../models/Etapes_volumes');
const Nature_folio = require('../../../models/Nature_folio');
const Etapes_folio = require('../../../models/Etapes_folio');
const Etapes_folio_historiques = require('../../../models/Etapes_folio_historiques');
const PROFILS = require('../../../constants/PROFILS');
const moment = require('moment');

/**
 * permet de  recuperer le nombre de de dossier uploade non uploader selon  l agent  upload edrms par jour
 * 
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 8/24/2023
 * 
 */
const phaseUpload = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        // Date filter
        var dateWhere = {}
        if (startDate) {
           
          const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00")
          const endDateFormat = endDate ?
            moment(endDate).format("YYYY-MM-DD 23:59:59") :
            moment().format("YYYY-MM-DD 23:59:59")
          dateWhere = {
            DATE_INSERTION: {
              [Op.between]: [startDateFormat, endDateFormat]
            }
          }
        }
  
      //find all users
      const users = await Users.findAll({
        attributes:[ `USERS_ID`,`NOM`, `PRENOM`, `EMAIL`, `TELEPHONE`, `ID_PROFIL`,],
        where :{
            ID_PROFIL : PROFILS.AGENT_UPLOAD_EDRMS
        }
      });
      
      //count dossiers uploades
      const uploade = await Promise.all(users.map(async countObject => {
        const util = countObject.toJSON()
        console.log(util)
        const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS
                }],
                ...dateWhere
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
                where: {
                    [Op.and]: [{
                        ID_USERS: util.USERS_ID
                     }, 
                     {
                        IS_UPLOADED_EDRMS: 1,
                    }
                ]
                },
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
        ]
          
        })
        return {
          ...util,
          folios
        }
      }))
  
 //count dossiers non uploades
      const nonuploades = await Promise.all(users.map(async countObject => {
        const util = countObject.toJSON()
        console.log(util)
        const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_NO_UPLOADED_EDRMS
                }]
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
                where: {
                    [Op.and]: [{
                        ID_USERS: util.USERS_ID
                    }, {
                        IS_UPLOADED_EDRMS: 0,
                    }]
                },
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
           

        ]
          
  
        })
        return {
          ...util,
          folios
        }
      }))

      const enttanteploades = await Promise.all(users.map(async countObject => {
        const util = countObject.toJSON()
        console.log(util)
        const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS
                }]
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
                where: {
                    [Op.and]: [{
                        ID_USERS: util.USERS_ID
                    }, {
                        ID_ETAPE_FOLIO: null,
                    }]
                },
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
           

        ]
          
  
        })
        return {
          ...util,
          folios
        }
      }))
      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_CODES.OK,
        message: 'les dossiers',
        result: {
            uploade,
            nonuploades,
            enttanteploades
        }
      });
  
  
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
 * permet de  recuperer les dossier qui ont passe sur l agent edrms 
 * 
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 8/24/2023
 * 
 */

  const performance_agentupload= async ( req,res) =>{
    try {
        const { startDate, endDate } = req.query
        // Date filter
        var dateWhere = {}
        if (startDate) {
           
          const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00")
          const endDateFormat = endDate ?
            moment(endDate).format("YYYY-MM-DD 23:59:59") :
            moment().format("YYYY-MM-DD 23:59:59")
          dateWhere = {
            DATE_INSERTION: {
              [Op.between]: [startDateFormat, endDateFormat]
            }
          }
        }
         //find all users
      const users = await Users.findAll({
        attributes:[ `USERS_ID`,`NOM`, `PRENOM`, `EMAIL`, `TELEPHONE`, `ID_PROFIL`,],
        where :{
            ID_PROFIL : PROFILS.AGENT_UPLOAD_EDRMS
        }
      });

      const alldossier = await Promise.all(users.map(async countObject => {
        const util = countObject.toJSON()
        console.log(util)
        const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS
                },{
                    USER_TRAITEMENT :util.USERS_ID
                }],
                ...dateWhere
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
               
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
           

        ]
          
  
        })
        return {
          ...util,
          folios
        }
      }))

      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_CODES.OK,
        message: 'les dossiers',
        result: {
            alldossier
        }
      });
  
        
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
 * permet de  recuperer le nombre de dossier que la personne ayant le profil de verificateur a touché
 *
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 8/24/2023
 * 
 */
  const verificateur_alldossier= async ( req,res) =>{
    try {
        const { startDate, endDate } = req.query
        // Date filter
        var dateWhere = {}
        if (startDate) {
           
          const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00")
          const endDateFormat = endDate ?
            moment(endDate).format("YYYY-MM-DD 23:59:59") :
            moment().format("YYYY-MM-DD 23:59:59")
          dateWhere = {
            DATE_INSERTION: {
              [Op.between]: [startDateFormat, endDateFormat]
            }
          }
        }
         //find all users
      const users = await Users.findAll({
        attributes:[ `USERS_ID`,`NOM`, `PRENOM`, `EMAIL`, `TELEPHONE`, `ID_PROFIL`,],
        where :{
            ID_PROFIL : PROFILS.VERIFICATEUR_UPLOAD
        }
      });

      const allverificateurdossier = await Promise.all(users.map(async countObject => {
        const util = countObject.toJSON()
        console.log(util)
        const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS
                },{
                    ID_USER:util.USERS_ID
                }],
                ...dateWhere
      
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
               
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
           

        ]
          
  
        })
        return {
          ...util,
          folios
        }
      }))

      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_CODES.OK,
        message: 'les dossiers',
        result: {
            allverificateurdossier
        }
      });
  
        
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
 * permet de  recuperer le nombre de dossier recu par la personne ayant le profil de chef d equipe
 *
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 8/24/2023
 * 
 */
  const chefequipe_alldossier= async ( req,res) =>{
    try {
        const { startDate, endDate } = req.query
        // Date filter
        var dateWhere = {}
        if (startDate) {
           
          const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00")
          const endDateFormat = endDate ?
            moment(endDate).format("YYYY-MM-DD 23:59:59") :
            moment().format("YYYY-MM-DD 23:59:59")
          dateWhere = {
            DATE_INSERTION: {
              [Op.between]: [startDateFormat, endDateFormat]
            }
          }
        }
         //find all users
      const users = await Users.findAll({
        attributes:[ `USERS_ID`,`NOM`, `PRENOM`, `EMAIL`, `TELEPHONE`, `ID_PROFIL`,],
        where :{
            ID_PROFIL : PROFILS.CHEF_EQUIPE_PHASE_UPLOAD
        }
      });

      const allchefeauipedossier = await Promise.all(users.map(async countObject => {
        const util = countObject.toJSON()
        console.log(util)
        const folios = await Etapes_folio_historiques.findAndCountAll({
            where:{
                [Op.and]: [{
                    ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS
                },{
                    ID_USER:util.USERS_ID
                }]
                ,...dateWhere
          },
          include: [
            {
                model: Folio,
                as: 'folio',
                required: true, 
               
                include: [
                    {
                        model: Volume,
                        as: 'volume',
                        attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                        required: false
                    },
                    {
                        model : Nature_folio,
                        as :'nature',
                        attributes:['DESCRIPTION']
                    },
                    {
                        model : Etapes_folio,
                        as :'etapes',
                        attributes:['NOM_ETAPE'] 
                    }]
            },
           

        ]
          
  
        })
        return {
          ...util,
          folios
        }
      }))

      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_CODES.OK,
        message: 'les dossiers',
        result: {
            allchefeauipedossier
        }
      });
  
        
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
 
    phaseUpload,
    performance_agentupload,
    verificateur_alldossier,
    chefequipe_alldossier
}