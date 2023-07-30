const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table equipes
* @author JOSPIN Ba <jospin@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Equipes = sequelize.define('equipes', {
    ID_EQUIPE : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NOM_EQUIPE: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    CHAINE: {
        type: DataTypes.STRING(55),
        allowNull: false
    },
    ORDINATEUR: {
        type: DataTypes.STRING(55),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'equipes',
        timestamps: false
    });
    
module.exports = Equipes;