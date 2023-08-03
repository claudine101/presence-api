
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table etapes_volumes
* @author NDAYISABA claudine<claudined@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Etapes_volumes = sequelize.define("etapes_volumes", {
    ID_ETAPE_VOLUME: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NOM_ETAPE: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    ID_PHASE:{
        type: Sequelize.INTEGER(),
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'etapes_volumes',
    timestamps: false,
})
module.exports = Etapes_volumes