
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Users = require('./Users');

/**
* fonction model pour la creation de la table devise
* @author habiyakare leonard <leonard@mediabox.bi>
* @date 03/07/2023
* @returns 
*/
const Volume_pv = sequelize.define("volume_pv", {
    ID_VOLUME_PV: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    PV_PATH: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    USERS_ID: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
}
}, {
    freezeTableName: true,
    tableName: 'volume_pv',
    timestamps: false,
})
Volume_pv.belongsTo(Users, { foreignKey: "USERS_ID", as: 'users' })
module.exports = Volume_pv