import { useLayoutEffect, useState } from "react";

enum DeviceType {
    mobile = "mobile",
    tablet = "tablet",
    desktop = "desktop"
}

type Breakpoints = {
    mobileBreakpoint?: number;
    tabletBreakpoint?: number;
};

export const useDevice = (
    breakpoints: Breakpoints | undefined = { mobileBreakpoint: 768, tabletBreakpoint: 1024 }
): {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
} => {
    const { mobileBreakpoint = 768, tabletBreakpoint = 1024 } = breakpoints;
    const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.desktop);

    useLayoutEffect(() => {
        const updateDeviceType = () => {
            const width = window.innerWidth;
            if (width < mobileBreakpoint) {
                setDeviceType(DeviceType.mobile);
            } else if (width < tabletBreakpoint) {
                setDeviceType(DeviceType.tablet);
            } else {
                setDeviceType(DeviceType.desktop);
            }
        };
        updateDeviceType();
        const width = window.innerWidth;
        if (width < mobileBreakpoint) {
            setDeviceType(DeviceType.mobile);
        } else if (width < tabletBreakpoint) {
            setDeviceType(DeviceType.tablet);
        } else {
            setDeviceType(DeviceType.desktop);
        }
        window.addEventListener("resize", updateDeviceType);
        return () => window.removeEventListener("resize", updateDeviceType);
    }, [mobileBreakpoint, tabletBreakpoint]);

    return {
        isMobile: deviceType === DeviceType.mobile,
        isTablet: deviceType === DeviceType.tablet || deviceType === DeviceType.mobile,
        isDesktop: deviceType === DeviceType.desktop
    };
};
