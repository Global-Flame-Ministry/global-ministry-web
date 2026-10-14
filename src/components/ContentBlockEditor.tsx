import { useRef } from 'react';
import { ChevronUp, ChevronDown, Quote, FileText, BookOpen, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { CreateBlogBlockDto } from '../types';
import { useAdminTheme } from '../context/AdminThemeContext';
import ImageUpload from './ImageUpload';
import { BLOCK_TYPES, newBlock, type BlockType, type EditorBlock } from './blog/contentBlocks';

interface ContentBlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  emptyHint?: string;
}

/**
 * Structured content-block editor (Heading / Paragraph / Image / Quote) shared
 * by blog posts and clip write-ups.
 */
const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  blocks,
  onChange,
  onUploadingChange,
  emptyHint = 'Add one or more blocks to build the layout.',
}) => {
  const { isDark } = useAdminTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const input = isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900';

  const addBlock = (type: BlockType) => {
    onChange([...blocks, newBlock(type, blocks.length + 1)]);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    onChange(next.map((block, idx) => ({ ...block, displayOrder: idx + 1 })));
  };

  const removeBlock = (index: number) => {
    onChange(
      blocks.filter((_, i) => i !== index).map((block, idx) => ({ ...block, displayOrder: idx + 1 }))
    );
  };

  const setBlockField = (
    index: number,
    field: keyof CreateBlogBlockDto,
    value: string | undefined | number
  ) => {
    onChange(blocks.map((block, idx) => (idx === index ? { ...block, [field]: value } : block)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Content Blocks</p>
          <p className="text-sm text-slate-500">Add headings, paragraphs, quotes, and images in order.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => addBlock(type)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf] cursor-pointer"
            >
              {type === 'Heading' ? (
                <FileText className="h-4 w-4" />
              ) : type === 'Image' ? (
                <ImageIcon className="h-4 w-4" />
              ) : type === 'Quote' ? (
                <Quote className="h-4 w-4" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              {type}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="space-y-4">
        {blocks.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
            {emptyHint}
          </div>
        )}
        {blocks.map((block, index) => (
          <div key={block.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-slate-900">{block.blockType} Block</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  aria-label="Move block up"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-[#f3e8ff] hover:text-[#7c3aed] cursor-pointer"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  aria-label="Move block down"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-[#f3e8ff] hover:text-[#7c3aed] cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  aria-label="Remove block"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {block.blockType === 'Heading' && (
              <input
                value={block.content ?? ''}
                onChange={(e) => setBlockField(index, 'content', e.target.value)}
                placeholder="Heading text"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${input}`}
              />
            )}
            {block.blockType === 'Paragraph' && (
              <textarea
                value={block.content ?? ''}
                onChange={(e) => setBlockField(index, 'content', e.target.value)}
                rows={4}
                placeholder="Paragraph text"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${input}`}
              />
            )}
            {block.blockType === 'Quote' && (
              <textarea
                value={block.content ?? ''}
                onChange={(e) => setBlockField(index, 'content', e.target.value)}
                rows={3}
                placeholder="Quote text | Author name"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${input}`}
              />
            )}
            {block.blockType === 'Image' && (
              <ImageUpload
                label="Block Image"
                value={block.imageUrl ?? null}
                onChange={(url) => setBlockField(index, 'imageUrl', url ?? undefined)}
                onUploadingChange={onUploadingChange}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentBlockEditor;
