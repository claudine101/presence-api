
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table aile
* @author derick <derick@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Nature_folio = sequelize.define("nature_folio", {
    ID_NATURE_FOLIO : {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        DESCRIPTION: {
                type: Sequelize.STRING(255),
                allowNull: false
        },
       
}, {
        freezeTableName: true,
        tableName: 'nature_folio',
        timestamps: false,
})
module.exports = Nature_folio