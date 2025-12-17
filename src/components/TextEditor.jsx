import BundledEditor from "../BundledEditor.jsx";

export default function TextEditor({ editorRef, content }) {
    /* const log = () => {
        if (editorRef.current) {
            console.log(editorRef.current.getContent());
        }
    }; */

    return (
        <>
            <BundledEditor
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={content}
                init={{
                    // height: 2000,
                    menubar: false,
                    plugins: [
                        "advlist",
                        "anchor",
                        "autolink",
                        "help",
                        "image",
                        "link",
                        "lists",
                        "searchreplace",
                        "table",
                        "wordcount",
                    ],
                    toolbar:
                        "undo redo | blocks | " +
                        "bold italic forecolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist outdent indent | " +
                        "removeformat | help",
                    content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
            />
        </>
    );
}
