var wordpress = {};

wordpress.toObject = function(userSourceAuths) {
  return {
    id: 'wordpress',
    name: 'WordPress',
    enabled: false,
    logoGlyphPath: '/images/logos/wordpress-glyph.svg'
  };
};

module.exports = wordpress;