var tumblr = {};

tumblr.toObject = function(userSourceAuths) {
  return {
    id: 'tumblr',
    name: 'Tumblr',
    enabled: false,
    logoGlyphPath: '/images/logos/tumblr-glyph.svg'
  };
};

module.exports = tumblr;