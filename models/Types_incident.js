const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

/**
* Model des types des incidents
* @author NIREMA ELOGE<nirema.eloge@mediabox.bi>
* @date 1/09/2023
* @returns 
*/

const Types_incident = sequelize.define(
  "types_incident",
  {
    ID_TYPE_INCIDENT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    TYPE_INCIDENT: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    IS_AUTRE: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    ID_USER: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DATE_INSERTION: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },
  {
    freezeTableName: true,
    tableName: "types_incident",
    timestamps: false,
  }
);

module.exports = Types_incident;
