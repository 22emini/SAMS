/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:['lh3.googleusercontent.com']
    },
    devIndicators: false,
    webpack: (config, { isServer }) => {
        // Fixes npm packages that depend on `fs` module
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }
        
        config.resolve.alias = {
            ...config.resolve.alias,
            '@tensorflow/tfjs-core/dist/ops/ops_for_converter': '@tensorflow/tfjs-core/dist/ops/ops_for_converter.js',
        };

        // Add rule for .wasm files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async'
        });

        // Enable WebAssembly
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        };

        return config;
    },
    // output: 'export',
};

export default nextConfig;
