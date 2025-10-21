/**
 * Prompt Generator API
 * API calls for Sora Prompt Generator (using mock data for now)
 */

import { PromptGenerateRequest, PromptGenerateResponse, GeneratedPrompt } from './types';
import { MOCK_PROMPTS } from './constants';

/**
 * Generate prompts based on user input
 * Currently uses mock data - will be replaced with real API call
 */
export async function generatePrompts(
  request: PromptGenerateRequest
): Promise<PromptGenerateResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const { videoType, promptCount } = request;

    // Get mock prompts for the selected video type
    const mockPromptsForType = MOCK_PROMPTS[videoType] || MOCK_PROMPTS.realistic;

    // Generate the requested number of prompts
    const prompts: GeneratedPrompt[] = [];

    for (let i = 0; i < promptCount; i++) {
      // Cycle through available mock prompts
      const mockPrompt = mockPromptsForType[i % mockPromptsForType.length];

      prompts.push({
        id: `prompt-${Date.now()}-${i}`,
        content: mockPrompt,
        index: i + 1,
      });
    }

    return {
      success: true,
      prompts,
    };
  } catch (error) {
    console.error('Error generating prompts:', error);
    return {
      success: false,
      prompts: [],
      error: 'Failed to generate prompts. Please try again.',
    };
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download text as a file
 */
export function downloadAsTextFile(content: string, filename: string = 'sora-prompt.txt'): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share prompt (uses Web Share API if available)
 */
export async function sharePrompt(content: string, title: string = 'Sora Prompt'): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: content,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  } else {
    // Fallback to copying to clipboard
    return copyToClipboard(content);
  }
}
