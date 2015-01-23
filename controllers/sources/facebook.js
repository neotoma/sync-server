var facebook = {};

facebook.toObject = function(userSourceAuths) {
  return {
    id: 'facebook',
    name: 'Facebook',
    enabled: false,
    logoGlyphPath: '/images/logos/facebook-glyph.svg'
  };
};

module.exports = facebook;