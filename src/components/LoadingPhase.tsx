import { Flex } from "@twilio-paste/core/flex";
import { Spinner } from "@twilio-paste/core/spinner";

export const LoadingPhase = () => {
    return (
        <Flex hAlignContent="center" vAlignContent="center" height="99vh">
            <Spinner title="Authorizing" decorative={false} size="sizeIcon100" color="colorTextLink" />
        </Flex>
    );
};
