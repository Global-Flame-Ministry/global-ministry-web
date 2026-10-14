import SmartImage from '../SmartImage';
import type { BlogBlockDto } from '../../types';

/**
 * Renders a single structured content block (Heading / Paragraph / Image / Quote).
 * Shared by blog posts and clip write-ups, which use the same block model.
 */
const ContentBlock: React.FC<{ block: BlogBlockDto }> = ({ block }) => {
  switch (block.blockType) {
    case 'Heading':
      return (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-10 mb-4 border-l-4 border-[#5b0064] pl-4 break-words">
          {block.content}
        </h2>
      );
    case 'Paragraph':
      return (
        <p className="w-full max-w-full text-gray-700 text-[17px] leading-relaxed mb-6 whitespace-pre-wrap break-words">
          {block.content}
        </p>
      );
    case 'Image':
      return (
        <SmartImage
          src={block.imageUrl ?? ''}
          alt={block.imageUrl?.split('/').pop() ?? 'Image'}
          variant="article"
        />
      );
    case 'Quote': {
      const [quote, author] = (block.content ?? '').split('|').map((s) => s.trim());
      return (
        <blockquote className="my-8 bg-purple-50 border-l-4 border-[#5b0064] p-6 rounded-r-2xl">
          <p className="text-xl italic text-gray-800 mb-2 break-words">{`"${quote}"`}</p>
          {author && <p className="text-sm font-semibold text-gray-700">{author}</p>}
        </blockquote>
      );
    }
    default:
      return null;
  }
};

export default ContentBlock;
