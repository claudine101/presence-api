const { query } = require("../../utils/db");
/**
 * Permet de récuper volume
 * @param { string } userId 
 * @returns 
 */
const findAgent = async (userId) => {
    try {
        var requete = `
        SELECT * FROM  volume
           WHERE ID_USERS = ${userId}
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper volume
 * @param { string } userId 
 * @returns 
 */
const findAll = async () => {
    try {
        var requete = `
         SELECT USERS_ID,ID_PROFIL,NOM,PRENOM,EMAIL FROM  users
           WHERE ID_PROFIL=3
        `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
module.exports = {
    findAgent,
    findAll,

}