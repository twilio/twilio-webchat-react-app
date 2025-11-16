/**
 * Extracts the first name from a full name
 * @param fullName - The full name to extract the first name from
 * @returns The first name, or the original name if it's a single word
 */
export const getFirstName = (fullName: string | undefined): string => {
    if (!fullName) return "";
    
    // Split by spaces and take the first part
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts[0] || fullName;
};
