export const unsplashSearchResponse = {
  total: 500,
  total_pages: 50,
  results: [
    {
      id: 'abc123',
      created_at: '2024-01-15T10:30:00Z',
      width: 4000,
      height: 3000,
      color: '#0C4A6E',
      description: 'Modern office workspace with laptop',
      alt_description: 'laptop on desk',
      urls: {
        raw: 'https://images.unsplash.com/photo-123?ixid=xxx',
        full: 'https://images.unsplash.com/photo-123?q=80&w=2000',
        regular: 'https://images.unsplash.com/photo-123?q=80&w=1080',
        small: 'https://images.unsplash.com/photo-123?q=80&w=400',
        thumb: 'https://images.unsplash.com/photo-123?q=80&w=200',
      },
      links: {
        self: 'https://api.unsplash.com/photos/abc123',
        html: 'https://unsplash.com/photos/abc123',
        download: 'https://unsplash.com/photos/abc123/download',
      },
      user: {
        id: 'user123',
        username: 'photographer',
        name: 'John Photographer',
        portfolio_url: 'https://unsplash.com/@photographer',
      },
    },
  ],
};
