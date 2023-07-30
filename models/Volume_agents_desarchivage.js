
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table Volume_agents_desarchivage
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_agents_desarchivage = sequelize.define("Volume_agents_desarchivage", {
        ID_VOLUME_AGENT_DESARCHIVAGE: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        PV_PATH: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        DATE_INSERTION: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
        }
}, {
        freezeTableName: true,
        tableName: 'Volume_agents_desarchivage',
        timestamps: false,
})
module.exports = Volume_agents_desarchivage