export const claudeIntentionAnalysis = {
  analysis: {
    type: 'historique',
    period: '19e siècle',
    style: 'gravure scientifique',
    keywords: ['électricité', 'expériences', 'physique'],
  },
  sources: ['gallica', 'met'],
  queries: {
    gallica: 'gravure électricité 19e siècle expériences',
    met: 'electricity scientific illustration 19th century',
  },
  reasoning:
    'Demande historique et scientifique → Gallica prioritaire pour patrimoine français, Met en complément pour illustrations scientifiques',
};

export const claudeModernArtAnalysis = {
  analysis: {
    type: 'moderne',
    period: null,
    style: 'photographie',
    keywords: ['bureau', 'travail', 'technologie'],
  },
  sources: ['unsplash', 'met'],
  queries: {
    unsplash: 'modern office workspace technology',
    met: 'contemporary photography workplace',
  },
  reasoning:
    'Demande moderne et professionnelle → Unsplash prioritaire pour photos contemporaines',
};
