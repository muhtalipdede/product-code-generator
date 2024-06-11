import { API_URL } from "@/config/config";
import { getDuplicateProductCodes } from "@/utils/product";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = await request.json();
    const { attributeList, familyList } = body;

    const data = await fetch(API_URL + '/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributeList, familyList }),
    }).then((response) => response.json());

    const productCodes = data.products.map((product: any) => product["Product Reference"]);
    const result = getDuplicateProductCodes(productCodes);

    return new Response(JSON.stringify(result), {
        headers: {
            'content-type': 'application/json',
        },
    });
}