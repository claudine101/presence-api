const express=require("express")
const sequelize=require("../utils/sequelize")
const readRequete =async(requete,ID_AILE)=>{
    return await sequelize.query(requete, [ID_AILE])
    // return query("SELECT * FROM remettants WHERE 1 AND ID_REMETTANT=?", [id]);
}
module.exports={
    readRequete
}