
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

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
        allowNull: false
    },

    ID_NATURE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NUMERO_FOLIO: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    CODE_FOLIO: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ID_USERS: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_ETAPE_FOLIO: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NUMERO_PARCELLE: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ID_COLLINE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    LOCALITE: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    NOM_PROPRIETAIRE: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    PRENOM_PROPRIETAIRE: {
        type: DataTypes.STRING(25),
        allowNull: false
    },

    PHOTO_DOSSIER: {
        type: DataTypes.STRING,
        allowNull: true
    },
    NUMERO_FEUILLE: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    NOMBRE_DOUBLON: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    ID_FOLIO_EQUIPE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_MALLE_NO_TRAITE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IS_RECONCILIE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    IS_VALIDE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    ID_MALLE_NO_SCANNE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_FLASH: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    IS_INDEXE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    ID_FLASH_INDEXE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    IS_UPLOADED_EDRMS: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    IS_DOCUMENT_BIEN_ENREGISTRE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'folio',
    timestamps: false
})


module.exports = Folio