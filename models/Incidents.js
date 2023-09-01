
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table incidents
* @author Vanny Boy <vanny@mediabox.bi>
* @date 1/09/2023
* @returns 
*/
const Incidents = sequelize.define("incidents", {
        ID_INCIDENT: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_TYPE_INCIDENT: {
                type: DataTypes.INTEGER(),
                allowNull: false
        },
        DESCRIPTION: {
                type: DataTypes.STRING(50),
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
        tableName: 'aile',
        timestamps: false,
})

module.exports = Incidents