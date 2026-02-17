export const claudeIntentionAnalysis = {
  analysis: {
    type: 'historique',
    period: '19e siècle',
    style: 'gravure scientifique',
    keywords: ['électricité', 'expériences', 'physique'],
  },
  sources: ['met'],
  queries: {
    met: 'electricity scientific illustration 19th century',
  },
  reasoning:
    'Demande historique et scientifique → Met Museum pour illustrations scientifiques classiques',
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
