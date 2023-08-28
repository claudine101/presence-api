
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Nature= require('./Nature_folio');
const Etapes_folio =require('./Etapes_folio');
const Volume= require('./Volume')
const Equipes = require('./Equipes');
const Nature_folio = require("./Nature_folio");
const Syst_collines = require('./Syst_collines');
const Folio_documents = require('./Folio_documents');
const Users = require('./Users');
/**
* fonction model pour la creation de la table folio
* @author habiyakare leonard <leonard@mediabox.bi>
* @date 31/07/2023
* @returns 
*/

const Folio = sequelize.define("folio", {
    ID_FOLIO: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    ID_VOLUME: {
        type: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_NATURE: {
        type: DataTypes.INTEGER,
        allowNull: false,
       // field: 'ID_NATURE'
    },
    NUMERO_FOLIO: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    FOLIO:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    CODE_FOLIO: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ID_USERS: {
        type: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_ETAPE_FOLIO: {
        type: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IS_PREPARE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    NUMERO_PARCELLE: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    ID_COLLINE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    LOCALITE: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    NOM_PROPRIETAIRE: {
        type: DataTypes.STRING(25),
        allowNull: true
    },
    PRENOM_PROPRIETAIRE: {
        type: DataTypes.STRING(25),
        allowNull: true
    },

    PHOTO_DOSSIER: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    NUMERO_FEUILLE: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    NOMBRE_DOUBLON: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    ID_FOLIO_EQUIPE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_MALLE_NO_TRAITE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IS_RECONCILIE: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    IS_VALIDE: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    ID_MALLE_NO_SCANNE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_FLASH: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    IS_INDEXE: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    ID_FLASH_INDEXE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    IS_UPLOADED_EDRMS: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    IS_DOCUMENT_BIEN_ENREGISTRE: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'folio',
    timestamps: false,
})
Folio.belongsTo(Syst_collines, { foreignKey: "ID_COLLINE", as: 'colline' })
Folio.belongsTo(Etapes_folio, { foreignKey: "ID_ETAPE_FOLIO", as: 'etapes' })
Folio.belongsTo(Nature_folio, { foreignKey: "ID_NATURE", as: 'natures' })
Folio.belongsTo(Volume, { foreignKey: "ID_VOLUME", as: 'volume' })
Folio.belongsTo(Equipes, { foreignKey: "ID_FOLIO_EQUIPE", as: 'equipe' })
Folio.belongsTo(Nature, { foreignKey:"ID_NATURE", as: 'nature' })
Folio.belongsTo(Folio_documents, { foreignKey: "ID_FOLIO", as: 'documents' })
Folio.belongsTo(Users, { foreignKey: "ID_USERS", as: 'user' })


module.exports = Folio