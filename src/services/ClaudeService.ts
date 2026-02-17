import Anthropic from '@anthropic-ai/sdk';
import { IntentionAnalysis, MetFilters } from '../types/types';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_RETRIES = 2;

const SKILL_CONTENT = `Sources disponibles pour illustrations libres de droit :

1. Metropolitan Museum (The Met) - metmuseum.org
   - 492 000+ œuvres en haute résolution, collection encyclopédique
   - Licence CC0 - aucune restriction
   - Idéal pour : Art classique, antiquités, peintures de maîtres, gravures historiques

2. Unsplash - unsplash.com
   - Photos contemporaines haute qualité, esthétique moderne
   - Licence Unsplash (usage libre y compris commercial)
   - Idéal pour : Photos modernes, lifestyle, business, tech

Choix selon contexte :
- Art classique / Antiquités / Historique → Met Museum
- Photos modernes / Business → Unsplash
- Conceptuel / Abstrait → Met Museum + Unsplash`;

const MET_DEPARTMENTS = `Départements du Met Museum (utilise departmentId pour filtrer) :
1=American Decorative Arts, 3=Ancient Near Eastern Art, 4=Arms and Armor,
5=Arts of Africa/Oceania/Americas, 6=Asian Art, 7=The Cloisters,
8=The Costume Institute, 9=Drawings and Prints, 10=Egyptian Art,
11=European Paintings, 12=European Sculpture and Decorative Arts,
13=Greek and Roman Art, 14=Islamic Art, 15=The Robert Lehman Collection,
17=Medieval Art, 18=Musical Instruments, 19=Photographs, 21=Modern Art`;

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la recherche d'illustrations libres de droit.

Tu as accès à cette skill qui décrit les meilleures sources :
${SKILL_CONTENT}

${MET_DEPARTMENTS}

Ton rôle :
1. Analyser l'intention de l'utilisateur
2. Déterminer le type d'illustration recherché (historique, moderne, abstraite, artistique, etc.)
3. Choisir les 2-3 meilleures sources selon la skill
4. Formuler des requêtes de recherche optimales pour chaque source sélectionnée
5. Pour le Met Museum, suggérer des filtres (département, plage de dates) pour affiner les résultats
6. Retourner uniquement un JSON valide, sans texte avant ou après

Format de réponse JSON attendu :
{
  "analysis": {
    "type": "historique|moderne|artistique|scientifique|abstraite|conceptuelle",
    "period": "string ou null",
    "style": "string ou null",
    "keywords": ["mot1", "mot2", "mot3"]
  },
  "sources": ["met", "unsplash"],
  "queries": {
    "met": "requête optimisée pour Met Museum en anglais",
    "unsplash": "requête optimisée pour Unsplash en anglais"
  },
  "metFilters": {
    "departmentId": null,
    "dateBegin": null,
    "dateEnd": null
  },
  "reasoning": "Explication concise du choix des sources et des requêtes"
}

Règles importantes :
- Pour de l'art classique ou historique → privilégier Met Museum
- Pour des photos modernes → privilégier Unsplash
- Les requêtes doivent être en anglais
- Les requêtes doivent être courtes et précises (3-6 mots)
- metFilters.departmentId : un entier parmi les départements listés, ou null si non pertinent
- metFilters.dateBegin/dateEnd : années (ex: 1800, 1900) pour borner la période, ou null
- Retourne UNIQUEMENT le JSON, sans markdown, sans texte explicatif`;

export class ClaudeService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  async analyzeIntention(
    intention: string,
    context: string,
    selectedSources: string[]
  ): Promise<IntentionAnalysis> {
    const userMessage = `Intention: ${intention}${context ? `\nContexte: ${context}` : ''}
