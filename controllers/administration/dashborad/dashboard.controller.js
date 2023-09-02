const express = require("express");
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS");
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO");
const IDS_ETAPE_VOLUME = require("../../../constants/ETAPES_VOLUME");
const PROFILS = require("../../../constants/PROFILS");
const { query } = require("../../../utils/db");
const Etapes_folio = require("../../../models/Etapes_folio");
const Nature_folio = require("../../../models/Nature_folio");
const Folio = require("../../../models/Folio");
const Volume = require("../../../models/Volume");
const { Op, where, DATE,Sequelize } = require("sequelize");
const moment = require("moment");
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques");
const Users = require("../../../models/Users");
const Etapes_volumes = require("../../../models/Etapes_volumes");
const Etapes_volume_historiques = require("../../../models/Etapes_volume_historiques");

/**
 * permet d'afficher les rapport des volumes et des dossiers
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 * @date 2/9/2023
 *
 */

const countAndProgressionActivity = async (req, res) => {
  try{
    const allvolumes = await Volume.findAndCountAll({
         attributes: ['ID_VOLUME','NUMERO_VOLUME','ID_ETAPE_VOLUME','DATE_INSERTION'],
         where: {
         DATE_INSERTION:Sequelize.literal(`DATE(DATE_INSERTION) = CURDATE()`)
         },
    })
    const foliocount= await Folio.count({
        where: {
            ID_VOLUME: allvolumes.rows.map((volume) => volume.ID_VOLUME),
          },
    })
  
    //folio prepare
    const folioprepare = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_PREPARE : 1,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })

      //folio non  prepare
      const foliononprepare = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_PREPARE : 0,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })
      //folio   scan
      const folioscan = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_RECONCILIE : 1,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })
    //folio non scan
    const foliononscan = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_RECONCILIE : 0,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })

    //folio indexe
    const folioindexe = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_INDEXE : 1,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })
    //folio non indexe
    const foliononindexe = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_INDEXE : 0,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })
     //folio upload
     const folioupload = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_UPLOADED_EDRMS : 1,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })
    //folio non indexe
    const foliononuploade = await Folio.findAndCountAll({
       
        attributes :['ID_FOLIO','NUMERO_FOLIO','CODE_FOLIO'],
        where:{
            IS_UPLOADED_EDRMS : 0,
            DATE_INSERTION: Sequelize.literal('DATE(DATE_INSERTION) = CURDATE()'),
        }
    })

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_CODES.OK,
      message: "les dossiers",
      result: {
            allvolumes,
             foliocount,
            folioprepare,
            foliononprepare,
            foliononscan,
            folioscan,
            folioindexe,
            foliononindexe,
            folioupload,
            foliononuploade
      },
    });
  } catch (error) {
    console.log(error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Erreur interne du serveur, réessayer plus tard",
    });
  }
};

/**
 * permet d'afficher les rapport par phase 
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 * @date 2/9/2023
 *
 */

const rapportByphase = async (req, res) => {
    try {
      
      const folios = await Folio.findAll({
        attributes: [
          "ID_FOLIO",
          "IS_INDEXE",
        ],
        where: {
          ID_ETAPE_FOLIO: { 
          }
        },
      });
      const uniqueIds = [];
      const volumesPure = folios.filter((element) => {
        const isDuplicate = uniqueIds.includes(element.toJSON().ID_VOLUME);
        if (!isDuplicate) {
          uniqueIds.push(element.toJSON().ID_VOLUME);
          return true;
        }
        return false;
      });
  
      const volumes = await Promise.all(
        volumesPure.map(async (volume) => {
          const agentIndexation = await Etapes_folio_historiques.findOne({
            attributes: ["ID_ETAPE_FOLIO"],
          });
          const folioindexe = folios.filter(
            (f) => f.toJSON().IS_INDEXE == 1
          );
          const foliononindexe = folios.filter(
            (f) => f.toJSON().IS_INDEXE == 0
          );
          return {
            ...volume.toJSON(),
            folioindexe,
            foliononindexe,
            agentIndexation,
          };
        })
      );
      res.status(RESPONSE_CODES.OK).json({
        statusCode: RESPONSE_CODES.OK,
        httpStatus: RESPONSE_STATUS.OK,
        message: "Le nombre de volume scanner   est egal à",
        result: volumes,
        totalRecords: volumes.length,
      });
    } catch (error) {
      console.log(error);
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
        statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
        message: "Erreur interne du serveur, réessayer plus tard",
      });
    }
  };




module.exports = {
    countAndProgressionActivity,
    rapportByphase
};
