import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    tag: string;
    url: string;
    title: string;
    createdAt: bigint;
}
export interface backendInterface {
    addVideo(title: string, url: string, tag: string): Promise<Video>;
    deleteVideo(id: bigint): Promise<void>;
    getVideos(): Promise<Array<Video>>;
}
