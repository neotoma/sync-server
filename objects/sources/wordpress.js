var wordpress = {};

wordpress.toObject = function() {
  return {
    id: 'wordpress',
    name: 'WordPress',
    enabled: false,
    logoGlyphPath: '/images/logos/wordpress-glyph.svg'
  };
};

module.exports = wordpress;