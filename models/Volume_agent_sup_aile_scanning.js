
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table volume_agent_sup_aile_scanning
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_agent_sup_aile_scanning = sequelize.define("volume_agent_sup_aile_scanning", {
        ID_VOLUME_AGENT_SUP_AILE_SCANNING: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_USER: {
                type: Sequelize.INTEGER(),
                allowNull: true
        },
        ID_PV_AGENTSUPAILESCANNING_CHEFEQUIPE: {
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
        tableName: 'volume_agent_sup_aile_scanning',
        timestamps: false,
})
module.exports = Volume_agent_sup_aile_scanning