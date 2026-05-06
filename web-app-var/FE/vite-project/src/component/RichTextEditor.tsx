import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import '../styles/RichTextEditor.css';

// ── Custom Image extension: adds alignment class + width style ──
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: 'img-center',
        parseHTML: (el: HTMLElement) => el.getAttribute('class') || 'img-center',
        renderHTML: (attrs: Record<string, unknown>) => ({
          class: (attrs.class as string) || 'img-center',
        }),
      },
      style: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('style'),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.style ? { style: attrs.style as string } : {},
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
const FONTS = ['Inter', 'Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana'];
const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
  '#ff0000', '#ff4444', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff',
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6',
];

const IMG_WIDTHS = ['25%', '33%', '50%', '66%', '75%', '100%'];

const ToolbarBtn = ({ active, onClick, title, disabled, children }: {
  active?: boolean; onClick: () => void; title: string; disabled?: boolean; children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
    className={`rte-btn${active ? ' rte-btn-active' : ''}${disabled ? ' rte-btn-disabled' : ''}`}
    title={title}
    disabled={disabled}
  >
    {children}
  </button>
);

const Divider = () => <span className="rte-divider" />;

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [imageAlign, setImageAlignState] = useState('img-center');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      CustomImage.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onSelectionUpdate({ editor }) {
      const { selection } = editor.state;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = (selection as any).node;
      if (node && node.type.name === 'image') {
        setImageSelected(true);
        setImageAlignState(node.attrs.class || 'img-center');
      } else {
        setImageSelected(false);
      }
    },
  });

  // ── Upload image from local file (converted to base64) ──
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (src) {
          editor.chain().focus().insertContent({
            type: 'image',
            attrs: { src, class: 'img-center' },
          }).run();
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';   // allow re-uploading same file
    },
    [editor]
  );

  // ── Insert image from URL ──
  const addImageUrl = useCallback(() => {
    const url = window.prompt('Nhập URL hình ảnh:');
    if (url && editor) {
      editor.chain().focus().insertContent({
        type: 'image',
        attrs: { src: url, class: 'img-center' },
      }).run();
    }
  }, [editor]);

  // ── Set alignment class on selected image ──
  const applyImageAlign = useCallback(
    (alignClass: string) => {
      if (!editor) return;
      editor.chain().focus().updateAttributes('image', { class: alignClass }).run();
      setImageAlignState(alignClass);
    },
    [editor]
  );

  // ── Set width on selected image ──
  const applyImageWidth = useCallback(
    (width: string) => {
      if (!editor) return;
      editor.chain().focus().updateAttributes('image', { style: `width: ${width}; max-width: 100%;` }).run();
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Nhập URL liên kết:', prev ?? '');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const setFontSize = useCallback((size: string) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rte-wrapper">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {/* Font family */}
        <select
          className="rte-select"
          title="Font chữ"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Font size */}
        <select
          className="rte-select rte-select-sm"
          title="Cỡ chữ"
          onChange={(e) => setFontSize(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Cỡ</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}</option>)}
        </select>

        <Divider />

        {/* Headings */}
        <ToolbarBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Tiêu đề 1">H1</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Tiêu đề 2">H2</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Tiêu đề 3">H3</ToolbarBtn>

        <Divider />

        {/* Basic formatting */}
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Đậm (Ctrl+B)"><b>B</b></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Nghiêng (Ctrl+I)"><i>I</i></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Gạch chân (Ctrl+U)"><u>U</u></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Gạch ngang"><s>S</s></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Tô màu nền">
          <span style={{ background: '#ffe066', padding: '0 2px' }}>A</span>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code inline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Color picker */}
        <div className="rte-color-picker" title="Màu chữ">
          <span className="rte-color-label">A</span>
          <div className="rte-color-palette">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className="rte-color-swatch"
                style={{ background: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                title={c}
              />
            ))}
            <label className="rte-color-custom" title="Màu tùy chỉnh">
              <input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </label>
          </div>
        </div>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Căn trái">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Căn giữa">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Căn phải">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Căn đều">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Danh sách gạch đầu dòng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Danh sách đánh số">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Trích dẫn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Indent */}
        <ToolbarBtn active={false} onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Thụt vào">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="7 9 10 12 7 15"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Thụt ra">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="10 9 7 12 10 15"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Link & Image & Table */}
        <ToolbarBtn active={editor.isActive('link')} onClick={setLink} title="Chèn liên kết">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </ToolbarBtn>
        {/* Upload from computer */}
        <ToolbarBtn active={false} onClick={() => fileInputRef.current?.click()} title="Upload ảnh từ máy tính">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </ToolbarBtn>
        {/* Insert from URL */}
        <ToolbarBtn active={false} onClick={addImageUrl} title="Chèn ảnh từ URL">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={false} onClick={insertTable} title="Chèn bảng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </ToolbarBtn>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Hoàn tác (Ctrl+Z)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Làm lại (Ctrl+Y)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Xóa định dạng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/><line x1="2" y1="2" x2="22" y2="22" stroke="red"/></svg>
        </ToolbarBtn>
      </div>

      {/* ── Image Format Bar (contextual, like Word's Picture Format tab) ── */}
      {imageSelected && (
        <div className="rte-image-bar">
          <span className="rte-image-bar-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Định dạng ảnh:
          </span>
          {/* Float left — text wraps on the right */}
          <ToolbarBtn active={imageAlign === 'img-float-left'} onClick={() => applyImageAlign('img-float-left')} title="Văn bản bao quanh bên phải (như Word)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="9" height="9" rx="1" fill="currentColor" stroke="none" opacity="0.65"/>
              <line x1="13" y1="6" x2="22" y2="6"/><line x1="13" y1="10" x2="22" y2="10"/>
              <line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
          </ToolbarBtn>
          {/* Center — block, no wrap */}
          <ToolbarBtn active={imageAlign === 'img-center'} onClick={() => applyImageAlign('img-center')} title="Ảnh căn giữa (không bao văn bản)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="2" y1="3" x2="22" y2="3"/>
              <rect x="7" y="7" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.65"/>
              <line x1="2" y1="19" x2="22" y2="19"/>
            </svg>
          </ToolbarBtn>
          {/* Float right — text wraps on the left */}
          <ToolbarBtn active={imageAlign === 'img-float-right'} onClick={() => applyImageAlign('img-float-right')} title="Văn bản bao quanh bên trái (như Word)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="13" y="3" width="9" height="9" rx="1" fill="currentColor" stroke="none" opacity="0.65"/>
              <line x1="2" y1="6" x2="11" y2="6"/><line x1="2" y1="10" x2="11" y2="10"/>
              <line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
          </ToolbarBtn>
          {/* Full width */}
          <ToolbarBtn active={imageAlign === 'img-full'} onClick={() => applyImageAlign('img-full')} title="Ảnh toàn chiều rộng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="1" fill="currentColor" stroke="none" opacity="0.65"/>
            </svg>
          </ToolbarBtn>

          <span className="rte-divider" />
          <span className="rte-image-bar-label">Kích thước:</span>
          {IMG_WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              className="rte-btn rte-width-btn"
              onMouseDown={(e) => { e.preventDefault(); applyImageWidth(w); }}
              title={`Đặt chiều rộng ${w}`}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Editor area */}
      <EditorContent editor={editor} className="rte-editor" />

      {/* Word count */}
      <div className="rte-footer">
        <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} ký tự</span>
        <span>{editor.getText().split(/\s+/).filter(Boolean).length} từ</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
