export const checkDuplicateProductCodes = (productCodes: string[]): boolean => {
    const productCodesSet = new Set<string>(productCodes);
    return productCodes.length !== productCodesSet.size;
}

export const getDuplicateProductCodes = (productCodes: string[]): string[] => {
    let duplicates = [] as string[];
    let uniqueProductCodes = [] as string[];
    for (const productCode of productCodes) {
        if (uniqueProductCodes.includes(productCode)) {
            duplicates.push(productCode);
        } else {
            uniqueProductCodes.push(productCode);
        }
    }

    return duplicates;
}