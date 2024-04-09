import { API_URL } from "@/config/config";
import { getDuplicateProductCodes } from "@/utils/product";

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

    console.log('products', data.products.length);

    const result = getDuplicateProductCodes(data.products);

    return new Response(JSON.stringify(result), {
        headers: {
            'content-type': 'application/json',
        },
    });
}