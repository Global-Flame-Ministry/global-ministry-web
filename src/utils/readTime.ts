import type { BlogBlockDto } from '../types';

const READABLE_BLOCK_TYPES: BlogBlockDto['blockType'][] = ['Heading', 'Paragraph', 'Quote'];
const WORDS_PER_MINUTE = 200;

export const getReadTime = (blocks: BlogBlockDto[] = []): number => {
  const wordCount = blocks
    .filter(block => READABLE_BLOCK_TYPES.includes(block.blockType))
    .map(block => block.content ?? '')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};
