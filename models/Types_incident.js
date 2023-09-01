const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

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
    },
  },
  {
    freezeTableName: true,
    tableName: "types_incident",
    timestamps: false,
  }
);

module.exports = Types_incident;