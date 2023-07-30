
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
    ID_MALLE_NO_TRAITE: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_MALLE_NO_SCANNE: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_AILE_SUP: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_AILE_SUP: {
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
    ID_VOLUME_CHEF_PLATEAU: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_CHEF_EQUIPE: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_AGENT_SUP_AILE_SCANNING: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_CHEF_PLATEAU_SCANNING: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_PV_VOLUME_RETOUR_CHEFEQUIPE: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_ETAPE_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_AGENT_DESARCHIVAGE: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    ID_VOLUME_AGENT_DESARCHIVAGE: {
        type: Sequelize.INTEGER(),
        allowNull: true
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