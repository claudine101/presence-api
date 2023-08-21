const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Folio = require("../../../models/Folio")

const { Op } = require("sequelize")
const Equipes = require("../../../models/Equipes")


/**
 * Fonction du rapport des dossiers scannes et non scanes par equipes,
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 21/08/2023
 */

const dossiers_scannes_non_scannees = async (req, res) => {
  const { equipedata } = req.params;
  try {
    const allPhasesCan = await Folio.findAll({
      attributes: ['NUMERO_FOLIO', 'CODE_FOLIO', 'NUMERO_PARCELLE', 'LOCALITE', 'NOM_PROPRIETAIRE',
        'PRENOM_PROPRIETAIRE', 'NOMBRE_DOUBLON', 'IS_RECONCILIE'],
      include: {
        model: Equipes,
        as: 'equipe',
        required: false,
        attributes: ['ID_EQUIPE', 'NOM_EQUIPE']
      },
      where: {
        ID_FOLIO_EQUIPE:equipedata || '',
        // IS_RECONCILIE: {
        //   [Op.in]: [0, 1,'NULL']
        // }
      }
    });

    // console.log(equipedata)

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'les dossiers',
      result: allPhasesCan
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
 * Fonction pour lister les equipes
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 21/08/2023
 */

const equipesAll = async (req, res) => {
  try {

    const equipe = await Equipes.findAll({
      attributes: ['ID_EQUIPE', 'NOM_EQUIPE']
    })
    // console.log(equipe)

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'les equipes',
      result: equipe
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
  dossiers_scannes_non_scannees,
  equipesAll

}