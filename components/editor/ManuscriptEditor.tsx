"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

type ManuscriptEditorProps = {
  initialContent?: JSONContent | string;
  onReady: (api: EditorApi) => void;
  onUpdate: (payload: { json: JSONContent; words: number; chars: number }) => void;
};

export type EditorApi = {
  setHtml: (html: string) => void;
  setJson: (json: JSONContent) => void;
  clear: () => void;
  getJson: () => JSONContent;
};

function ToolbarButton({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`border p-1.5 ${
        active ? "border-signal text-black" : "border-transparent text-black/50 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

export function ManuscriptEditor({
  initialContent,
  onReady,
  onUpdate,
}: ManuscriptEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Empieza a escribir, o suelta un archivo .docx / .txt / .pdf…",
      }),
      CharacterCount,
    ],
    content: initialContent ?? "<p></p>",
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onUpdate({
        json: instance.getJSON(),
        words: instance.storage.characterCount.words(),
        chars: instance.storage.characterCount.characters(),
      });
    },
  });

  useEffect(() => {
    if (!editor) return;

    onReady({
      setHtml: (html) => editor.commands.setContent(html),
      setJson: (json) => editor.commands.setContent(json),
      clear: () => editor.commands.clearContent(true),
      getJson: () => editor.getJSON(),
    });
  }, [editor, onReady]);

  if (!editor) {
    return (
      <div className="min-h-[70vh] border border-black/10 bg-paper px-8 py-10 text-black/40">
        <p className="font-mono text-xs tracking-[0.2em]">BOOTING CANVAS…</p>
      </div>
    );
  }

  return (
    <div className="border border-black/10 bg-paper text-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-1 border-b border-black/10 px-3 py-2">
        <ToolbarButton
          label="Negrita"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Cursiva"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Título"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Subtítulo"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Lista"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Cita"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-black/40">
          CANVAS / WORD
        </span>
      </div>
      <div className="px-8 py-10 sm:px-14 sm:py-12">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
