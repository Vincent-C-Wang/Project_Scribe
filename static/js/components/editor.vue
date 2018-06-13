<template>
  <div class="quill-editor">
    <slot name="toolbar"></slot>
    <div ref="editor"></div>
  </div>
</template>


<script>
import { quillEditor } from 'vue-quill-editor'

export default {
  data () {
    return {
      name: '',
      content: '<h2>Example</h2>',
      editorOption: {}
    }
  },
  components: {
    Hello,
    quillEditor
  }
}
</script>