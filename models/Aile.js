
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Batiment = require('./Batiment');
const User_ailes = require('./User_ailes');

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
                type: DataTypes.INTEGER(),
                allowNull: false
        },
        NUMERO_AILE: {
                type: DataTypes.INTEGER(),
                allowNull: false
        }
}, {
        freezeTableName: true,
        tableName: 'aile',
        timestamps: false,
})

Aile.belongsTo(Batiment, { foreignKey:"ID_BATIMENT",as:'batiment'})
Aile.hasMany(User_ailes,{as: 'userAile', foreignKey: 'ID_AILE'})
module.exports = Aile