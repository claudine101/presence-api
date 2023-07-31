
/**
* constantes pour le etapes du folio
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
*/

const IDS_ETAPES_FOLIO = {
        /**
         * 1 - En attente de paiement
         */
        ETTENTE_PAIEMENET: 1,

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
        FOLIO_ENREG_TO_EDRMS: 21

}

module.exports = IDS_ETAPES_FOLIO