Sources disponibles: ${selectedSources.join(', ')}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const messages: Anthropic.MessageParam[] = [
          { role: 'user', content: userMessage },
        ];

        if (attempt > 0) {
          messages.push({
            role: 'assistant',
            content: 'I apologize for the invalid JSON.',
          });
          messages.push({
            role: 'user',
            content:
              'IMPORTANT: Your previous response was not valid JSON. Return ONLY a JSON object, no markdown fences, no text before or after.',
          });
        }

        const response = await this.client.messages.create({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        });

        const text =
          response.content[0].type === 'text' ? response.content[0].text : '';
        const parsed = this.parseJSON(text);

        if (parsed) {
          return this.validateAnalysis(parsed, selectedSources);
        }

        lastError = new Error('Invalid JSON response from Claude');
      } catch (error: any) {
        if (error.status === 401 || error.status === 403) {
          throw new Error('Invalid Anthropic API key');
        }
        lastError = error;
      }
    }

    // Fallback after all retries exhausted
    console.warn(
      'Claude analysis failed after retries, using fallback',
      lastError
    );
    return this.createFallback(intention, selectedSources);
  }

  private parseJSON(text: string): any | null {
    // Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const cleanText = fenceMatch ? fenceMatch[1].trim() : text.trim();

    try {
      return JSON.parse(cleanText);
    } catch {
      return null;
    }
  }

  private validateAnalysis(
    parsed: any,
    selectedSources: string[]
  ): IntentionAnalysis {
    const result: IntentionAnalysis = {
      analysis: {
        type: parsed.analysis?.type || 'unknown',
        period: parsed.analysis?.period || null,
        style: parsed.analysis?.style || null,
        keywords: Array.isArray(parsed.analysis?.keywords)
          ? parsed.analysis.keywords
          : [],
      },
      sources: Array.isArray(parsed.sources)
        ? parsed.sources.filter((s: string) => selectedSources.includes(s))
        : selectedSources,
      queries: parsed.queries || {},
      reasoning: parsed.reasoning || '',
    };

    if (parsed.metFilters) {
      const filters: MetFilters = {};
      if (typeof parsed.metFilters.departmentId === 'number') {
        filters.departmentId = parsed.metFilters.departmentId;
      }
      if (typeof parsed.metFilters.dateBegin === 'number') {
        filters.dateBegin = parsed.metFilters.dateBegin;
      }
      if (typeof parsed.metFilters.dateEnd === 'number') {
        filters.dateEnd = parsed.metFilters.dateEnd;
      }
      if (Object.keys(filters).length > 0) {
        result.metFilters = filters;
      }
    }

    return result;
  }

  async suggestFromNote(noteContent: string): Promise<{ intention: string; context: string }> {
    const truncated = noteContent.slice(0, 2000);

    try {
      const response = await this.client.messages.create({
        model: MODEL,
        max_tokens: 256,
        system: `Tu es un assistant qui aide à trouver des illustrations pour des notes.
À partir du contenu d'une note, tu dois suggérer :
1. Une description d'illustration pertinente (champ "intention") - décris le type d'image qui illustrerait bien cette note
2. Un résumé du contexte de la note (champ "context") - en une phrase

Retourne UNIQUEMENT un JSON valide :
{"intention": "...", "context": "..."}`,
        messages: [{ role: 'user', content: truncated }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = this.parseJSON(text);

      if (parsed?.intention && parsed?.context) {
        return {
          intention: String(parsed.intention).slice(0, 500),
          context: String(parsed.context).slice(0, 300),
        };
      }
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        throw new Error('Invalid Anthropic API key');
      }
      console.warn('Claude suggestion failed:', error);
    }

    return { intention: '', context: '' };
  }

  private createFallback(
    intention: string,
    selectedSources: string[]
  ): IntentionAnalysis {
    return {
      analysis: {
        type: 'unknown',
        period: null,
        style: null,
        keywords: intention.split(/\s+/).filter(Boolean),
      },
      sources: selectedSources,
      queries: Object.fromEntries(
        selectedSources.map((s) => [s, intention])
      ),
      reasoning:
        'Fallback: Claude analysis failed, using raw intention as query',
    };
  }
}
