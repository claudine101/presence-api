
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table  volume_pv_agentsupailescanning_chefequipe
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_pv_agentsupailescanning_chefequipe = sequelize.define("volume_pv_agentsupailescanning_chefequipe", {
        ID_PV_AGENTSUPAILESCANNING_CHEFEQUIPE: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        PATH_PV: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        PV_PATH_RETOUR: {
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
        tableName: 'volume_pv_agentsupailescanning_chefequipe',
        timestamps: false,
})
module.exports = Volume_pv_agentsupailescanning_chefequipe