export interface Album{
    id: number;
    artistId: number;
    name: string;
    artistName?: string;
    songCount?: string;
    coverImage?: Buffer;
    coverImageBase64?:string;
}