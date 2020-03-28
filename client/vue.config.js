module.exports={
    devServer: {
        proxy: {
            '^/server': {
                target: 'http://localhost:3000', // 接口的域名
                changeOrigin: true,
                pathRewrite:{
                    "^/server":"/"
                }
            }
        }
    }
}