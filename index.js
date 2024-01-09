import '@logseq/libs';
import {callSettings} from "./src/callSettings"
import extractUrls from "./src/extractUrls";

const main = async () => {
    callSettings()

    let sendDataToReader = (data, accessToken) => {
        return fetch('https://readwise.io/api/v3/save/', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + accessToken,
            },
            body: JSON.stringify(data)
        })
    }

    const accessTokenMiddleware = (f) => {
        return async (e) => {
            const {accessToken} = logseq.settings
            if (!accessToken) {
                setTimeout(() => logseq.UI.showMsg('First fill in Readwise access token in plugin settings', 'error'), 1)
                return
            }
            return await f(e)
        }
    }

    let exportUrlToReader = async (e) => {
        const {accessToken} = logseq.settings

        if (!e.uuid) {
            e = await logseq.Editor.getCurrentBlock()
        }

        const block = await logseq.Editor.getBlock(e.uuid)

        const urls = extractUrls(block.content)

        if (urls.length === 0) {
            setTimeout(() => logseq.UI.showMsg('No urls found in block', 'error'), 1)
            return
        }

        const data = {
            url: urls[0]
        }

        await sendDataToReader(data, accessToken)
            .then(response => response.json())
            .then(data => {
                console.log("Save URL to Reader", data);
                return data
            })
            .then(() => {
                setTimeout(() => logseq.UI.showMsg('URL saved in Reader', 'success'), 1)
            })
            .catch(e => {
                console.error(e)
                setTimeout(() => logseq.UI.showMsg('Saving of URL failed: ' + e, 'error'), 1)
            })
    }

    let exportPageToReader = async (e) => {
        const {accessToken, author} = logseq.settings
        const page = await logseq.Editor.getCurrentPage()
        const pageBlocks = await logseq.Editor.getPageBlocksTree(page.originalName)
        const pageContent = pageBlocks.map(value => {
            return "<p>" + value.content + "</p>"
        }).join("\n\n")

        const graphName = (await logseq.App.getCurrentGraph()).name
        const data = {
            // url: 'logseq://graph/'+encodeURIComponent(graphName)+'?page='+encodeURIComponent(page.originalName),
            url: 'https://example.com/', // FIXME: use logseq:// url when it's supported
            html: pageContent,
            author,
            title: page.originalName,
        }
        try {
            const response = await sendDataToReader(data, accessToken)
                .then(response => response.json())
            console.log("Export to Reader", response)
            const properties = pageBlocks[0].properties;
            if (properties && Object.keys(properties).length && properties.constructor === Object) {
                await logseq.Editor.upsertBlockProperty(pageBlocks[0].uuid, "readwise-url", response.url)
            } else {
                await logseq.Editor.prependBlockInPage(page.name, "", {
                    properties: {
                        "readwise-url": response.url
                    }
                })
            }

            setTimeout(() => logseq.UI.showMsg('Page exported', 'success'), 1)
        } catch (e) {
            console.error(e)
            setTimeout(() => logseq.UI.showMsg('Export of page failed: ' + e, 'error'), 1)
        }
    }

    let exportHighlightToReadwise = async (e) => {
        const {accessToken, author, title} = logseq.settings
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

    const fetchDailyReview = async (e) => {
        const {accessToken} = logseq.settings
        console.log("Fetching daily review", e)
        const result = await fetch('https://readwise.io/api/v2/review/', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + accessToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log("Fetched daily review", data);
                return data
            })

        // Insert data into current page
        await logseq.Editor.insertBatchBlock(e.uuid, [
            {
                content: "#[[Daily Review]]\nreview-url:: " + result.review_url + "\n",
                children: result.highlights.map(highlight => {
                    let properties = {
                        'author': '[[' + highlight.author + ']]',
                        'source': '[[' + highlight.title + ' (highlights)]]',
                    };
                    if (highlight.note) {
                        properties['note'] = highlight.note
                    }
                    if (highlight.highlight_url) {
                        properties['highlight-url'] = highlight.highlight_url
                    }
                    return {
                        content: highlight.text,
                        properties: properties
                    }
                })
            },
        ])
    };

    logseq.Editor.registerBlockContextMenuItem('Export as highlight to Readwise', accessTokenMiddleware(exportHighlightToReadwise))
    logseq.Editor.registerSlashCommand('Export as highlight to Readwise', accessTokenMiddleware(exportHighlightToReadwise))
    logseq.Editor.registerBlockContextMenuItem('Save URL to Reader', accessTokenMiddleware(exportUrlToReader))
    logseq.Editor.registerSlashCommand('Fetch daily review', accessTokenMiddleware(fetchDailyReview))

    logseq.App.registerCommandPalette({
        key: 'export-page-to-reader',
        label: 'Export page to Reader',
    }, accessTokenMiddleware(exportPageToReader))

    logseq.App.registerCommandPalette({
        key: 'save-url-to-reader',
        label: 'Save URL to Reader',
    }, accessTokenMiddleware(exportUrlToReader))

    logseq.App.registerCommandPalette({
        key: 'fetch-daily-review',
        label: 'Fetch daily review',
    }, accessTokenMiddleware(fetchDailyReview))
}

logseq.ready(main).catch(console.error);
