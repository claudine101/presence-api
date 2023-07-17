
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table volume
* @author NDAYISABA claudined <claudined@mediabox.bi>
* @date 13/07/2023
* @returns 
*/
const Volume = sequelize.define("volume", {
    ID_VOLUME: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NUMERO_VOLUME: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    CODE_VOLUME: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    NOMBRE_DOSSIER: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_USERS: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    USER_TRAITEMENT: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_PV: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PV_PATH_RETOUR: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ID_MALLE: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_USER_AILE_DISTRIBUTEUR: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    PATH_PV_DISTRIBUTEUR: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PATH_PV_DISTRIBUTEUR_RETOUR: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ID_USER_AILE_SUPERVISEUR: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    PV_PATH_SUPERVISEUR: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PV_PATH_SUPERVISEUR_RETOUR: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ID_USER_AILE_PLATEAU: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    PV_PATH_PLATEAU: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ID_ETAPE_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
}
}, {
    freezeTableName: true,
    tableName: 'volume',
    timestamps: false,
})
module.exports = Volume