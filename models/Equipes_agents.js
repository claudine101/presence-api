
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Users = require('./Users');
const Equipes = require('./Equipes');

/**
* fonction model pour la creation de la table equipe agents
* @author Leonard <leonard@mediabox.bi>
* @date 17/08/2023
* @returns 
*/
const Equipes_agents = sequelize.define("equipes_agents", {
    ID_EQUIPE_AGENT : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_USER: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_EQUIPE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }

}, {
    freezeTableName: true,
    tableName: 'equipes_agents',
    timestamps: false,
})
Equipes_agents.belongsTo(Users,{foreignKey:"ID_USER",as:'users'})
Users.belongsTo(Equipes_agents,{foreignKey:"ID_USER",as:"equipeAgents"})

module.exports = Equipes_agents