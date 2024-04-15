import { Brand } from "../definitions";

export function getImageByBrand(brand?: Brand): string {
    switch (brand) {
        case "LUUNA":
            return "https://downloads.intercomcdn.com/i/o/61429/6b1e107a4d1dfd16d5a9f8a8/b918b06f1fc2411ee537e3bca0ed5c1d.png";
        case "NOOZ":
            return "https://downloads.intercomcdn.com/i/o/430844/3d0c618ff29004506dcee2dc/b48f693024b01a4af2cc413df8b804b8.png";
        case "MAPPA":
            return "https://downloads.intercomcdn.com/i/o/430846/44ecc22714a0fcc5635910e6/412323f74c30ff3b1b47a4ebcf0f8d1a.png";
        case "LUUNA_BRAZIL":
            return "https://downloads.intercomcdn.com/i/o/61429/6b1e107a4d1dfd16d5a9f8a8/b918b06f1fc2411ee537e3bca0ed5c1d.png";
        default:
            return "https://zebrands.mx/wp-content/uploads/2021/07/WEB-ZEB-05-1-1024x291.png";
    }
}
