
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table etapes_volume_historiques
* @author NDAYISABA claudine <claudined@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Etapes_volume_historiques = sequelize.define("etapes_volume_historiques", {
    ID_VOLUME_HISTORIQUE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    USERS_ID: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    USER_TRAITEMENT: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_ETAPE_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'etapes_volume_historiques',
    timestamps: false,
})
module.exports = Etapes_volume_historiques