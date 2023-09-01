
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table ordres_incident
* @author Vanny Boy <vanny@mediabox.bi>
* @date 1/09/2023
* @returns 
*/
const Ordres_incident = sequelize.define("ordres_incident", {
        ID_ORDRE_INCIDENT: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ORDRE_INCIDENT: {
                type: DataTypes.STRING(50),
                allowNull: false
        },
        IS_AUTRE: {
                type: DataTypes.INTEGER(),
                allowNull: false
        },
        ID_USER: {
                type: DataTypes.INTEGER(),
                allowNull: false
        },
        DATE_INSERTION: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
        }
}, {
        freezeTableName: true,
        tableName: 'ordres_incident',
        timestamps: false,
})

module.exports = Ordres_incident