/**
 * Extracts the first name from a full name string
 * @param fullName - The full name string
 * @returns The first name, or the original string if no space is found
 */
export const getFirstName = (fullName: string | undefined): string => {
    if (!fullName) {
        return "";
    }
    
    // Split by space and take the first part
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts[0] || fullName;
};
