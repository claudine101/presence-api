
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table volume_chef_equipes
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_chef_equipes = sequelize.define("volume_chef_equipes", {
        ID_VOLUME_CHEF_EQUIPE: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_USER: {
                type: Sequelize.INTEGER(),
                allowNull: true
        },
        ID_PV_CHEFEQUIPE_SUPAILE: {
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
        tableName: 'volume_chef_equipes',
        timestamps: false,
})
module.exports = Volume_chef_equipes