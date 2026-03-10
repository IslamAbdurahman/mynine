import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Attempt, Part } from '@/types';
import { sanitizeAndInsertWbr } from '@/utils/sanitizeAndInsertWbr';

interface PartUpdateProps {
    part: Part;
    attempt: Attempt;
}

export default function PracticePart({ attempt, part }: PartUpdateProps) {
    const { t } = useTranslation();
    const textRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const [selectionRange, setSelectionRange] = useState<Range | null>(null);
    const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);

    const storageKey = `highlight-part-${part.id}-${attempt.id}`;

    useEffect(() => {
        if (!textRef.current) return;

        // prefer saved highlights (user edited), but sanitize it as well
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            // saved might already contain <mark>, we still sanitize but preserve tags
            textRef.current.innerHTML = sanitizeAndInsertWbr(saved, 40);
        } else {
            textRef.current.innerHTML = sanitizeAndInsertWbr(part.textarea || '', 40);
        }
    }, [part.textarea, storageKey]);

    // Show floating toolbar when text is selected
    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            setToolbarPos(null);
            setSelectionRange(null);
            return;
        }

        const range = selection.getRangeAt(0);
        if (!textRef.current?.contains(range.commonAncestorContainer)) {
            setToolbarPos(null);
            setSelectionRange(null);
            return;
        }

        if (selection.isCollapsed) {
            setToolbarPos(null);
            setSelectionRange(null);
            return;
        }

        const rect = range.getBoundingClientRect();
        const containerRect = textRef.current.getBoundingClientRect();

        // Position toolbar below the selection inside container
        setToolbarPos({
            top: rect.bottom - containerRect.top + textRef.current.scrollTop + 50, // below selection
            left: rect.left - containerRect.left + textRef.current.scrollLeft,
        });
        setSelectionRange(range);
    };




    const wrapRangeWithMark = (range: Range) => {
        const walker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement?.classList.contains('highlight'))
                        return NodeFilter.FILTER_REJECT;

                    const nodeRange = document.createRange();
                    nodeRange.selectNodeContents(node);

                    if (
                        range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0 ||
                        range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0
                    )
                        return NodeFilter.FILTER_REJECT;

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes: Text[] = [];
        while (walker.nextNode()) nodes.push(walker.currentNode as Text);

        nodes.forEach((node) => {
            const nodeRange = document.createRange();
            nodeRange.selectNodeContents(node);

            const start =
                range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
                    ? 0
                    : range.startOffset;
            const end =
                range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0
                    ? node.length
                    : range.endOffset;

            const textToHighlight = node.splitText(start);
            textToHighlight.splitText(end - start);

            const mark = document.createElement('mark');
            mark.className = 'highlight';
            mark.textContent = textToHighlight.nodeValue;

            textToHighlight.parentNode?.replaceChild(mark, textToHighlight);
        });
    };

    const handleHighlight = () => {
        if (!selectionRange) return;
        wrapRangeWithMark(selectionRange);
        window.getSelection()?.removeAllRanges();
        setToolbarPos(null);
        setSelectionRange(null);
        saveHighlights();
    };

    const handleClearHighlight = () => {
        if (!selectionRange) return;
        const marks = Array.from(textRef.current?.querySelectorAll('mark.highlight') ?? []);
        marks.forEach((mark) => {
            const markRange = document.createRange();
            markRange.selectNodeContents(mark);

            if (
                selectionRange.compareBoundaryPoints(Range.END_TO_START, markRange) < 0 &&
                selectionRange.compareBoundaryPoints(Range.START_TO_END, markRange) > 0
            ) {
                const parent = mark.parentNode;
                if (parent) {
                    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
                    parent.removeChild(mark);
                }
            }
        });

        window.getSelection()?.removeAllRanges();
        setToolbarPos(null);
        setSelectionRange(null);
        saveHighlights();
    };

    const saveHighlights = () => {
        if (!textRef.current) return;
        localStorage.setItem(storageKey, textRef.current.innerHTML);
    };

    return (
        <div key={part.id} className="relative">
            <h2 className="font-bold text-lg mb-2">{part.name}</h2>

            <div
                ref={textRef}
                className="prose dark:prose-invert text-base/8 leading-[1.8] break-words max-w-full ielts-passage"
                onMouseUp={handleMouseUp}
            />

            {toolbarPos && (
                <div
                    ref={toolbarRef}
                    style={{
                        position: 'absolute',
                        top: toolbarPos.top,
                        left: toolbarPos.left,
                        zIndex: 50,
                        display: 'flex',
                        gap: '4px',
                    }}
                >
                    <button
                        onClick={handleHighlight}
                        className="px-2 py-1 bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {t('highlight') || 'Highlight'}
                    </button>
                    <button
                        onClick={handleClearHighlight}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {t('clearHighlight') || 'Clear'}
                    </button>
                </div>
            )}

            <style>{`
                mark.highlight {
                  background-color: yellow;
                }
            `}</style>
        </div>
    );
}
