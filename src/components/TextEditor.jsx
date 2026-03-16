import BundledEditor from "../BundledEditor.jsx";
import "../css/textEditor.css";

export default function TextEditor({ editorRef, content, imagePickerTriggerRef, onEditorChange }) {
    return (
        <BundledEditor
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue={content}
            onEditorChange={onEditorChange}
            init={{ menubar: false }}
            imagePickerTriggerRef={imagePickerTriggerRef}
        />
    );
}
