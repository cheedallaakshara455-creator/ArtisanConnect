const imageUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1000&q=85`;

const NAME_IMAGE_OVERRIDES = [
  { matches: ['terracotta serving bowl', 'serving bowl', 'terracotta bowl'], image: 'photo-1578749556568-bc2c40e68b61' },
  { matches: ['carved wooden elephant', 'wooden elephant'], image: 'photo-1690667939358-50ff2a4f5a50' },
  { matches: ['buddha', 'budha'], image: 'photo-1557438672-fdd6d736944a' },
  { matches: ['warli', 'wali art'], image: 'photo-1577083552431-6e5fd01aa342' },
  { matches: ['bamboo fruit basket', 'fruit basket'], image: 'photo-1773823307113-2dcc3609aa79' },
  { matches: ['soapstone incense', 'stone incense', 'incense holder'], image: 'photo-1769985840494-32e240087fa4' },
  { matches: ['marbel coaster', 'marble coaster', 'coaster'], image: 'photo-1780241626535-9787b7b1a842' },
  { matches: ['silk women saree', 'silk saree', 'saree', 'sari'], image: 'photo-1749226368937-29d75dacf595' },
  { matches: ['pashmina', 'shwal', 'shawl'], image: 'photo-1576073383268-a8aae73f33bd' },
];

export const getProductImages = (product) => {
  const name = String(product?.name || '').toLowerCase();
  const override = NAME_IMAGE_OVERRIDES.find(({ matches }) =>
    matches.some((match) => name.includes(match))
  );

  if (override) return [imageUrl(override.image)];
  return Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
};

export const getProductImage = (product) => getProductImages(product)[0] || null;
