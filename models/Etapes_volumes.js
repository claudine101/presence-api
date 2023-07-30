const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table etapes_volumes
* @author JOSPIN Ba <jospin@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Etapes_volumes = sequelize.define('etapes_volumes', {
    ID_ETAPE_VOLUME : {
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
        tableName: 'etapes_volumes',
        timestamps: false
    });
    
module.exports = Etapes_volumes;