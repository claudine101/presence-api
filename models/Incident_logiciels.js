
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table incident_logiciels
* @author Vanny Boy <vanny@mediabox.bi>
* @date 1/09/2023
* @returns 
*/
const Incident_logiciels = sequelize.define("incident_logiciels", {
        ID_INCIDENT_LOGICIEL: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        NOM_LOGICIEL: {
                type: DataTypes.STRING(50),
                allowNull: false
        },
        DATE_INSERTION: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
        }
}, {
        freezeTableName: true,
        tableName: 'incident_logiciels',
        timestamps: false,
})

module.exports = Incident_logiciels