import { getDuplicateProductCodes } from "@/utils/product";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = await request.json();
    const { products } = body;

    const result = getDuplicateProductCodes(products);

    return new Response(JSON.stringify(result), {
        headers: {
            'content-type': 'application/json',
        },
    });
}