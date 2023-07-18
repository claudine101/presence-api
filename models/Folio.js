
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Utilisateurs = require('./Users');
// const Volume = require('./Volume');
const Users = require('./Users');

/**
* fonction model pour la creation de la table volume
* @author NDAYISABA claudined <claudined@mediabox.bi>
* @date 13/07/2023
* @returns 
*/
const Folio = sequelize.define("folio", {
    ID_FOLIO: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    ID_FOLIO_PV: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_VOLUME: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_NATURE: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    NUMERO_FOLIO: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    CODE_FOLIO: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    ID_USERS: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_ETAPE_FOLIO  :{
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_FOLIO_AILE_PREPARATION: {
        type: Sequelize.INTEGER(),
        allowNull:true
    },
    ID_FOLIO_AILE_AGENT_PREPARATION :{
        type: Sequelize.INTEGER(),
        allowNull:true
    },
    NUMERO_PARCELLE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ID_COLLINE:{
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    LOCALITE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    NOM_PROPRIETAIRE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PRENOM_PROPRIETAIRE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PHOTO_DOSSIER: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    NUMERO_FEUILLE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    NOMBRE_DOUBLON:{
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'folio',
    timestamps: false,
})
// Folio.belongsTo(Volume, { foreignKey: "ID_VOLUME", as: 'volume' })
Folio.belongsTo(Users, { foreignKey: "ID_USERS", as: 'users' })


module.exports = Folio