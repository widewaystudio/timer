const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCss = require('mini-css-extract-plugin');
const path = require('path');
module.exports = {
    entry:'./src/index.js',
    output:{
        path:path.resolve(__dirname,"docs"),
        filename:'bundle.js'
    },
    module:{
        rules:[           
            {test:/\.(c|le|sa)ss$/, 
                use:[
                    MiniCss.loader,
                    "css-loader",
                    "postcss-loader",
                    "sass-loader"
                ]
              },
              {
                  test:/\.(png|jpg|gif)/,
                  use:[
                      {
                          loader:'url-loader',
                          options:{
                              limit:50000
                          }
                      }
                  ]
              },
              {
                  test:/\.(htm|html)$/i,
                  use:['html-withimg-loader']
              }
        ]
    },
    plugins:[
        new htmlWebpackPlugin({template:'./index.html'}),
        new MiniCss({filename:"[name].css"})
    ],
    mode:'development',
    devServer:{
        port:'8081',
        open:true
    }
}