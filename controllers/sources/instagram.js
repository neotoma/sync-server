var instagram = {};

instagram.toObject = function(userSourceAuths) {
  return {
    id: 'instagram',
    name: 'Instagram',
    enabled: false,
    logoGlyphPath: '/images/logos/instagram-glyph.svg'
  };
};

module.exports = instagram;