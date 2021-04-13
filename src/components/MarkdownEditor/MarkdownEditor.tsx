/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { CKEditor } from '@ckeditor/ckeditor5-react';
// @ts-ignore
import Editor from '@helsenorge/ckeditor5-build-markdown';
import ReactMarkdown from 'react-markdown';

import './MarkdownEditor.css';

interface MarkdownEditorProps {
    data: string;
    onBlur?: (data: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const MarkdownEditor = (props: MarkdownEditorProps): JSX.Element => {
    const [value, setValue] = useState<string>(props.data);
    const [editMode, setEditMode] = useState(false);
    const ckEditorRef = useRef(null);

    useEffect(() => {
        if (editMode) {
            // @ts-ignore
            ckEditorRef.current?.editor.editing.view.focus();
        }
    }, [editMode]);

    const handleChange = (event: Event, editor: Editor) => {
        setValue(editor.getData());
    };
    const handleBlur = (event: Event, editor: Editor) => {
        if (props.onBlur) {
            props.onBlur(editor.getData());
        }
        setEditMode(false);
    };

    const editorConfiguration = {
        toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',
            '|',
            'undo',
            'redo',
        ],
        language: 'no-nb',
        placeholder: props.placeholder || '',
    };

    return editMode ? (
        <CKEditor
            ref={ckEditorRef}
            data={value}
            onChange={handleChange}
            onBlur={handleBlur}
            editor={Editor}
            config={editorConfiguration}
            disabled={props.disabled}
        />
    ) : (
        <div className="markdown-preview" onClick={() => setEditMode(true)}>
            <ReactMarkdown>{value}</ReactMarkdown>
        </div>
    );
};

export default MarkdownEditor;
