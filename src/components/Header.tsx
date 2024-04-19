import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { Box } from "@twilio-paste/core/box";
import { Button } from "@twilio-paste/core";
import { useDispatch, useSelector } from "react-redux";

import { getContainerStyles } from "./styles/Header.styles";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { getImageByBrand } from "../utils/getImageByBrand";
import { AppState } from "../store/definitions";
import { useDevice } from "../hooks/useDevice";

export const Header = () => {
    const brand = useSelector((state: AppState) => state.config.brand);
    const dispatch = useDispatch();
    const { isMobile } = useDevice();

    return (
        <Box as="header" {...getContainerStyles(isMobile)}>
            <img
                style={{
                    height: "30px",
                    width: "68px",
                    objectFit: "contain"
                }}
                src={getImageByBrand(brand)}
                alt="Brand logo"
            />

            <Button
                variant="secondary_icon"
                size="reset"
                onClick={() => dispatch(changeExpandedStatus({ expanded: false }))}
            >
                <CloseIcon color="colorTextIcon" decorative={false} size="sizeIcon40" title="close" />
            </Button>
        </Box>
    );
};
