
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table aile
* @author derick <derick@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Notifications = sequelize.define("notifications", {
    ID_NOTIFICATION: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    USER_ID: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    MESSAGE: {
        type: Sequelize.TEXT,
        allowNull: false
    },
     TELEPHONE: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
     DATE_INSERTION: {
        type: Sequelize.DATE ,
        allowNull: false,
        defaultValue:DataTypes.NOW
    },
    NUMERO_PLAQUE: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    STATUT: {
        type: Sequelize.INTEGER(1),
        allowNull: false
    },
    IS_AGENT_PSR: {
        type: Sequelize.INTEGER(2),
        allowNull: false
    },
    ID_PSR_ELEMENT: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },

}, {
    freezeTableName: true,
    tableName: 'notifications',
    timestamps: false,
})
module.exports = Notifications