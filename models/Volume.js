
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Maille = require('./Maille') 
const Etapes_volumes =require('./Etapes_volumes');
/**
* fonction model pour la creation de la table volume
* @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Volume = sequelize.define("volume", {
    ID_VOLUME: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NUMERO_VOLUME: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    CODE_VOLUME: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    NOMBRE_DOSSIER: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_MALLE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_ETAPE_VOLUME: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    USERS_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
}
}, {
    freezeTableName: true,
    tableName: 'volume',
    timestamps: false,
})
Volume.belongsTo(Etapes_volumes, { foreignKey: "ID_ETAPE_VOLUME", as: 'etapes_volumes' })
Volume.belongsTo(Maille, { foreignKey: "ID_MALLE", as: 'maille' })
module.exports = Volume


