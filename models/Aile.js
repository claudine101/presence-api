
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table aile
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Aile = sequelize.define("aile", {
        ID_AILE: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_BATIMENT: {
                type: Sequelize.INTEGER(),
                allowNull: false
        },
        NUMERO_AILE: {
                type: Sequelize.INTEGER(),
                allowNull: false
        }
}, {
        freezeTableName: true,
        tableName: 'aile',
        timestamps: false,
})
module.exports = Aile