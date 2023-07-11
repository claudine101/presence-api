const PROFILS = require("../../constants/PROFILS");
const { query } = require("../../utils/db");

/**
 * Permet de récuper l'utilisateur 
 * @param { string } email 
 * @returns 
 */
const findUserLogin = async (email) => {
    try {
        var sqlQuery = `CALL LoginUser(?) `;
        return query(sqlQuery, [email]);
    } catch (error) {
        throw error;
    }
};

/**
 * Permet de récuper l'utilisateur comme partenaire par email
 * @param { string } email 
 * @returns 
 */
const findPartenaireLogin = async (email) => {
    try {
        var sqlQuery = `
                    SELECT u.ID_USER,
                              NOM,
                              PRENOM,
                              EMAIL,
                              USERNAME,
                              PASSWORD,
                              ID_PROFIL,
                              p.ID_PARTENAIRE
                    FROM users u
                    LEFT JOIN partenaires p ON p.ID_USER = u.ID_USER
                    WHERE email = ? AND ID_PROFIL = ?
                    `;
        return query(sqlQuery, [email, PROFILS.partenaire]);
    } catch (error) {
        throw error;
    }
};

const findBy = async (column, value) => {
    try {
        var sqlQuery = `SELECT * FROM users  WHERE ${column} = ? `;
        return query(sqlQuery, [value]);
    } catch (error) {
        throw error;
    }
};
const createOne = (
    departemants,
    profil,
    fileUrluser,
    NOM,
    PRENOM, EMAIL, TELEPHONE,
    PASSEWORD,
    fileUrlpermis,
    STATUT,
    fileUrlconduite,
    fileUrlcni,
    fileUrlassurence,
    fileUrlcontrole,
    fileUrlcarte,
    fileUrlvehicule,
    genre,
    banque, compte, titulaire, plaque) => {
    try {

        var sqlQuery = `
        INSERT INTO users(
            DEPARTEMENT_ID,
            ID_PROFIL,
            PHOTO_USER,
            STATUT,
            NOM,
            PRENOM,
            EMAIL,
            TELEPHONE,
            PASSEWORD,
            PERMIS,
            ATTEASTATION_CONDUITE,
            CNI,
            ASSURENCE,
            CONTROLE_TECHNIQUE,
            CARTE_ROSE,
            PHOTO_VEHICULE,
            GENRE,
            BANQUE,
            COMPTE,
            TITULAIRE,
            NUMERO_PLAQUE
        )
    values(?, ?,?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?)`;
        return query(sqlQuery, [
            departemants,
            profil,
            fileUrluser,
            STATUT,
            NOM, PRENOM, EMAIL,
            TELEPHONE, PASSEWORD,
            fileUrlpermis,
            fileUrlconduite,
            fileUrlcni,
            fileUrlassurence,
            fileUrlcontrole,
            fileUrlcarte,
            fileUrlvehicule,
            genre,
            banque, compte, titulaire, plaque])
    }
    catch (error) {

        throw error
    }
}
const findById = async (id) => {
    try {
        return query("SELECT * FROM users WHERE USERS_ID  = ?", [id]);
    } catch (error) {
        throw error;
    }
};
module.exports = {
    findBy,
    createOne,
    findById,
    findUserLogin,
    findPartenaireLogin
}