
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table equipes
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Equipes = sequelize.define("equipes", {
        ID_EQUIPE: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        NOM_EQUIPE: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        CHAINE: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        ORDINATEUR: {
                type: DataTypes.STRING(255),
                allowNull: false
        }
}, {
        freezeTableName: true,
        tableName: 'equipes',
        timestamps: false,
})
module.exports = Equipes