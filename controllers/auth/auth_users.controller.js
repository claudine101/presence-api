const express = require('express');
const UserUpload = require('../../class/uploads/UserUpload');
const Validation = require('../../class/Validation');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const Users = require('../../models/Users');
const Profils = require('../../models/Profils');



/**
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */
const login = async (req, res) => {
    try {
              const { email, password, PUSH_NOTIFICATION_TOKEN, DEVICE, LOCALE } = req.body;
              const validation = new Validation(
                        req.body,
                        {
                                  email: {
                                            required: true,
                                            email: true
                                  },
                                  password:
                                  {
                                            required: true,
                                  },
                        },
                        {
                                  password:
                                  {
                                            required: "Le mot de passe est obligatoire",
                                  },
                                  email: {
                                            required: "L'email est obligatoire",
                                            email: "Email invalide"
                                  }
                        }
              );
              await validation.run();
              const isValid = await validation.isValidate()
              const errors = await validation.getErrors()
              if (!isValid) {
                        return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                                  statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                                  httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                                  message: "Probleme de validation des donnees",
                                  result: errors
                        })
              }
              const userObject = await Users.findOne({
                        where: { EMAIL: email },
                        attributes: ['USERS_ID', 'PASSEWORD', 'ID_PROFIL', 'TELEPHONE', 'EMAIL', 'NOM', 'PRENOM', 'IS_ACTIF', 'PHOTO_USER'],
                        include: [{
                              model: Profils,
                              as: 'profil',
                              required: false,
                              attributes: ['ID_PROFIL', 'DESCRIPTION']
                        }]
              })
              if (userObject) {
                        const user = userObject.toJSON()
                        if (user.PASSEWORD == md5(password)) {
                                  const token = generateToken({ user: user.USERS_ID, ID_PROFIL: user.ID_PROFIL,PHOTO_USER:user.PHOTO_USER }, 3 * 12 * 30 * 24 * 3600)
                                  const { password, ...other } = user
                                  if (PUSH_NOTIFICATION_TOKEN) {
                                            // const notification = (await query('SELECT ID_NOTIFICATION_TOKEN FROM driver_notification_tokens WHERE TOKEN = ? AND ID_DRIVER = ?', [PUSH_NOTIFICATION_TOKEN, user.ID_DRIVER]))[0]
                                            // if (notification) {
                                            //           await query('UPDATE notification_tokens SET DEVICE = ?, TOKEN = ?, LOCALE = ? WHERE ID_NOTIFICATION_TOKEN = ?', [DEVICE, PUSH_NOTIFICATION_TOKEN, LOCALE, notification.ID_NOTIFICATION_TOKEN]);
                                            // } else {
                                            //           await query('INSERT INTO notification_tokens(ID_DRIVER, DEVICE, TOKEN, LOCALE) VALUES(?, ?, ?, ?)', [user.ID_DRIVER, DEVICE, PUSH_NOTIFICATION_TOKEN, LOCALE]);
                                            // }
                                  }
                                  res.status(RESPONSE_CODES.CREATED).json({
                                            statusCode: RESPONSE_CODES.CREATED,
                                            httpStatus: RESPONSE_STATUS.CREATED,
                                            message: "Vous êtes connecté avec succès",
                                            result: {
                                                      ...other,
                                                      token
                                            }
                                  })
                        } else {
                                  validation.setError('main', 'Identifiants incorrects')
                                  const errors = await validation.getErrors()
                                  res.status(RESPONSE_CODES.NOT_FOUND).json({
                                            statusCode: RESPONSE_CODES.NOT_FOUND,
                                            httpStatus: RESPONSE_STATUS.NOT_FOUND,
                                            message: "Utilisateur n'existe pas",
                                            result: errors
                                  })
                        }
              } else {
                        validation.setError('main', 'Identifiants incorrects')
                        const errors = await validation.getErrors()
                        res.status(RESPONSE_CODES.NOT_FOUND).json({
                                  statusCode: RESPONSE_CODES.NOT_FOUND,
                                  httpStatus: RESPONSE_STATUS.NOT_FOUND,
                                  message: "Utilisateur n'existe pas",
                                  result: errors
                        })
              }
    } catch (error) {
              console.log(error)
              res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                        statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                        message: "Erreur interne du serveur, réessayer plus tard",
              })
    }
}

