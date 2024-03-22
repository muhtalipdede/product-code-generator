export const dynamic = 'force-dynamic';

export function GET(request: Request) {
    return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}