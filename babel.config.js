module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Release bundles: drop debug logging (it prints API payloads with
      // personal data and costs time on the JS thread). Errors are kept.
      ...(isProduction ? [['transform-remove-console', { exclude: ['error'] }]] : []),
    ],
  };
};