/**
 * Permet de créer un utilisateur lors de l'authentification
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 */
const createUser = async (req, res) => {
    try {
        const { societe, plaque, departemant, NOM, PRENOM, EMAIL, TELEPHONE, password: password, genre, profil, banque, compte, titulaire
        } = req.body

        const permis = req.files?.permis
        const conduite = req.files?.conduite
        const cni = req.files?.cni
        const assurence = req.files?.assurence
        const controle = req.files?.controle
        const carte = req.files?.carte
        const vehicule = req.files?.vehicule
        const user = req.files?.user
        // const { IMAGE } = req.files || {}
        const validation = new Validation({ ...req.body, ...req.files },
            {
                user: {
                    image: 21000000
                },
                NOM:
                {
                    required: true,
                },
                PRENOM:
                {
                    required: true,
                },
                EMAIL:
                {
                    required: true,
                    email: true,
                    unique: "users,EMAIL"
                },
                password:
                {
                    required: true,
                },
            },
            {
                IMAGE: {
                    IMAGE: "La taille invalide"
                },
                NOM: {
                    required: "Le nom est obligatoire"
                },
                PRENOM: {
                    required: "Le prenom est obligatoire"
                },
                EMAIL: {
                    required: "L'email est obligatoire",
                    email: "Email invalide",
                    unique: "Email déjà utilisé"
                },
                password: {
                    required: "Le mot de passe est obligatoire"
                },
            }
        )
        await validation.run();
        const isValide = await validation.isValidate()
        const errors = await validation.getErrors()
        if (!isValide) {
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }
        var departemants, societeObjet, departemantObjet, fileUrlpermis, fileUrlconduite, fileUrlcontrole, fileUrlcni, fileUrlassurence, fileUrlcarte, fileUrlvehicule, fileUrluser
        if (profil == 3) {
            if (permis) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(permis.name)}`;
                const newFile = await permis.mv(destination + fileName);
                fileUrlpermis = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }
            if (conduite) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(conduite.name)}`;
                const newFile = await conduite.mv(destination + fileName);
                fileUrlconduite = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }
            if (controle) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(conduite.name)}`;
                const newFile = await controle.mv(destination + fileName);
                fileUrlcontrole = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }
            if (cni) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(cni.name)}`;
                const newFile = await cni.mv(destination + fileName);
                fileUrlcni = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }
            if (assurence) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(assurence.name)}`;
                const newFile = await assurence.mv(destination + fileName);
                fileUrlassurence = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }
            if (carte) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(carte.name)}`;
                const newFile = await carte.mv(destination + fileName);
                fileUrlcarte = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }
            if (vehicule) {
                const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
                const fileName = `${Date.now()}${path.extname(vehicule.name)}`;
                const newFile = await vehicule.mv(destination + fileName);
                fileUrlvehicule = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
            }

        }
        else if (profil == 2) {
            societeObjet = JSON.parse(societe)
            departemantObjet = JSON.parse(departemant)

            if (societeObjet.ID_SOCIETE == 'new') {
                const { insertId } = await query('INSERT INTO societes( DESCRIPTION, EMAIL, TELEPHONE, ADRESSE, NIF,RC) VALUES (?,?,?,?,?,?)', [
                    societeObjet.DESCRIPTION,
                    societeObjet.EMAIL,
                    societeObjet.TELEPHONE,
                    societeObjet.ADRESSE,
                    societeObjet.NIF,
                    societeObjet.RC,
                ])
                societeObjet.ID_SOCIETE = insertId
            }
            if (departemantObjet.DEPARTEMENT_ID == 'new') {
                const { insertId } = await query('INSERT INTO departements( DESCRIPTION,ID_SOCIETE) VALUES (?,?)', [
                    departemantObjet.DESCRIPTION, societeObjet.ID_SOCIETE
                ])
                departemantObjet.DEPARTEMENT_ID = insertId
            }
            departemantObjet.DEPARTEMENT_ID
        }
        if (user) {
            const destination = path.resolve("./") + path.sep + "public" + path.sep + "user" + path.sep + "document" + path.sep
            const fileName = `${Date.now()}${path.extname(user.name)}`;
            const newFile = await user.mv(destination + fileName);
            fileUrluser = `${req.protocol}://${req.get("host")}/user/document/${fileName}`;
        }
        departemants = departemantObjet?.DEPARTEMENT_ID
        const { insertId } = await Users.create(
            departemants,
            profil,
            fileUrluser,
            NOM,
            PRENOM,
            EMAIL,
            TELEPHONE,
            md5(password),
            fileUrlpermis,
            0,
            fileUrlconduite,
            fileUrlcni,
            fileUrlassurence,
            fileUrlcontrole,
            fileUrlcarte,
            fileUrlvehicule,
            genre,
            banque,
            compte,
            titulaire,
            plaque
        )

        // const user = (await users_model.findById(insertId))[0]
        // const token = generateToken({ user: user.USERS_ID }, 3 * 12 * 30 * 24 * 3600)
        // const { password, USERNAME, ...other } = user
        // const notification = (await query('SELECT ID_NOTIFICATION_TOKEN FROM notification_tokens WHERE TOKEN = ? AND ID_UTILISATEUR = ?', [PUSH_NOTIFICATION_TOKEN, user.USERS_ID]))[0]
        // if (!notification && PUSH_NOTIFICATION_TOKEN) {
        //     await query('INSERT INTO notification_tokens(ID_UTILISATEUR, DEVICE, TOKEN, ID_PROFIL) VALUES(?, ?, ?, ?)', [user.USERS_ID, DEVICE, PUSH_NOTIFICATION_TOKEN, user.ID_PROFIL]);
        // }
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Enregistrement est fait avec succès",
            // result: insertId
        })
    }
    catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}

module.exports = {
    login,
    createUser
}