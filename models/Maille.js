
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Aille= require ('./Aile')

/**
* fonction model pour la creation de la table aile
* @author derick <derick@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Maille = sequelize.define("maille", {
    ID_MAILLE : {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        ID_AILE: {
                type: Sequelize.INTEGER(11),
                allowNull: true
        },
        NUMERO_MAILLE: {
                type: Sequelize.STRING(255),
                allowNull: true
        }
}, {
        freezeTableName: true,
        tableName: 'maille',
        timestamps: false,
})

Maille.belongsTo(Aille, { foreignKey:"ID_AILE", as:'aille' })

module.exports = Maille