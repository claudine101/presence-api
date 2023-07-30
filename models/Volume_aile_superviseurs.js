
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table volume_aile_superviseurs
* @author Vanny Boy <vanny@mediabox.bi>
* @date 30/07/2023
* @returns 
*/
const Volume_aile_superviseurs = sequelize.define("volume_aile_superviseurs", {
        ID_VOLUME_AILE_SUP: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_USER_AILE: {
                type: Sequelize.INTEGER(),
                allowNull: true
        },
        PV_PATH_SUPERVISEUR: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        PV_PATH_SUPERVISEUR_RETOUR: {
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
        tableName: 'volume_aile_superviseurs',
        timestamps: false,
})
module.exports = Volume_aile_superviseurs