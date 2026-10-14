import type { CreateBlogBlockDto } from '../../types';

export const BLOCK_TYPES = ['Heading', 'Paragraph', 'Image', 'Quote'] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export interface EditorBlock extends CreateBlogBlockDto {
  id: string;
}

export const newBlock = (type: BlockType, order: number): EditorBlock => ({
  id: `${type}-${Date.now()}-${order}`,
  blockType: type,
  content: '',
  imageUrl: undefined,
  displayOrder: order,
});

/** Converts the editor's blocks into the ordered DTO the API expects. */
export const buildBlockDtos = (blocks: EditorBlock[]): CreateBlogBlockDto[] =>
  blocks
    .map((block, idx) => ({
      blockType: block.blockType,
      content: block.blockType === 'Image' ? undefined : block.content,
      imageUrl: block.blockType === 'Image' ? block.imageUrl : undefined,
      displayOrder: idx + 1,
    }))
    .filter((block) => block.blockType !== 'Image' || block.imageUrl) as CreateBlogBlockDto[];
