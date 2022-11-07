import '@logseq/libs';
import {callSettings} from "./src/callSettings"

const main = async () => {
    callSettings()

    let exportPageToReader = async (e) => {
        console.log(e)
        const {accessToken, author, title} = logseq.settings
        if (!accessToken) {
            setTimeout(() => logseq.UI.showMsg('First fill in Readwise access token in plugin settings', 'error'), 1)
            return
        }
        const page = await logseq.Editor.getCurrentPage()
        const pageBlocks = await logseq.Editor.getPageBlocksTree(page.originalName)
        const pageContent = pageBlocks.map(value => {
           return "<p>" + value.content + "</p>"
        }).join("\n\n")

        const graphName = (await logseq.App.getCurrentGraph()).name
        const data = {
            // url: 'logseq://graph/'+encodeURIComponent(graphName)+'?page='+encodeURIComponent(page.originalName),
            url: 'https://example.com/',
            html: pageContent,
            author,
            title: page.originalName,
        }
        console.log(data)

        await fetch('https://readwise.io/api/v3/save/', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + accessToken,
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Export to Reader", data);
                return data
            })
            .then(() => {
                setTimeout(() => logseq.UI.showMsg('Page exported', 'success'), 1)
            })
            .catch(e => {
                console.error(e)
                setTimeout(() => logseq.UI.showMsg('Export of page failed: ' + e, 'error'), 1)
            })
    }

    let exportHighlightToReadwise = async (e) => {
        const {accessToken, author, title} = logseq.settings
        if (!accessToken) {
            setTimeout(() => logseq.UI.showMsg('First fill in Readwise access token in plugin settings', 'error'), 1)
            return
        }
        const block = await logseq.Editor.getBlock(e.uuid, {
            includeChildren: true
        })
        const children = block.children
        const note = children.length > 0 ? children[0].content : null

        const data = {
            highlights: [{
                text: block.content,
                title,
                author,
                note,
            }]
        }

        await fetch('https://readwise.io/api/v2/highlights/', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + accessToken,
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Export to Readwise", data);
                return data
            })
            .then(() => {
                setTimeout(() => logseq.UI.showMsg('Highlight exported', 'success'), 1)
            })
            .catch(e => {
                console.error(e)
                setTimeout(() => logseq.UI.showMsg('Export failed: ' + e, 'error'), 1)
            })
    };

    logseq.Editor.registerBlockContextMenuItem('Export as highlight to Readwise', exportHighlightToReadwise)
    logseq.Editor.registerSlashCommand('Export as highlight to Readwise', exportHighlightToReadwise)
    logseq.App.registerCommandPalette({
        key: 'export-page-to-reader',
        label: 'Export page to Reader',
    }, exportPageToReader)
}

logseq.ready(main).catch(console.error);
