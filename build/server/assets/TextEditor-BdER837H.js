import { jsx, Fragment } from "react/jsx-runtime";
import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce.js";
import "tinymce/models/dom/model.js";
import "tinymce/themes/silver/index.js";
import "tinymce/icons/default/index.js";
import "tinymce/skins/ui/oxide/skin.js";
import "tinymce/plugins/advlist/index.js";
import "tinymce/plugins/anchor/index.js";
import "tinymce/plugins/autolink/index.js";
import "tinymce/plugins/autoresize/index.js";
import "tinymce/plugins/autosave/index.js";
import "tinymce/plugins/charmap/index.js";
import "tinymce/plugins/code/index.js";
import "tinymce/plugins/codesample/index.js";
import "tinymce/plugins/directionality/index.js";
import "tinymce/plugins/emoticons/index.js";
import "tinymce/plugins/fullscreen/index.js";
import "tinymce/plugins/help/index.js";
import "tinymce/plugins/help/js/i18n/keynav/en.js";
import "tinymce/plugins/image/index.js";
import "tinymce/plugins/importcss/index.js";
import "tinymce/plugins/insertdatetime/index.js";
import "tinymce/plugins/link/index.js";
import "tinymce/plugins/lists/index.js";
import "tinymce/plugins/media/index.js";
import "tinymce/plugins/nonbreaking/index.js";
import "tinymce/plugins/pagebreak/index.js";
import "tinymce/plugins/preview/index.js";
import "tinymce/plugins/quickbars/index.js";
import "tinymce/plugins/save/index.js";
import "tinymce/plugins/searchreplace/index.js";
import "tinymce/plugins/table/index.js";
import "tinymce/plugins/visualblocks/index.js";
import "tinymce/plugins/visualchars/index.js";
import "tinymce/plugins/wordcount/index.js";
import "tinymce/plugins/emoticons/js/emojis.js";
import "tinymce/skins/content/default/content.js";
import "tinymce/skins/ui/oxide/content.js";
function BundledEditor(props) {
  props.height + 150;
  return /* @__PURE__ */ jsx(
    Editor,
    {
      licenseKey: "gpl",
      ...props,
      init: {
        plugins: [
          "autoresize",
          "lists",
          "advlist",
          "anchor",
          "autolink",
          "help",
          "image",
          "link",
          "searchreplace",
          "table",
          "wordcount",
          "media"
        ],
        toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help| link image media",
        menubar: false,
        promotion: false,
        onboarding: false,
        statusbar: false,
        content_css: "/editor-content.css",
        content_style: "body { padding: 0px 26px }"
      }
    }
  );
}
function TextEditor({ editorRef, content, height }) {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    BundledEditor,
    {
      onInit: (_evt, editor) => editorRef.current = editor,
      initialValue: content,
      init: {
        menubar: false
      },
      height
    }
  ) });
}
export {
  TextEditor as default
};
