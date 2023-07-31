const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table Folio_equipes
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_equipes = sequelize.define('folio_equipes', {
    ID_FOLIO_EQUIPE    : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_EQUIPE: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    PV_PATH_RETOUR: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},
    {
        freezeTableName: true,
        tableName: 'folio_equipes',
        timestamps: false
    });
    
module.exports = Folio_equipes;