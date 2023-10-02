
/**
* constantes pour le etapes du folio
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
*/
const IDS_ETAPES_FOLIO = {
          /**
           * 1 - Selection d'un agent superviseur: phase de preparation
          */
          SELECTION_AGENT_SUP: 1,
          /**
          * 2 - Selection d'un agent preparation
          */
          SELECTION_AGENT_PREPARATION: 2,

          /**
          * 3 - Retour: agent preparation vers agent superviseur phase de preparation
          */
          RETOUR_AGENT_PEPARATION_V_AGENT_SUP: 3,

          /**
          * 4 - Selection d'un agent sup. scanning
          */
          SELECTION_AGENT_SUP_SCANNIMG: 4,
          /**
          * 5 - Selection equipe scanning
          */
          SELECTION_EQUIPE_SCANNIMG: 5,
          /**
           * 6 - Retour: Scan et reconcilie (equipe scanning vers agent sup. scanning)
           */
          RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING: 6,
          /**
           * 7 - Retour: Validation scan et reconcilie (agent sup. scanning et chef plateau)
           */
          RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU: 7,
          /**
           * 8 - Mettre les folio dans les flashs
           */
          METTRE_FOLIO_FLASH: 8,
          /**
           * 9 - Selection d'un agent sup aile indexation
           */
          SELECTION_AGENT_SUP_AILE_INDEXATION: 9,
          /**
           * 10 - Selection d'un chef plateau indexation
           */
          SELECTION_CHEF_PLATEAU_INDEXATION: 10,

          /**
           * 11 - Selection agent indexation
           */
          SELECTION_AGENT_INDEXATION: 11,

          /**
            * 12 - Retour: agent indexation vers Chef plateau indexation
            */
          RETOUR_AGENT_INDEX_CHEF_PLATEAU: 12,

          /**
            * 13 - Retour: Chef plateau indexation vers Agent Sup aile indexation
            */
          RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE: 13,

          /**
            * 14- Retour: Agent Sup aile indexation vers Chef equipe
            */
          RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE: 14,

          /**
            * 15 - Chef equipe upload EDRMS prends le flash
            */
          CHEF_EQUIPE_EDRMS: 15,

          /**
            * 16 - Selection agent upload EDRMS
            */
          SELECTION_AGENT_EDRMS: 16,

          /**
            * 17 - Folio uploaded to EDRMS
            */
          FOLIO_UPLOADED_EDRMS: 17,

          /**
            * 18 - Folio uploaded to EDRMS
            */
          FOLIO_NO_UPLOADED_EDRMS: 18,

          /**
            * 19 - Selection verificateur upload EDRMS
            */
          SELECTION_VERIF_EDRMS: 19,

          /**
            * 20 - Folio enregistre to EDRMS
            */
          FOLIO_ENREG_TO_EDRMS: 20,

          /**
            * 21 - Folio no enregistre to EDRMS
            */
          FOLIO_NO_ENREG_TO_EDRMS: 21,
          /**
            * 22 - Folio  enregistre
            */
          FOLIO_ENREG: 22,
          /**
           * 23 - Ajout  details dans un folio
           */
          ADD_DETAILLER_FOLIO: 23,

          /**
         * 24 - Retour: agent superviseur phase de preparation vers  chef plateaus
         */
          RETOUR__AGENT_SUP_V_CHEF_PLATEAU: 24,
          /**
           * 25- Retour: Agent upload vers Chef equipe
           */
          RETOUR_AGENT_UPLOAD_CHEF_EQUIPE: 25,
          /**
           * 26- chef equipe selectione un agent  sup aile
           */
          CHEF_EQUIPE_SELECT_AGENT_SUP_AILE: 26,
          /**
           * 27- agent  sup  aile selectione chef plateau
           */
          AGENT_SUP_AILE_SELECT_CHEF_PLATEAU: 27,
          /**
           * 28-  chef plateau selectione agent  sup praparation
           */
          CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION: 28,

          /**
          * 29-  agent  sup praparation selectione agent praparation
          */
          AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION: 29,

          /**
          * 30-  retour agent  sup praparation selectione agent praparation
          */
          RETOUR_AGENT_SUP_PREPARATION_SELECT_AGENT_PREPARATION: 30,

          /**
          * 31-  retour  chef plateau selectione agent sup  praparation
          */
          RETOUR_CHEF_PLATEAU_SELECT_AGENT_SUP_PREPARATION: 31,

          /**
         * 32-  retour AGENT  SUP AILE  selectione agent chef plateau
         */
          RETOUR_AGENT_SUP_AILE_SELECT_CHEF_PLATEAU: 32,

          /**
        * 33 - Reenvoyer: le volume avec les folios non valide (chef equipe scanning vers agent sup aille scanning)
        */
          REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING: 33,
          /**
        * 34 - Reenvoyer: le volume avec les folios non valide (agent sup aille scanning vers chef plateau scanning)
        */
          REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING: 34,
          /**
      * 35 - Reenvoyer: le volume avec les folios non valide (chef plateau scanning vers agent superviseur)
      */
          REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING: 35,
          /**
      * 36 - Reenvoyer: le volume avec les folios non valide (agent superviseur scanning vers equipe scanning)
      */
          REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING: 36,
          /**
      * 37 - Reenvoyer: le retour de folios reenvoyez scan et reconcilier (agent superviseur scanning vers equipe scanning)
      */
          REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_EQUIPE_SCANNING_IS_RECONCILIER: 37,
          /**
      * 38 - Reenvoyer: le retour de folios reenvoyez est valid (agent superviseur scanning entre chef plateau)
      */
          REENVOYER_AGENT_SUPERVISEUR_SCANNING_VERS_CHEF_PLATEAU_IS_VALID: 38,
          /**
      * 39 - Reenvoyer: le retour de folios reenvoyez est valid (chef plateau et agent superviseur aille scanning)
      */
          REENVOYER_Vol_CHEF_PLATEAU_VERS_AGENT_SUPERVISEUR_AILLE_SCANNING: 39,
          /**
      * 40 - Reenvoyer: le retour de folios reenvoyez est valid (agent superviseur aille scanning et chef d'equipe)
      */
          REENVOYER_Vol_AGENT_SUPERVISEUR_AILLE_SCANNING_VERS_CHEF_EQUIPE_SCANNING: 40,

          /**
      * 41 - Retour: le retour de folios bien valider bien reconciliers (chef d'equipe scanning vers agent preparation distributeur)
      */
          RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_PREPARATION: 41,

          /**
      * 42 - Reenvoyer: le retour de folios bien valider bien reconciliers (chef d'equipe scanning vers agent preparation distributeur reenvoyer)
      */
          RETOUR_FOLIOS_VALID_RECONCILIER_CHEF_EQUIPE_SCANNING_AGENT_DISTRIBUTEUR_PREPARATION: 42,

          /**
      * 43 - Reenvoyer: le retour de folios bien valider bien reconciliers (agent preparation distributeur reenvoyer vers agent archives)
      */
          RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_DISTRIBUTEUR_VERS_AGENT_DESARCHIVAGES: 43,

          /**
      * 44 - Reenvoyer: le retour de folios bien valider bien reconciliers (agent archives vers agent desarchivages)
      */
          RETOUR_FOLIOS_VALID_RECONCILIER_AGENT_ARCHIVES_VERS_AGENT_DESARCHIVAGES_PREPARATION: 44,
          /**
          * 45-  retour CHEF EQUIPE  selectione agent SUP  AILE
          */
          RETOUR_CHEF_EQUIPE_SELECT_AGENT_SUP_AILE: 45,

          /**
      * 46 - Reenvoyer: le retour de folios bien valider bien reconciliers (agent desarchivages)
      */
          RETOUR_IS_BIEN_ARCHIVES: 46,
          /**
        * 47-  Selection agent sup aile scanning
        */
          SELECTION_AGENT_SUP_INDEXATION: 47,
          /**
          * 48 - Retour: Sans reconcilie et sans Scan (equipe scanning vers agent sup. scanning)
          */
                                      // RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING: 48, vanny

          /**
           * 49 - Retour: is non Valide meme si il'est reconcilier (agent sup. scanning vers chef plateau scanning)
           */
                                      //  RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU: 49, vanny
}

module.exports = IDS_ETAPES_FOLIO