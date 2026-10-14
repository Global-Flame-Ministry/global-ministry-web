import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { heroApi } from '../../api/heroApi';
import ClipPlayer from '../../components/ClipPlayer';
import ContentBlockEditor from '../../components/ContentBlockEditor';
import { buildBlockDtos, type EditorBlock } from '../../components/blog/contentBlocks';
import { useAdminTheme } from '../../context/AdminThemeContext';
import type { HeroSlide } from '../../types';

/** Maps the API clip blocks into the editor's internal block model. */
const toEditorBlocks = (slide: HeroSlide): EditorBlock[] =>
  (slide.contentBlocks ?? [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((b, i) => ({
      id: `${b.id ?? 'new'}-${i}`,
      blockType: b.blockType,
      content: b.content ?? '',
      imageUrl: b.imageUrl ?? undefined,
      displayOrder: b.displayOrder,
    }));

const AdminClipWriteUp: React.FC = () => {
  const { isDark } = useAdminTheme();
  const { id: idParam } = useParams<{ id: string }>();

  const [clip, setClip] = useState<HeroSlide | null>(null);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const bg = isDark ? 'bg-[#0d0d0d] text-white' : 'bg-slate-50 text-slate-900';
  const border = isDark ? 'border-white/10' : 'border-slate-200';

  const applyClip = useCallback((slide: HeroSlide) => {
    setClip(slide);
    setBlocks(toEditorBlocks(slide));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const id = Number(idParam);
      if (!Number.isFinite(id)) return;
      try {
        const res = await heroApi.getSlideById(id);
        if (!active) return;
        if (res.data.data) {
          applyClip(res.data.data);
        } else {
          toast.error('Clip not found');
        }
      } catch {
        toast.error('Failed to load clip');
      }
    })();
    return () => {
      active = false;
    };
  }, [idParam, applyClip]);

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setUploadCount((prev) => Math.max(0, prev + (uploading ? 1 : -1)));
  }, []);

  const save = async () => {
    if (!clip) return;
    setIsSaving(true);
    try {
      const res = await heroApi.updateSlide(clip.id, {
        mediaType: clip.mediaType,
        url: clip.url,
        slug: clip.slug ?? undefined,
        title: clip.title ?? undefined,
        subtitle: clip.subtitle ?? undefined,
        label: clip.label ?? undefined,
        buttonText: clip.buttonText ?? undefined,
        targetUrl: clip.targetUrl ?? undefined,
        displayOrder: clip.displayOrder,
        isActive: clip.isActive,
        isFeatured: clip.isFeatured,
        featuredOrder: clip.featuredOrder,
        contentBlocks: buildBlockDtos(blocks),
      });
      if (res.data.isSuccess) {
        toast.success('Write-up saved');
        if (res.data.data) applyClip(res.data.data);
      } else {
        toast.error(res.data.message || 'Save failed');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save write-up';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!clip) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <Loader className="h-8 w-8 animate-spin text-[#a21caf]" />
      </div>
    );
  }

  const isUploading = uploadCount > 0;

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className={`rounded-3xl border ${border} bg-white/90 p-6 shadow-sm`}>
        <Link
          to="/admin/hero-slides"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#a21caf] transition-colors mb-6"
        >
          ← Back to clips
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div>
            <div className="sticky top-6">
              <h1 className="text-2xl font-bold text-[#111827] mb-1">{clip.title || 'Untitled clip'}</h1>
              <p className="text-sm text-slate-500 mb-4">Write-up for the public clip page.</p>
              <ClipPlayer src={clip.url} title={clip.title} />
              {clip.slug && (
                <p className="mt-3 text-xs text-slate-500">
                  Public URL:{' '}
                  <a
                    href={`/clips/${clip.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#a21caf] hover:underline"
                  >
                    /clips/{clip.slug}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div>
            <ContentBlockEditor
              blocks={blocks}
              onChange={setBlocks}
              onUploadingChange={handleUploadingChange}
              emptyHint="Add headings, paragraphs, quotes, or images to write up this clip."
            />

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={save}
                disabled={isSaving || isUploading}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#a21caf] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving…' : 'Save write-up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClipWriteUp;
