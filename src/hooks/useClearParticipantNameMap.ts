import { useEffect } from "react";

import { removeParticpantMap } from "../utils/participantNameMap";

export const useClearParticipantNameMap = () => {
    useEffect(()=>{
        removeParticpantMap();
    });
}
