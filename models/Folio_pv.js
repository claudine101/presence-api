
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table devise
* @author habiyakare leonard <leonard@mediabox.bi>
* @date 03/07/2023
* @returns 
*/
const Folio_pv = sequelize.define("folio_pv", {
    ID_FOLIO_PV: {
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
    tableName: 'folio_pv',
    timestamps: false,
})
module.exports = Folio_pv