import { Brand } from "../definitions";

export function getImageByBrand(brand?: Brand): string {
    switch (brand) {
        case "LUUNA":
            return "https://d20pg3k5glb1vh.cloudfront.net/assets/luuna_chat_logo.png";
        case "NOOZ":
            return "https://d20pg3k5glb1vh.cloudfront.net/assets/nooz_chat_logo.png";
        case "MAPPA":
            return "https://d20pg3k5glb1vh.cloudfront.net/assets/mappa_chat_logo.png";
        case "Luuna Brasil":
            return "https://d20pg3k5glb1vh.cloudfront.net/assets/luuna_chat_logo.png";
        default:
            return "https://d20pg3k5glb1vh.cloudfront.net/assets/zebrands_chat_logo.png";
    }
}
