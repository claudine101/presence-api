
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table volume_chef_plateaux
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_chef_plateaux = sequelize.define("volume_chef_plateaux", {
        ID_VOLUME_CHEF_PLATEAU: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_USER_AILE: {
                type: Sequelize.INTEGER(),
                allowNull: true
        },
        PV_PATH_PLATEAU: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        PV_PATH_PLATEAU_RETOUR: {
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
        tableName: 'volume_chef_plateaux',
        timestamps: false,
})
module.exports = Volume_chef_plateaux