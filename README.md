# logseq-readwise-reader-export

Send blocks to Readwise Reader as highlights.

## Features

- Send a block to Readwise.
- Send a block with a note to Readwise.

## Functions

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

## Settings

You can set the Readwise access token, author and book title.

## Author

Peter Stuifzand
