
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
/**
* fonction model pour la creation de la table flashs
* @author NDAYISABA claudine<claudined@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Flashs = sequelize.define("flashs", {
    ID_FLASH: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NOM_FLASH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
}
}, {
    freezeTableName: true,
    tableName: 'flashs',
    timestamps: false,
})
module.exports = Flashs