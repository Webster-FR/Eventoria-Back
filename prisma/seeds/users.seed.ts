import {CipherService} from "../../src/modules/misc/cipher.service";

const cipherService = new CipherService();

export default async() => [
    {
        username: "root",
        email: "admin@dotslash.fr",
        admin: true,
        password: await cipherService.hash("root"),
        verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
    }
];
