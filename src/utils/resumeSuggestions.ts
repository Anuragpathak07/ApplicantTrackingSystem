
type SuggestionCategory = 'technical' | 'experience' | 'soft-skills' | 'formatting';

interface ResumeSuggestion {
  category: SuggestionCategory;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

const technicalSuggestions: ResumeSuggestion[] = [
  {
    category: 'technical',
    suggestion: 'Add specific technical certifications relevant to the job',
    impact: 'high'
  },
  {
    category: 'technical',
    suggestion: 'Include proficiency levels for programming languages and tools',
    impact: 'medium'
  },
  {
    category: 'technical',
    suggestion: 'Highlight projects that demonstrate technical skills',
    impact: 'high'
  }
];

const experienceSuggestions: ResumeSuggestion[] = [
  {
    category: 'experience',
    suggestion: 'Quantify achievements with measurable metrics (e.g., "Increased efficiency by 30%")',
    impact: 'high'
  },
  {
    category: 'experience',
    suggestion: 'Use action verbs to describe job responsibilities',
    impact: 'medium'
  },
  {
    category: 'experience',
    suggestion: 'Align work experience descriptions with job description keywords',
    impact: 'high'
  }
];

const softSkillsSuggestions: ResumeSuggestion[] = [
  {
    category: 'soft-skills',
    suggestion: 'Highlight cross-functional collaboration experiences',
    impact: 'medium'
  },
  {
    category: 'soft-skills',
    suggestion: 'Include leadership and team management achievements',
    impact: 'high'
  },
  {
    category: 'soft-skills',
    suggestion: 'Demonstrate problem-solving skills through specific examples',
    impact: 'high'
  }
];

const formatSuggestions: ResumeSuggestion[] = [
  {
    category: 'formatting',
    suggestion: 'Use a clean, professional resume template',
    impact: 'low'
  },
  {
    category: 'formatting',
    suggestion: 'Ensure consistent font and formatting throughout the document',
    impact: 'low'
  },
  {
    category: 'formatting',
    suggestion: 'Keep resume concise, ideally 1-2 pages',
    impact: 'medium'
  }
];

export function generateResumeImprovement(keywordMatches: string[], keywordMisses: string[]): string[] {
  const allSuggestions = [
    ...technicalSuggestions,
    ...experienceSuggestions,
    ...softSkillsSuggestions,
    ...formatSuggestions
  ];

  // Prioritize suggestions based on missing keywords
  const matchedSuggestions = allSuggestions
    .filter(suggestion => 
      keywordMisses.some(miss => 
        suggestion.suggestion.toLowerCase().includes(miss.toLowerCase())
      )
    )
    .sort((a, b) => {
      // Sort by impact, high impact first
      const impactOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    })
    .slice(0, 5)  // Limit to top 5 suggestions
    .map(suggestion => suggestion.suggestion);

  // If no keyword-matched suggestions, return default suggestions
  return matchedSuggestions.length > 0 
    ? matchedSuggestions 
    : allSuggestions
        .filter(s => s.impact === 'high')
        .map(s => s.suggestion)
        .slice(0, 5);
}

