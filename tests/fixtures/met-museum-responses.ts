export const metSearchResponse = {
  total: 100,
  objectIDs: [1, 2, 3, 4, 5],
};

export const metObjectDetails = {
  objectID: 1,
  isPublicDomain: true,
  title: 'The Starry Night',
  artistDisplayName: 'Vincent van Gogh',
  objectDate: '1889',
  primaryImage:
    'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
  primaryImageSmall:
    'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
  objectURL: 'https://www.metmuseum.org/art/collection/search/436532',
  department: 'European Paintings',
  medium: 'Oil on canvas',
  dimensions: '29 × 36 1/4 in. (73.7 × 92.1 cm)',
};

export const metObjectDetailsWithoutImage = {
  objectID: 2,
  isPublicDomain: true,
  title: 'Ancient Coin',
  artistDisplayName: 'Unknown',
  objectDate: '100 BC',
  primaryImage: '',
  primaryImageSmall: '',
  objectURL: 'https://www.metmuseum.org/art/collection/search/123456',
  department: 'Ancient Near Eastern Art',
  medium: 'Bronze',
  dimensions: '2 cm',
};
