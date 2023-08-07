
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Folio = require('./Folio');
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
Flashs.hasMany(Folio, { foreignKey: 'ID_FLASH', as: 'folios' })
Folio.belongsTo(Flashs, { foreignKey: 'ID_FLASH', as: 'flash' })
module.exports = Flashs