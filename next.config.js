/** @type {import('next').NextConfig} */
const nextConfig = {
    headers: async () => {
        return [
            {
                source: '/api/duplicate-product-codes/csv',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/csv'
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig
