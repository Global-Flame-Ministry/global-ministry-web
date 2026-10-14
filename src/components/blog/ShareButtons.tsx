import { useState } from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'X',
      icon: <Twitter className="h-4 w-4" />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {shares.map(share => (
        <a
          key={share.label}
          href={share.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${share.label}`}
          title={`Share on ${share.label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d5c0d1]
            text-[#51424f] transition-colors hover:border-[#5b0064] hover:text-[#5b0064]"
        >
          {share.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        title="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d5c0d1]
          text-[#51424f] transition-colors hover:border-[#5b0064] hover:text-[#5b0064] cursor-pointer"
      >
        {copied ? <Check className="h-4 w-4 text-[#5b0064]" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default ShareButtons;
