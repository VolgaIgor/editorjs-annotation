# Annotation Inline Tool for Editor.js
Allows to add an extended annotation to any text 

## Preview
![Preview image](https://github.com/VolgaIgor/editorjs-annotation/raw/main/asset/screenshot.png)

### Required
- Editor.js v2.20+

## Installation

### Download to your project's source dir
1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

## Usage
```javascript
var editor = EditorJS({
  // ...
  tools: {
    // ...
    annotation: Annotation
  },
  // ...
});
```

## Output data
Annotation will be wrapped with a `span` tag. with an `cdx-annotation` class.

Additional data will be store in element's dataset: `data-title`, `data-text`.

```json
{
    "type" : "paragraph",
    "data" : {
        "text" : "Nuclear power plants have a <span class=\"cdx-annotation\" data-title=\"Carbon footprint\" data-text=\"Indicator to compare the total amount...\">carbon footprint</span>..."
    }
}
```
