
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Batiment = require('./Batiment');
const User_ailes = require('./User_ailes');

/**
* fonction model pour la creation de la table institutions
* @author Vanny Boy <leonard@mediabox.bi>
* @date 17/08/2023
* @returns 
*/
const Institutions = sequelize.define("institutions", {
    ID_INSTITUTION: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        NOM_INSTITUTION: {
                type: DataTypes.STRING(25),
                allowNull: false
        }
}, {
        freezeTableName: true,
        tableName: 'institutions',
        timestamps: false,
})


module.exports = Institutions