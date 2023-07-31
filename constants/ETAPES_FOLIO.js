
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
        SELECTION_CHEF_PLATEAU_INDEXATION: 10
}

module.exports = IDS_ETAPES_FOLIO