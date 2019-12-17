const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = (config, entry) => {
  config.node = entry.isPluginCommand
    ? false
    : {
        setImmediate: false,
      }

  config.resolve.extensions.push('.ts', '.vue')

  config.module.rules = config.module.rules.reduce((rules, rule) => {
    if (rule.use.loader === 'babel-loader') {
      rules.push(
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: [/\.vue$/],
              },
            },
          ],
        },
      )
    } else {
      rules.push(rule)
    }

    return rules
  }, [])

  config.module.rules.push({
    test: /\.(html)$/,
    use: [
      {
        loader: '@skpm/extract-loader',
      },
      {
        loader: 'html-loader',
        options: {
          attrs: ['img:src', 'link:href'],
          interpolate: true,
        },
      },
    ],
  })

  config.module.rules.push({
    test: /\.(css)$/,
    use: [
      {
        loader: '@skpm/extract-loader',
      },
      {
        loader: 'css-loader',
      },
    ],
  })

  config.plugins.push(new VueLoaderPlugin())
}
