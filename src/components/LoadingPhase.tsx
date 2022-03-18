import { Flex } from "@twilio-paste/core/flex";
import { Spinner } from "@twilio-paste/core/spinner";

export const LoadingPhase = () => {
    return (
        <Flex hAlignContent="center" vAlignContent="center" height="100%">
            <Spinner title="Authorizing" decorative={false} size="sizeIcon100" color="colorTextLink" />
        </Flex>
    );
};
