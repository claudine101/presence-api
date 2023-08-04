
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table batiment
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Batiment = sequelize.define("batiment", {
        ID_BATIMENT: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        NUMERO_BATIMENT: {
                type: DataTypes.INTEGER(),
                allowNull: false
        }
}, {
        freezeTableName: true,
        tableName: 'batiment',
        timestamps: false,
})
module.exports = Batiment