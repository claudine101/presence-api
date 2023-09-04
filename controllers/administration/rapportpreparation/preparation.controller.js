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
const { Op, where } = require("sequelize");
const moment = require("moment");
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques");
const Users = require("../../../models/Users");
const Etapes_volumes = require("../../../models/Etapes_volumes");
const Etapes_volume_historiques = require("../../../models/Etapes_volume_historiques");

/**
 * permet d'afficher les volumes planifier par utilisateurs
 * @author derick <nirema.eloge@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 * @date 24/08/2023
 *
 */

const find_volume_planifie = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Date filter
    var dateWhere = {};
    if (startDate) {
      const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
      const endDateFormat = endDate
        ? moment(endDate).format("YYYY-MM-DD 23:59:59")
        : moment().format("YYYY-MM-DD 23:59:59");
      dateWhere = {
        DATE_INSERTION: {
          [Op.between]: [startDateFormat, endDateFormat],
        },
      };
    }

    //find all users
    const users = await Users.findAll({
      attributes: [
        `USERS_ID`,
        `NOM`,
        `PRENOM`,
        `EMAIL`,
        `TELEPHONE`,
        `ID_PROFIL`,
      ],
      where: {
        ID_PROFIL: PROFILS.CHEF_DIVISION_ARCHIGES,
      },
    });
    //count dossiers uploades
    const planifier = await Promise.all(
      users.map(async (countObject) => {
        const util = countObject.toJSON();
        const volumes = await Etapes_volume_historiques.findAndCountAll({
          attributes: ["ID_VOLUME_HISTORIQUE", "USERS_ID", "ID_VOLUME","DATE_INSERTION"],
          where: {
            USERS_ID: util.USERS_ID,
            ...dateWhere,
          },
          include: [
            {
              model: Volume,
              as: "volumes",
              attributes: ["ID_VOLUME", "NUMERO_VOLUME", "CODE_VOLUME"],
              where: {
                ...dateWhere,
              },
            },
             {
              model: Etapes_volumes,
              as: "etapes_volumes",
              attributes: ["NOM_ETAPE"],
            },
          ],
        });

        return {
          ...util,
          volumes,
        };
      })
    );
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_CODES.OK,
      message: "les dossiers",
      result: {
        planifier,
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
 * permet d'afficher les rapport des  les volumes preparees  par utilisateurs
 * @author derick <nirema.eloge@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 * @date 24/08/2023
 *
 */

const find_volume_prepare = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Date filter
    var dateWhere = {};
    if (startDate) {
      const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
      const endDateFormat = endDate
        ? moment(endDate).format("YYYY-MM-DD 23:59:59")
        : moment().format("YYYY-MM-DD 23:59:59");
      dateWhere = {
        DATE_INSERTION: {
          [Op.between]: [startDateFormat, endDateFormat],
        },
      };
    }

    //find all users
    const users = await Users.findAll({
      attributes: [
        `USERS_ID`,
        `NOM`,
        `PRENOM`,
        `EMAIL`,
        `TELEPHONE`,
        `ID_PROFIL`,
      ],
      where: {
        ID_PROFIL: PROFILS.AGENT_SUPERVISEUR,
      },
    });

    const prepared = await Promise.all(
      users.map(async (countObject) => {
        const util = countObject.toJSON();
        const folio_prepared = await Etapes_folio_historiques.findAll({
          attributes: ["ID_FOLIO_HISTORIQUE", "ID_USER", "ID_FOLIO","DATE_INSERTION"],
          where: {
            ID_USER: util.USERS_ID,
            ...dateWhere,
          },
          include: [
            {
              model: Folio,
              as: "folio",
              attributes: ["ID_FOLIO", "NUMERO_FOLIO", "FOLIO", "IS_PREPARE"],
              where: {
                IS_PREPARE: 1,
              },
              include: [{
                model: Nature_folio,
                as: "natures",
                attributes: ["ID_NATURE_FOLIO", "DESCRIPTION"],
              },{
                model: Volume,
                as: "volume",
                attributes: ["ID_VOLUME", "NUMERO_VOLUME"],
              },{
                model: Etapes_folio,
                as: "etapes",
                attributes: ["NOM_ETAPE"],
              }]
            },{
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
            },
          ],
        });

        const uniqueIds = [];
        const folio_prepared_filter = folio_prepared.filter((element) => {
          const isDuplicate = uniqueIds.includes(element.toJSON().ID_FOLIO);
          if (!isDuplicate) {
            uniqueIds.push(element.toJSON().ID_FOLIO);
            return true;
          }
          return false;
        });

        const folio_non_prepared = await Etapes_folio_historiques.findAll({
          attributes: ["ID_FOLIO_HISTORIQUE", "ID_USER", "ID_FOLIO","DATE_INSERTION"],
          where: {
            ID_USER: util.USERS_ID,
            ID_ETAPE_FOLIO: {
              [Op.in]: [
                IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                IDS_ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
                IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU,
                IDS_ETAPES_FOLIO.METTRE_FOLIO_FLASH,
                IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_AILE_INDEXATION,
                IDS_ETAPES_FOLIO.SELECTION_CHEF_PLATEAU_INDEXATION,
                IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
                IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                IDS_ETAPES_FOLIO.RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE,
                IDS_ETAPES_FOLIO.RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE,
                IDS_ETAPES_FOLIO.CHEF_EQUIPE_EDRMS,
                IDS_ETAPES_FOLIO.SELECTION_AGENT_EDRMS,
                IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS,
                IDS_ETAPES_FOLIO.FOLIO_NO_UPLOADED_EDRMS,
                IDS_ETAPES_FOLIO.SELECTION_VERIF_EDRMS,
                IDS_ETAPES_FOLIO.FOLIO_ENREG_TO_EDRMS,
                IDS_ETAPES_FOLIO.FOLIO_NO_ENREG_TO_EDRMS,
              ],
            },
          },
          include: [
            {
              model: Folio,
              as: "folio",
              attributes: ["ID_FOLIO", "NUMERO_FOLIO", "FOLIO", "IS_PREPARE"],
              where: {
                IS_PREPARE: 0,
              },
              include: [{
                model: Nature_folio,
                as: "natures",
                attributes: ["ID_NATURE_FOLIO", "DESCRIPTION"],
              },{
                model: Volume,
                as: "volume",
                attributes: ["ID_VOLUME", "NUMERO_VOLUME"],
              },{
                model: Etapes_folio,
                as: "etapes",
                attributes: ["NOM_ETAPE"],
              }]
            },{
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
            }
          ],
        });

        const uniqueId = [];
        const folio_non_preparedfilter = folio_non_prepared.filter(
          (element) => {
            const isDuplicate = uniqueId.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
              uniqueId.push(element.toJSON().ID_FOLIO);
              return true;
            }
            return false;
          }
        );

        return {
          ...util,
          //   folio_prepared
          folio_prepared_filter,
          folio_non_preparedfilter,
        };
      })
    );
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_CODES.OK,
      message: "les dossiers",
      result: {
        prepared,
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
 * rapport des agents chefs plateau phase preparation
 * @param {express.Request} req
 * @param {express.Response} res
 * @author Eloge<nirema.eloge@mediabox.bi>
 * @date 24/08/2023
 */

const agent_chefplateau_preparation = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Date filter
    var dateWhere = {};
    if (startDate) {
      const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
      const endDateFormat = endDate
        ? moment(endDate).format("YYYY-MM-DD 23:59:59")
        : moment().format("YYYY-MM-DD 23:59:59");
      dateWhere = {
        DATE_INSERTION: {
          [Op.between]: [startDateFormat, endDateFormat],
        },
      };
    }
    // all chef plateau
    const chefplateau = await Users.findAll({
      where: {
        ID_PROFIL: PROFILS.CHEF_PLATEAU,
      },
      attributes: ["USERS_ID", "NOM", "PRENOM", "EMAIL", "TELEPHONE"],
    });

    //compte le nombre des chef plateau
    const count_chefplateau = await Promise.all(
      chefplateau.map(async (countObject) => {
        const util = countObject.toJSON();
        const etapes_folio_histo_chefplateau = await Etapes_folio_historiques.findAndCountAll(
          {
            attributes:["DATE_INSERTION"],
            where: {
              ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP,
              ID_USER: util.USERS_ID,
              ...dateWhere,
            },
            include: [{
              model: Folio,
              as: "folio",
              required: true,
              attributes: ["ID_FOLIO", "FOLIO", "NUMERO_FOLIO"],
              include: [
                {
                  model: Volume,
                  as: "volume",
                  required: true,
                  attributes: ["ID_VOLUME", "NUMERO_VOLUME"],
                },
                {
                  model: Nature_folio,
                  as: "natures",
                  required: true,
                  attributes: ["ID_NATURE_FOLIO", "DESCRIPTION"],
                },
                {
                  model: Etapes_folio,
                  as: "etapes",
                  required: true,
                  attributes: ["ID_ETAPE_FOLIO", "NOM_ETAPE", "ID_PHASE"],
                },
              ],
            },{
              model: Etapes_folio,
              as: "etapes",
              required: true,
              attributes: ["ID_ETAPE_FOLIO", "NOM_ETAPE", "ID_PHASE"],
            }],
          }
        );
        return {
          ...util,
          etapes_folio_histo_chefplateau,
        };
      })
    );
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Les Chef plateau",
      result: {
        count_chefplateau,
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
 * Fonction du rapport des chefs d'equipe phase preparation
 * @param {express.Request} req
 * @param {express.Response} res
 * @author Eloge<nirema.eloge@mediabox.bi>
 * @date 24/08/2023
 */

const agent_chefequipe_preparation = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Date filter
    var dateWhere = {};
    if (startDate) {
      const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
      const endDateFormat = endDate
        ? moment(endDate).format("YYYY-MM-DD 23:59:59")
        : moment().format("YYYY-MM-DD 23:59:59");
      dateWhere = {
        DATE_INSERTION: {
          [Op.between]: [startDateFormat, endDateFormat],
        },
      };
    }
    // all chef equipe
    const chefequipe = await Users.findAll({
      where: {
        ID_PROFIL: PROFILS.CHEF_EQUIPE,
      },
      attributes: ["USERS_ID", "NOM", "PRENOM", "EMAIL", "TELEPHONE"],
    });

    //compte le nombre des chefs equipes
    const count_chefequipe = await Promise.all(
      chefequipe.map(async (countObject) => {
        const util = countObject.toJSON();
        const etapes_folio_histo_chefequipe = await Etapes_volume_historiques.findAndCountAll(
          {
            where: {
              ID_ETAPE_VOLUME: IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
              USERS_ID: util.USERS_ID,
              ...dateWhere,
            },
            include: [{
              model: Volume,
                  as: "volume",
                  required: true,
                  attributes: ["ID_VOLUME", "NUMERO_VOLUME"],
              include: [
                {
                  model: Etapes_volumes,
                  as: "etapes_volumes",
                  required: true,
                  attributes: ["ID_ETAPE_VOLUME", "NOM_ETAPE"],
                },
              ],
            }],
          }
        );
        return {
          ...util,
          etapes_folio_histo_chefequipe,
        };
      })
    );
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Les Chef equipe",
      result: {
        count_chefequipe,
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
 * Fonction du rapport des agents superviseur,
 * @param {express.Request} req
 * @param {express.Response} res
 * @author Eloge<nirema.eloge@mdiabox.bi>
 * @date 24/08/2023
 */

const agent_superviseur_preparation = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Date filter
    var dateWhere = {};
    if (startDate) {
      const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
      const endDateFormat = endDate
        ? moment(endDate).format("YYYY-MM-DD 23:59:59")
        : moment().format("YYYY-MM-DD 23:59:59");
      dateWhere = {
        DATE_INSERTION: {
          [Op.between]: [startDateFormat, endDateFormat],
        },
      };
    }
    // all agent superviseur
    const agent_superviseur = await Users.findAll({
      where: {
        ID_PROFIL: PROFILS.AGENT_SUPERVISEUR,
      },
      attributes: ["USERS_ID", "NOM", "PRENOM", "EMAIL", "TELEPHONE"],
    });

    //compte le nombre des agents superviseur
    const count_agentsuperviseur = await Promise.all(
      agent_superviseur.map(async (countObject) => {
        const util = countObject.toJSON();
        const etapes_folio_histo_agent_sup = await Etapes_folio_historiques.findAndCountAll(
          {
            attributes :["DATE_INSERTION"],
            where: {
              ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
              ID_USER: util.USERS_ID,
              ...dateWhere,
            },
            include: [{
              model: Folio,
              as: "folio",
              required: true,
              attributes: ["ID_FOLIO", "FOLIO", "NUMERO_FOLIO"],
              include: [
                {
                  model: Volume,
                  as: "volume",
                  required: true,
                  attributes: ["ID_VOLUME", "NUMERO_VOLUME"],
                },
                {
                  model: Nature_folio,
                  as: "natures",
                  required: true,
                  attributes: ["ID_NATURE_FOLIO", "DESCRIPTION"],
                }
              ],
            },{
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
            }],
          }
        );
        return {
          ...util,
          etapes_folio_histo_agent_sup,
        };
      })
    );
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Les agents de superviseurs",
      result: {
        count_agentsuperviseur,
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

module.exports = {
  find_volume_planifie,
  find_volume_prepare,
  agent_chefplateau_preparation,
  agent_chefequipe_preparation,
  agent_superviseur_preparation,
};
