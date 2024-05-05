
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Profils = require('./Profils');
/**
* fonction model pour la creation de la table Utilisateurs
* @author Ir NDAYISABA Claudine <claudine@receca-inkingi.bi>
* @date 31/07/2023
* @returns 
*/
const Utilisateurs = sequelize.define("utilisateurs", {
    ID_UTILISATEUR: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    USERNAME: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
  
    PASSWORD: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    IS_ACTIVE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

}, {
    freezeTableName: true,
    tableName: 'Utilisateurs',
    timestamps: false,
})
Utilisateurs.belongsTo(Profils, {foreignKey:"ID_PROFIL", as:"profil"})
module.exports = Utilisateurs