import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { Box } from "@twilio-paste/core/box";
import { Button } from "@twilio-paste/core";
import { useDispatch, useSelector } from "react-redux";

import { containerStyles } from "./styles/Header.styles";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { getImageByBrand } from "../utils/getImageByBrand";
import { AppState } from "../store/definitions";

export const Header = () => {
    const brand = useSelector((state: AppState) => state.config.brand);
    const dispatch = useDispatch();

    return (
        <Box as="header" {...containerStyles}>
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
