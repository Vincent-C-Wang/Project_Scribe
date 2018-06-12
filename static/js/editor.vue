import quill from 'vue-quill-editor'

export default {
  data () {
    return {
      name: 'app',
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