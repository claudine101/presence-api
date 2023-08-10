
const { DataTypes, BelongsTo } = require('sequelize');

const sequelize = require('../utils/sequelize');
const Users = require('./Users');
const Etapes_volumes = require('./Etapes_volumes');
const Volume = require('./Volume');

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
        type: DataTypes.INTEGER(),
        allowNull: false
    },
    USER_TRAITEMENT: {
        type: DataTypes.INTEGER(),
        allowNull: false
    },
    ID_VOLUME: {
        type: DataTypes.INTEGER(),
        allowNull: false
    },
    ID_ETAPE_VOLUME: {
        type: DataTypes.INTEGER(),
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

Etapes_volume_historiques.belongsTo(Etapes_volumes, { foreignKey: "ID_ETAPE_VOLUME", as: 'etapes_volumes' })
// Etapes_volume_historiques.belongsTo(Etapes_volumes, {foreignKey: "ID_ETAPE_VOLUME", as : 'etapes_volume'})

// Etapes_volume_historiques.belongsTo(Nature, { foreignKey:"ID_NATURE", as: 'nature' })
Etapes_volume_historiques.belongsTo(Users, { foreignKey:"USERS_ID", as: 'users' })
Etapes_volume_historiques.belongsTo(Users, { foreignKey:"USER_TRAITEMENT", as: 'traitant' })
// Etapes_volume_historiques.belongsTo(Volume, {foreignKey: "ID_VOLUME", as: 'volume'})
//  Etapes_volume_historiques.hasMany(Volume, { foreignKey:"ID_VOLUME", as:'volume'})
Users.hasMany(Etapes_volume_historiques,{foreignKey:'USER_TRAITEMENT', as:'histo'});

module.exports = Etapes_volume_historiques