const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Folio = require("../../../models/Folio")
const { Op } = require("sequelize")
const Equipes = require("../../../models/Equipes")
const Volume = require("../../../models/Volume")
const Nature_folio = require("../../../models/Nature_folio")
const Users = require("../../../models/Users")
const moment = require("moment")
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques")
const Etapes_folio = require("../../../models/Etapes_folio")
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO")
const Etapes_volume_historiques = require("../../../models/Etapes_volume_historiques")
const ETAPES_VOLUME = require("../../../constants/ETAPES_VOLUME")
const Etapes_volumes = require("../../../models/Etapes_volumes")
const PROFILS = require("../../../constants/PROFILS")

/**
 * Fonction du rapport des dossiers scannes et non scanes par equipes,
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 21/08/2023
 */
const phaseScanning = async (req, res) => {
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
    //find all equipes
    const equipes = await Equipes.findAll({});

    //count dossiers scannees
    const scannes = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const histo_folios = await Etapes_folio_historiques.findAndCountAll({
        where: {
          ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
          ...dateWhere
        },
        include: {
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO', 'IS_RECONCILIE', 'NUMERO_FOLIO'],
          where: {
            ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: 1
          },
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        },
      })
      return {
        ...util,
        histo_folios
      }
    }))

    //count dossiers non scannees
    const nonScannes = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const histo_folios = await Etapes_folio_historiques.findAndCountAll({
        where: {
          ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
          ...dateWhere
        },
        include: {
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO', 'IS_RECONCILIE', 'NUMERO_FOLIO'],
          where: {
            ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: 0
          },
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        },
      })
      return {
        ...util,
        histo_folios
      }
    }))

    //count dossiers en cours de traitement
    const nonTraites = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const histo_folios = await Etapes_folio_historiques.findAndCountAll({
        where: {
          ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
          ...dateWhere
        },
        include: {
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO', 'IS_RECONCILIE', 'NUMERO_FOLIO'],
          where: {
            ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: null
          },
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        },
      })
      return {
        ...util,
        histo_folios
      }
    }))
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'les dossiers',
      result: {
        scannes,
        nonScannes,
        nonTraites
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
 * Fonction du rapport des agents de desarchivage,
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 24/08/2023
 */

const rapport_agent_desarchivage = async (req, res) => {
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
    //find all agent
    const agent_desarchivage = await Users.findAll({
      where:{
        ID_PROFIL:PROFILS.AGENTS_DESARCHIVAGES
      },
      attributes:['USERS_ID','NOM','PRENOM','EMAIL','TELEPHONE']
    })

    //compte le nombre de volume des agent de desarchivage
    const count_nombre_volume = await Promise.all(agent_desarchivage.map(async countObject => {
      const util = countObject.toJSON()
      const etape_histo_volume=await Etapes_volume_historiques.findAndCountAll({
        where:{
          ID_ETAPE_VOLUME:ETAPES_VOLUME.SAISIS_NOMBRE_FOLIO ,
          USERS_ID:util.USERS_ID,
          ...dateWhere
        },
        include:{
          model:Volume,
          as:'volum',
          required:true,
          attributes: ['ID_VOLUME', 'NUMERO_VOLUME'],
          include:{
            model:Etapes_volumes,
            as:'etapes_volumes',
            required:true,
            attributes:['ID_ETAPE_VOLUME','NOM_ETAPE']
          }
        }
      })
      return{
        ...util,
        etape_histo_volume
      }
      
    }))
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'Les agents de desarchivages',
      result: {
        count_nombre_volume
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
 * Fonction du rapport des agents superviseur,
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 24/08/2023
 */

const agent_superviseur=async(req,res)=>{
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
    // all agent superviseur 
    const agent_superviseur=await Users.findAll({
      where:{
        ID_PROFIL:PROFILS.AGENT_SUPERVISEUR_SCANNING
      },
      attributes:['USERS_ID','NOM','PRENOM','EMAIL','TELEPHONE']
    })

    //compte le nombre des agents superviseur
    const count_agentsuperviseur=await Promise.all(agent_superviseur.map(async countObject=>{
      const util=countObject.toJSON()
      const etapes_folio_histo_agent_sup=await Etapes_folio_historiques.findAndCountAll({
        where:{
          ID_ETAPE_FOLIO:IDS_ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
          ID_USER: util.USERS_ID,
          ...dateWhere
        },
        include:{
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO','NUMERO_FOLIO'],
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        }
      })
      return{
        ...util,
        etapes_folio_histo_agent_sup
      }
    }))
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'Les agents de superviseurs',
      result: {
        count_agentsuperviseur
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
 * Fonction du rapport des agents chefs plateau
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 24/08/2023
 */

const agent_chefplateau=async(req,res)=>{
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
    // all chef plateau 
    const chefplateau=await Users.findAll({
      where:{
        ID_PROFIL:PROFILS.CHEF_PLATEAU_SCANNING
      },
      attributes:['USERS_ID','NOM','PRENOM','EMAIL','TELEPHONE']
    })

    //compte le nombre des chef plateau
    const count_chefplateau=await Promise.all(chefplateau.map(async countObject=>{
      const util=countObject.toJSON()
      const etapes_folio_histo_chefplateau=await Etapes_folio_historiques.findAndCountAll({
        where:{
          ID_ETAPE_FOLIO:IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
          ID_USER: util.USERS_ID,
          ...dateWhere  
        },
        include:{
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO','NUMERO_FOLIO'],
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        }
      })
      return{
        ...util,
        etapes_folio_histo_chefplateau
      }
    }))
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'Les Chef plateau',
      result: {
        count_chefplateau
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
 * Fonction du rapport des chefs d'equipe
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 24/08/2023
 */

const agent_chefequipe=async(req,res)=>{
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
    // all chef equipe
    const chefequipe=await Users.findAll({
      where:{
        ID_PROFIL:PROFILS.CHEF_EQUIPE_SCANNING
      },
      attributes:['USERS_ID','NOM','PRENOM','EMAIL','TELEPHONE']
    })

    //compte le nombre des chefs equipes
    const count_chefequipe=await Promise.all(chefequipe.map(async countObject=>{
      const util=countObject.toJSON()
      const etapes_folio_histo_chefequipe=await Etapes_volume_historiques.findAndCountAll({
        where:{
          ID_ETAPE_VOLUME:ETAPES_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
          USER_TRAITEMENT:util.USERS_ID,
          ...dateWhere  
        },
        include:{
          model:Volume,
          as:'volum',
          required:true,
          attributes: ['ID_VOLUME', 'NUMERO_VOLUME'],
          include:{
            model:Etapes_volumes,
            as:'etapes_volumes',
            required:true,
            attributes:['ID_ETAPE_VOLUME','NOM_ETAPE']
          }
        }
      })
      return{
        ...util,
        etapes_folio_histo_chefequipe
      }
    }))
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'Les Chef equipe',
      result: {
        count_chefequipe
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
  phaseScanning,
  rapport_agent_desarchivage,
  agent_superviseur,
  agent_chefplateau,
  agent_chefequipe
}