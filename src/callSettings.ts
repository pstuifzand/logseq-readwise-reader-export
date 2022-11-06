import '@logseq/libs'
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const callSettings = () => {
    const settings: SettingSchemaDesc[] = [
        {
            key: "accessToken",
            type: "string",
            default: "",
            description: "Get the token https://readwise.io/access_token",
            title: "Readwise Access token",
        },
        {
            key: "author",
            type: "string",
            default: "",
            description: "Add default author of the highlights, (e.g. your name)",
            title: "Author",
        },
        {
            key: "title",
            type: "string",
            default: "",
            description: "Add title of highlights book in Readwise",
            title: "Book title",
        },
    ];

    logseq.useSettingsSchema(settings);
};
