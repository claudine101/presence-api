
const { Sequelize, DataTypes, BelongsTo } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Volume = require('./Volume');
const Users = require('./Users');
const Etapes_volumes = require('./Etapes_volumes');

/**
* fonction model pour la creation de la table etapes_volume_historiques
* @author NDAYISABA claudine <claudined@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Etapes_volume_historiques = sequelize.define("etapes_volume_historiques", {
    ID_VOLUME_HISTORIQUE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    USERS_ID: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    USER_TRAITEMENT: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_ETAPE_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'etapes_volume_historiques',
    timestamps: false,
})


Etapes_volume_historiques.belongsTo(Users, {foreignKey: "USERS_ID", as: 'users' })
// Etapes_volume_historiques.belongsTo(Profils, {foreignKey: "ID_PROFIL", as: 'profils'})
Etapes_volume_historiques.belongsTo(Etapes_volumes, {foreignKey: "ID_ETAPE_VOLUME", as : 'etapes_volume'})
// Etapes_volume_historiques.belongsTo(Users, {foreignKey: "USERS_ID", as: 'users'})



module.exports = Etapes_volume_historiques