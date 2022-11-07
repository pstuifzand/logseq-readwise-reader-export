# logseq-readwise-reader-export

Send blocks to Readwise Reader as highlights.

## Features

- Export a block to Readwise.
- Export a block with a note to Readwise.
- Export a page to Reader
- Save an URL to Reader

## Functions

### Export blocks

You can send the current block as a highlight to Readwise with the 
slash command "Export as highlight to Readwise" or from the context menu
with "Export as highlight to Readwise".

The current block will be sent as the highlight and the first child block
as the note. When you send the same highlight multiple times, it will only
be saved once, because Readwise looks at the author, title, text combination
for a highlight. It updates the note when the note is send again later.
Formatting is not supported.

Highlights are created in a book with author and title from the plugin settings.

![Export to Readwise with note by slash command](./export-to-readwise-with-note.png)

### Export page to Reader

Use the command palette "Export Page to Reader". When called the plugin will the
author from settings, a fake url (because logseq urls are not accepted), the
page title and the content blocks as paragraphs to Reader. The HTML the plugin
sends is very simple for now, but can be improved. Please provide feedback about
this in Discussions.

### Save URL to Reader

Use the command palette "Save URL to Reader" or the block context menu to Save
a URL to Reader".

## Settings

You can set the Readwise access token, author and book title.

## Author

Peter Stuifzand
