var googlePlus = {};

googlePlus.toObject = function(userSourceAuths) {
  return {
    id: 'googlePlus',
    name: 'Google+',
    enabled: false,
    logoGlyphPath: '/images/logos/google-plus-glyph.svg'
  };
};

module.exports = googlePlus;