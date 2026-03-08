// resources/js/components/TextareaEditor.tsx
import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import InputError from "@/components/input-error";

interface TextareaEditorProps {
    value?: string;
    onChange?: (content: string) => void;
    error?: string | null;
    height?: number;
    className?: string;
}

export default function TextareaEditor({
                                           value = "",
                                           onChange = () => {},
                                           error = null,
                                           height = 600,
                                           className,
                                       }: TextareaEditorProps) {
    const editorRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    // mount only on client to avoid SSR issues (document undefined)
    useEffect(() => {
        setMounted(true);
    }, []);

    // capture-phase listeners so Radix focus-trap won't treat Tiny UI as "outside"
    useEffect(() => {
        if (!mounted) return;

        const POPUP_SELECTOR =
            ".tox-tinymce-aux, .tox-dialog, .moxman-window, .tam-assetmanager-root, .tox-silver-sink";

        function stopIfPopup(e: Event) {
            const target = e.target as HTMLElement | null;
            if (target?.closest && target.closest(POPUP_SELECTOR)) {
                e.stopPropagation();
            }
        }

        document.addEventListener("pointerdown", stopIfPopup, true);
        document.addEventListener("mousedown", stopIfPopup, true);
        document.addEventListener("touchstart", stopIfPopup, true);

        return () => {
            document.removeEventListener("pointerdown", stopIfPopup, true);
            document.removeEventListener("mousedown", stopIfPopup, true);
            document.removeEventListener("touchstart", stopIfPopup, true);
        };
    }, [mounted]);

    // SSR fallback: render a native textarea so forms still work
    if (!mounted) {
        return (
            <div className={className}>
        <textarea
            defaultValue={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight: height }}
            className="w-full rounded border p-2"
        />
                {error && <InputError message={error} />}
            </div>
        );
    }

    // client-only TinyMCE render
    return (
        <div className={className}>
            {/* ensure Tiny UI floats on top of modals/overlays */}
            <style>{`
        .tox-tinymce-aux, .tox-dialog, .moxman-window, .tam-assetmanager-root {
          z-index: 2147483646 !important;
          pointer-events: auto !important;
        }
        .tox.tox-fullscreen { z-index: 2147483645 !important; }
      `}</style>

            <Editor
                apiKey="2dze5jtbx912ir9l3xn1gmu90c06jnpomzy2lyypdq5xqcm8"
                onInit={(_evt, editor) => (editorRef.current = editor)}
                value={value}
                onEditorChange={(content) => onChange(content)}
                init={{
                    height,
                    menubar: "file edit view insert format tools table help",
                    plugins: [
                        "advlist",
                        "anchor",
                        "autolink",
                        "charmap",
                        "code",
                        "codesample",
                        "directionality",
                        "emoticons",
                        "fullscreen",
                        "help",
                        "image",
                        "importcss",
                        "insertdatetime",
                        "link",
                        "lists",
                        "media",
                        "preview",
                        "searchreplace",
                        "table",
                        "visualblocks",
                        "visualchars",
                        "wordcount",
                    ],
                    toolbar:
                        "undo redo | blocks fontfamily fontsize | " +
                        "bold italic underline strikethrough forecolor backcolor | " +
                        "link image media table emoticons | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist outdent indent | " +
                        "removeformat | code fullscreen preview | help",
                    content_style: "body { font-family:Arial,sans-serif; line-height:1.5; }",
                    // only try to append to body on client (we're already mounted so document exists)
                    appendTo: document.body,
                }}
            />

            {error && <InputError message={error} />}
        </div>
    );
}
