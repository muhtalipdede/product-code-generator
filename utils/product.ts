export const checkDuplicateProductCodes = (products: any[]): boolean => {
    const productCodes = products.map((product) => product.code);
    return new Set(productCodes).size !== productCodes.length;
}

export const getDuplicateProductCodes = (products: any[]): string[] => {
    const productCodes = products.map((product) => product['Product Reference']);
    const productCodesSet = new Set(productCodes);
    return productCodes.filter((code) => productCodesSet.has(code));
}