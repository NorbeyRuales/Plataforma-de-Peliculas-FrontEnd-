export type ID = string
export interface Movie{_id:ID;title:string;year:number;genres:string[];posterUrl?:string;backdropUrl?:string;description?:string;durationMin?:number;avgRating?:number;sources?:{label:string;url:string;subtitles?:string[]}[]}
export interface User{_id:ID;name:string;email:string;avatarUrl?:string;token?:string}
export interface Rating{_id:ID;movieId:ID;userId:ID;stars:number;comment?:string}
export interface Favorite{_id:ID;movieId:ID;userId:ID;createdAt:string}
