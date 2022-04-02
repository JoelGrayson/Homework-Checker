const path=require('path');

module.exports={
    mode: 'production',
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /(?<!background)\.ts$/, //exclude background page
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        publicPath: 'dist',
        filename: 'content script bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};