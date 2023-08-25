const express = require("express");
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS");
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO");
const IDS_ETAPE_VOLUME = require("../../../constants/ETAPES_VOLUME");
const { Op } = require("sequelize");
const Volume = require("../../../models/Volume");
const Folio = require("../../../models/Folio");
const Etapes_volumes = require("../../../models/Etapes_volumes");
const Etapes_volume_historiques = require("../../../models/Etapes_volume_historiques");
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques");
const Users = require("../../../models/Users");
const natures = require("../../../models/Nature_folio");
const Etapes_folio = require("../../../models/Etapes_folio");

/**
 * Permet d'afficher tous les volumes qui ont passe sur l'etape de planification
 * @date 18/08/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const planification = async (req, res) => {
  try {
    const { rows = 10, first = 0, sortField, sortOrder, search } = req.query;
    const defaultSortDirection = "DESC";
    const sortColumns = {
      volume: {
        as: "volume",
        fields: {
          NUMERO_VOLUME: "NUMERO_VOLUME",
          NOMBRE_DOSSIER: "NOMBRE_DOSSIER",
          DATE_INSERTION: "DATE_INSERTION",
        },
      },
    };

    var orderColumn, orderDirection;

    // sorting
    var sortModel;
    if (sortField) {
      for (let key in sortColumns) {
        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
          sortModel = {
            model: key,
            as: sortColumns[key].as,
          };
          orderColumn = sortColumns[key].fields[sortField];
          break;
        }
      }
    }
    if (!orderColumn || !sortModel) {
      orderColumn = sortColumns.volume.fields.NUMERO_VOLUME;
      sortModel = {
        model: "Etapes_volume_historiques",
        as: sortColumns.volume,
      };
    }

    // ordering
    if (sortOrder == 1) {
      orderDirection = "ASC";
    } else if (sortOrder == -1) {
      orderDirection = "DESC";
    } else {
      orderDirection = defaultSortDirection;
    }
    // searching
    const globalSearchColumns = [
      "$volume.NUMERO_VOLUME$",
      "$volume.NOMBRE_DOSSIER$",
      "$volume.DATE_INSERTION$",
    ];
    var globalSearchWhereLike = {};
    if (search && search.trim() != "") {
      const searchWildCard = {};
      globalSearchColumns.forEach((column) => {
        searchWildCard[column] = {
          [Op.substring]: search,
        };
      });
      globalSearchWhereLike = {
        [Op.or]: searchWildCard,
      };
    }
    const result = await Volume.findAndCountAll({
      limit: parseInt(rows),
      offset: parseInt(first),
      order: [[sortModel, orderColumn, orderDirection]],
      attributes: [
        "NUMERO_VOLUME",
        "NOMBRE_DOSSIER",
        "DATE_INSERTION",
        "ID_VOLUME",
      ],
      where: {
        ...globalSearchWhereLike,
      },
      include: [
        {
          model: Etapes_volumes,
          as: "etapes_volumes",
          attributes: ["NOM_ETAPE"],
          required: false,
        },
      ],
    });

    const volumes = await Promise.all(
      result.rows.map(async (volume) => {
        const foliovolume = await Folio.findAll({
          where: {
            ID_VOLUME: volume.toJSON().ID_VOLUME,
          },
          attributes: [
            "NUMERO_FOLIO",
            "CODE_FOLIO",
            "ID_FOLIO",
            "ID_VOLUME",
            "ID_NATURE",
            "IS_PREPARE",
          ],
          include: [
            {
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
              required: false,
            },
            {
              model: natures,
              as: "natures",
              attributes: ["DESCRIPTION"],
              required: false,
            },{
              model: Volume,
              as: "volume",
              attributes: ["NUMERO_VOLUME"]
            }
          ],
        });
        return {
          ...volume.toJSON(),
          foliovolume,
        };
      })
    );
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Liste des utilisateurs",
      result: {
        data: volumes,
        totalRecords: result.count,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape de des Désarchivage
 * @date  18/08/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const desarchivage = async (req, res) => {
  try {
    const { rows = 10, first = 0, sortField, sortOrder, search } = req.query;
    const defaultSortDirection = "ASC";
    const sortColumns = {
      volume: {
        as: "volume",
        fields: {
          NUMERO_VOLUME: "NUMERO_VOLUME",
          NOMBRE_DOSSIER: "NOMBRE_DOSSIER",
          DATE_INSERTION: "DATE_INSERTION",
        },
      },
    };

    var orderColumn, orderDirection;
    var sortModel;
    if (sortField) {
      for (let key in sortColumns) {
        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
          sortModel = {
            model: key,
            as: sortColumns[key].as,
          };
          orderColumn = sortColumns[key].fields[sortField];
          break;
        }
      }
    }
    if (!orderColumn || !sortModel) {
      orderColumn = sortColumns.volume.fields.NUMERO_VOLUME;
      sortModel = {
        model: "users",
        as: sortColumns.volume,
      };
    }

    // ordering
    if (sortOrder == 1) {
      orderDirection = "ASC";
    } else if (sortOrder == -1) {
      orderDirection = "DESC";
    } else {
      orderDirection = defaultSortDirection;
    }

    // searching
    const globalSearchColumns = [
      "$volume.NUMERO_VOLUME$",
      "$volume.NOMBRE_DOSSIER$",
      "$volume.DATE_INSERTION$",
    ];
    var globalSearchWhereLike = {};
    if (search && search.trim() != "") {
      const searchWildCard = {};
      globalSearchColumns.forEach((column) => {
        searchWildCard[column] = {
          [Op.substring]: search,
        };
      });
      globalSearchWhereLike = {
        [Op.or]: searchWildCard,
      };
    }

    const result = await Volume.findAndCountAll({
      limit: parseInt(rows),
      offset: parseInt(first),
      order: [[sortModel, orderColumn, orderDirection]],
      attributes: [
        "NUMERO_VOLUME",
        "NOMBRE_DOSSIER",
        "DATE_INSERTION",
        "ID_VOLUME",
      ],
      where: {
        ...globalSearchWhereLike,
        ID_ETAPE_VOLUME: {
          [Op.in]: [
            IDS_ETAPE_VOLUME.SAISIS_NOMBRE_FOLIO,
            IDS_ETAPE_VOLUME.DETAILLER_LES_FOLIO,
            IDS_ETAPE_VOLUME.CHOIX_DES_AILES,
            IDS_ETAPE_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES,
            IDS_ETAPE_VOLUME.CHOIX_CHEF_PLATAEU,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_PLATEAU,
            IDS_ETAPE_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
            IDS_ETAPE_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES,
            IDS_ETAPE_VOLUME.RESELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_NON_TRAITES,
            IDS_ETAPE_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_VERS_CHEF_EQUIPE_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
          ],
        },
      },
      include: [
        {
          model: Etapes_volumes,
          as: "etapes_volumes",
          attributes: ["NOM_ETAPE"],
          required: false,
        },
      ],
    });

    const volumes = await Promise.all(
      result.rows.map(async (volume) => {
        const foliovolume = await Folio.findAll({
          where: {
            ID_VOLUME: volume.toJSON().ID_VOLUME,
          },
          attributes: [
            "NUMERO_FOLIO",
            "CODE_FOLIO",
            "ID_FOLIO",
            "ID_VOLUME",
            "ID_NATURE",
            "IS_PREPARE",
          ],
          include: [
            {
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
              required: false,
            },
            {
              model: natures,
              as: "natures",
              attributes: ["DESCRIPTION"],
              required: false,
            },{
              model: Volume,
              as: "volume",
              attributes: ["NUMERO_VOLUME"]
            }
          ],
        });
        return {
          ...volume.toJSON(),
          foliovolume,
        };
      })
    );

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Liste",
      result: {
        data: volumes,
        totalRecords: result.count,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape de des trasmission des volumes
 * @date  18/08/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const transmission = async (req, res) => {
  try {
    const { rows = 10, first = 0, sortField, sortOrder, search } = req.query;
    const defaultSortDirection = "ASC";
    const sortColumns = {
      volume: {
        as: "volume",
        fields: {
          NUMERO_VOLUME: "NUMERO_VOLUME",
          NOMBRE_DOSSIER: "NOMBRE_DOSSIER",
          DATE_INSERTION: "DATE_INSERTION",
        },
      },
    };

    var orderColumn, orderDirection;
    var sortModel;
    if (sortField) {
      for (let key in sortColumns) {
        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
          sortModel = {
            model: key,
            as: sortColumns[key].as,
          };
          orderColumn = sortColumns[key].fields[sortField];
          break;
        }
      }
    }
    if (!orderColumn || !sortModel) {
      orderColumn = sortColumns.volume.fields.NUMERO_VOLUME;
      sortModel = {
        model: "users",
        as: sortColumns.volume,
      };
    }

    // ordering
    if (sortOrder == 1) {
      orderDirection = "ASC";
    } else if (sortOrder == -1) {
      orderDirection = "DESC";
    } else {
      orderDirection = defaultSortDirection;
    }

    // searching
    const globalSearchColumns = [
      "$volume.NUMERO_VOLUME$",
      "$volume.NOMBRE_DOSSIER$",
      "$volume.DATE_INSERTION$",
    ];
    var globalSearchWhereLike = {};
    if (search && search.trim() != "") {
      const searchWildCard = {};
      globalSearchColumns.forEach((column) => {
        searchWildCard[column] = {
          [Op.substring]: search,
        };
      });
      globalSearchWhereLike = {
        [Op.or]: searchWildCard,
      };
    }

    const result = await Volume.findAndCountAll({
      limit: parseInt(rows),
      offset: parseInt(first),
      order: [[sortModel, orderColumn, orderDirection]],
      attributes: [
        "NUMERO_VOLUME",
        "NOMBRE_DOSSIER",
        "DATE_INSERTION",
        "ID_VOLUME",
      ],
      where: {
        ...globalSearchWhereLike,
        ID_ETAPE_VOLUME: {
          [Op.in]: [
            IDS_ETAPE_VOLUME.CHOIX_DES_AILES,
            IDS_ETAPE_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES,
            IDS_ETAPE_VOLUME.CHOIX_CHEF_PLATAEU,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_PLATEAU,
            IDS_ETAPE_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
            IDS_ETAPE_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES,
            IDS_ETAPE_VOLUME.RESELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_NON_TRAITES,
            IDS_ETAPE_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_VERS_CHEF_EQUIPE_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
          ],
        },
      },
      include: [
        {
          model: Etapes_volumes,
          as: "etapes_volumes",
          attributes: ["NOM_ETAPE"],
          required: false,
        },
      ],
    });

    const volumes = await Promise.all(
      result.rows.map(async (volume) => {
        const foliovolume = await Folio.findAll({
          where: {
            ID_VOLUME: volume.toJSON().ID_VOLUME,
          },
          attributes: [
            "NUMERO_FOLIO",
            "CODE_FOLIO",
            "ID_FOLIO",
            "ID_VOLUME",
            "ID_NATURE",
            "IS_PREPARE",
          ],
          include: [
            {
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
              required: false,
            },
            {
              model: natures,
              as: "natures",
              attributes: ["DESCRIPTION"],
              required: false,
            },
            {
              model: Volume,
              as: "volume",
              attributes: ["NUMERO_VOLUME"]
            }
          ],
        });
        return {
          ...volume.toJSON(),
          foliovolume,
        };
      })
    );

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Liste des utilisateurs",
      result: {
        data: volumes,
        totalRecords: result.count,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape de preparation
 * @date  18/08/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const etiquetage = async (req, res) => {
  try {
    const result = await Volume.findAndCountAll({
      attributes: [
        "NUMERO_VOLUME",
        "NOMBRE_DOSSIER",
        "DATE_INSERTION",
        "ID_VOLUME",
      ],
      where: {
        ID_ETAPE_VOLUME: {
          [Op.in]: [
            IDS_ETAPE_VOLUME.CHOIX_DES_AILES,
            IDS_ETAPE_VOLUME.CHOIX_AGENT_SUPERVISEUR_DES_AILES,
            IDS_ETAPE_VOLUME.CHOIX_CHEF_PLATAEU,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_PLATEAU,
            IDS_ETAPE_VOLUME.SELECTION_CHEF_EQUIPE_SCANNING,
            IDS_ETAPE_VOLUME.SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES,
            IDS_ETAPE_VOLUME.RESELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_NON_TRAITES,
            IDS_ETAPE_VOLUME.SELECTION_CHEF_PLATEAU_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_VERS_CHEF_EQUIPE_SCANNING,
            IDS_ETAPE_VOLUME.RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE,
            IDS_ETAPE_VOLUME.RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE,
          ],
        },
      },
      include: [
        {
          model: Etapes_volumes,
          as: "etapes_volumes",
          attributes: ["NOM_ETAPE"],
          required: false,
        },
      ],
    });

    const volumes = await Promise.all(
      result.rows.map(async (volume) => {
        const foliovolume = await Folio.findAll({
          where: {
            ID_VOLUME: volume.toJSON().ID_VOLUME,
          },
          attributes: [
            "NUMERO_FOLIO",
            "CODE_FOLIO",
            "ID_FOLIO",
            "ID_VOLUME",
            "ID_NATURE",
            "IS_PREPARE",
          ],
          include: [
            {
              model: Etapes_folio,
              as: "etapes",
              attributes: ["NOM_ETAPE"],
              required: false,
            },
            {
              model: natures,
              as: "natures",
              attributes: ["DESCRIPTION"],
              required: false,
            },
            {
              model: Volume,
              as: "volume",
              attributes: ["NUMERO_VOLUME"]
            }
          ],
        });
        const folioprepared = await Folio.findAll({
          where: {
            ID_VOLUME: volume.toJSON().ID_VOLUME,
            IS_PREPARE: 1,
          },
          include: [
            {
              model: natures,
              as: "natures",
              attributes: ["DESCRIPTION"],
              required: false,
            },
             {
              model: Volume,
              as: "volume",
              attributes: ["NUMERO_VOLUME"]
            }
          ],
        });
        const foliononprepared = await Folio.findAll({
          where: {
            ID_VOLUME: volume.toJSON().ID_VOLUME,
            IS_PREPARE: 0,
          },
          include: [
            {
              model: natures,
              as: "natures",
              attributes: ["DESCRIPTION"],
              required: false,
            },
            {
              model: Volume,
              as: "volume",
              attributes: ["NUMERO_VOLUME"]
            }
          ],
        });

        return {
          ...volume.toJSON(),
          foliovolume,
          folioprepared,
          foliononprepared,
        };
      })
    );

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Le nombre de volume scanner   est egal à",
      result: volumes,
      totalRecords: result.count,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape d'indexation
 * @date  18/08/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const indexation = async (req, res) => {
  try {
    const { rows = 10, first = 0, sortField, sortOrder, search } = req.query;
    const defaultSortDirection = "ASC";

    const sortColumns = {
      volume: {
        as: "volume",
        fields: {
          NUMERO_VOLUME: "NUMERO_VOLUME",
          NOMBRE_DOSSIER: "NOMBRE_DOSSIER",
          DATE_INSERTION: "DATE_INSERTION",
        },
      },
    };

    var orderColumn, orderDirection;
    var sortModel;
    if (sortField) {
      for (let key in sortColumns) {
        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
          sortModel = {
            model: key,
            as: sortColumns[key].as,
          };
          orderColumn = sortColumns[key].fields[sortField];
          break;
        }
      }
    }
    if (!orderColumn || !sortModel) {
      orderColumn = sortColumns.volume.fields.NUMERO_VOLUME;
      sortModel = {
        model: "Etapes_volume_historiques",
        as: sortColumns.volume,
      };
    }

    // ordering
    if (sortOrder == 1) {
      orderDirection = "ASC";
    } else if (sortOrder == -1) {
      orderDirection = "DESC";
    } else {
      orderDirection = defaultSortDirection;
    }

    // searching
    const globalSearchColumns = [
      "$volume.NUMERO_VOLUME$",
      "$volume.NOMBRE_DOSSIER$",
      "$agentIndexation.traitement.NOM$",
      "$agentIndexation.traitement.PRENOM$",
    ];
    var globalSearchWhereLike = {};
    if (search && search.trim() != "") {
      const searchWildCard = {};
      globalSearchColumns.forEach((column) => {
        searchWildCard[column] = {
          [Op.substring]: search,
        };
      });
      globalSearchWhereLike = {
        [Op.or]: searchWildCard,
      };
    }
    const folios = await Folio.findAll({
      limit: parseInt(rows),
      offset: parseInt(first),
      attributes: [
        "NUMERO_FOLIO",
        "CODE_FOLIO",
        "ID_FOLIO",
        "ID_VOLUME",
        "ID_NATURE",
        "IS_INDEXE",
      ],
      where: {
        ...globalSearchWhereLike,
        ID_ETAPE_FOLIO: {
          [Op.in]: [
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
      include: [{
        model: Volume,
        as: "volume",
        attributes: [
          "NOMBRE_DOSSIER",
          "NUMERO_VOLUME",
          "CODE_VOLUME",
          "ID_VOLUME",
        ],
        required: false,
        include: [
          {
            model: Etapes_volumes,
            as: "etapes_volumes",
            attributes: ["NOM_ETAPE"],
            required: false,
          },
        ],
      },{
        model: natures,
        as: "natures",
        attributes: ["DESCRIPTION"],
        required: false,
      }
    ],
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
          where: {
            ID_ETAPE_FOLIO: IDS_ETAPES_FOLIO.SELECTION_AGENT_INDEXATION,
          },
          include: [
            {
              model: Folio,
              as: "folio",
              attributes: ["ID_FOLIO"],
              required: true,
              where: {
                ID_VOLUME: volume.volume.ID_VOLUME,
              },
            },
            {
              model: Users,
              as: "traitement",
              attributes: ["NOM", "PRENOM", "PHOTO_USER"],
              required: true,
            },
          ],
        });
        const foliovolume = folios.filter(
          (f) => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME
        );
        const folioindexe = folios.filter(
          (f) =>
            volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME &&
            f.toJSON().IS_INDEXE == 1
        );
        const foliononindexe = folios.filter(
          (f) =>
            volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME &&
            f.toJSON().IS_INDEXE == 0
        );
        return {
          ...volume.toJSON(),
          foliovolume,
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
  planification,
  desarchivage,
  transmission,
  etiquetage,
  indexation,
};
