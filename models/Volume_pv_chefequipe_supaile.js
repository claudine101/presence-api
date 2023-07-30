
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table volume_pv_chefequipe_supaile
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_pv_chefequipe_supaile = sequelize.define("volume_pv_chefequipe_supaile", {
        ID_PV_CHEFEQUIPE_SUPAILE: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        PATH_PV: {
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
        tableName: 'volume_pv_chefequipe_supaile',
        timestamps: false,
})
module.exports = Volume_pv_chefequipe_supaile