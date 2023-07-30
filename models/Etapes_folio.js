const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table etapes_folio
* @author JOSPIN Ba <jospin@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Etapes_folio = sequelize.define('etapes_folio', {
    ID_ETAPE_FOLIO : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NOM_ETAPE: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ID_PHASE: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'etapes_folio',
        timestamps: false
    });
    
module.exports = Etapes_folio;