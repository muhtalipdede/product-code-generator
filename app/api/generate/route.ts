import { checkDuplicateProductCodes } from "@/utils/product";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const seperateMultipleAttributes = (family: any) => {
    const multipleAttributes = {} as any;
    Object.keys(family).forEach((familyKey) => {
        if (
            family[familyKey] &&
            family[familyKey].split(",").length > 1
        ) {
            multipleAttributes[familyKey] = multipleAttributes[familyKey] || [];
            family[familyKey].split(",").forEach((attribute: any) => {
                multipleAttributes[familyKey].push(attribute);
            });
        }
    })
    return multipleAttributes
}

export async function POST(request: Request) {
    const body = await request.json();
    const { attributeList, familyList } = body;

    const productMapping = {} as any;
    let products = [] as any[];
    let errorList = [] as any[];
    let tempErrorList = [] as any[];
    let errorType = 'error'

    attributeList.forEach((attribute: any) => {
        const type = attribute.Type;
        if (!productMapping[type]) {
            productMapping[type] = [];
        }
        productMapping[type].push(attribute);
    });

    familyList.forEach((family: any) => {
        let updatedFamily = { "Product Reference": "", "Product Name": family["Category Name"], ...family };

        let multipleAttributes = seperateMultipleAttributes(updatedFamily);

        let attributeKeys = Object.keys(multipleAttributes);

        function generateProducts(index: number, product: any) {
            if (index === attributeKeys.length) {
                setProductCodeAndName(product);
                products.push(product);
                return;
            }

            let key = attributeKeys[index];
            for (let i = 0; i < multipleAttributes[key].length; i++) {
                let newProduct = { ...product };
                newProduct[key] = multipleAttributes[key][i];
                generateProducts(index + 1, newProduct);
            }
        }

        function setProductCodeAndName(product: any) {
            Object.keys(product).forEach((key) => {
                if (productMapping[key]) {
                    if (attributeList.filter(
                        (attribute: any) =>
                            attribute.Reference === product[key] &&
                            attribute.Type === key).length == 0 && product[key]) {
                        tempErrorList.push("Attribute not found for " + key + ": " + product[key]);
                    } else if (product["Product Reference"] == "" && product[key]) {
                        product["Product Reference"] = product[key];
                        if (attributeList.find(
                            (attribute: any) => attribute.Reference === product[key] &&
                                attribute.Type === key
                        )) {
                            product["Product Name"] = (attributeList.find(
                                (attribute: any) => attribute.Reference === product[key] &&
                                    attribute.Type === key
                            ) as any).Name;
                        }
                    } else if (product[key]) {
                        product["Product Reference"] = product["Product Reference"] + "-" + product[key];
                        if (attributeList.find(
                            (attribute: any) => attribute.Reference === product[key] &&
                                attribute.Type === key
                        )) {
                            product["Product Name"] = product["Product Name"] + " - " + (attributeList.find(
                                (attribute: any) => attribute.Reference === product[key] &&
                                    attribute.Type === key
                            ) as any).Name;
                        }
                    }
                }
            })
        }

        generateProducts(0, updatedFamily);
    });

    if (tempErrorList.length > 0) {
        const uniqueErrorList = tempErrorList.reduce((acc, currentValue) => {
            if (!acc.includes(currentValue)) {
                acc.push(currentValue);
            }
            return acc;
        }, []);
        errorList = uniqueErrorList;
    } else {
        errorList = [];
    }

    const productReferenceList = products.map((product) => product["Product Reference"]);
    if (checkDuplicateProductCodes(productReferenceList)) {
        errorList.push("Duplicate Product Codes found");
        errorType = 'duplicate-product-code-error'
    }

    return new Response(
        JSON.stringify({
            products,
            errorList,
            errorType
        }),
        {
            headers: { 'content-type': 'application/json' },
        }
    );
}