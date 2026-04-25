import type { PhotoProject, ImageWrapper } from "../../../photo-cms/src/types/apiTypes";

export type LayoutType =
    | "hero"
    | "bleed"
    | "tower"
    | "tall"
    | "pair"
    | "overlap"
    | "small-cluster"
    | "cluster"
    | "right-cluster"
    | "strip";

export type LayoutSpec = {
    type: LayoutType;
    flip: boolean;
    indent: "none" | "left" | "right";
    aspect: string;
    slots: number;
    seed: number;
};

type Orientation = "portrait" | "landscape" | "square";

// Deterministic 32-bit hash of a string. Same slug → same layout, every load.
function hashString(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

function orientationOf(img: ImageWrapper): Orientation {
    const w = img.image.width;
    const h = img.image.height;
    if (!w || !h) return "landscape";
    const r = w / h;
    if (r > 1.1) return "landscape";
    if (r < 0.9) return "portrait";
    return "square";
}

function getThumbs(project: PhotoProject): ImageWrapper[] {
    const flagged = project.images.filter((i) => i.isThumbnail);
    return flagged.length > 0 ? flagged : project.images.slice(0, 1);
}

// Pool of candidate layout types given thumbnail count + primary orientation.
function poolFor(count: number, primary: Orientation): LayoutType[] {
    if (count <= 1) {
        return primary === "portrait"
            ? ["tower", "tall", "hero"]
            : ["hero", "bleed"];
    }
    if (count === 2) return ["pair", "overlap", "small-cluster"];
    if (count === 3) return ["cluster", "right-cluster"];
    if (count <= 6) return ["strip", "right-cluster"];
    return ["strip"];
}

function pickAspect(type: LayoutType, seed: number): string {
    switch (type) {
        case "hero":
            return ["16/9", "18/9", "21/9"][seed % 3];
        case "bleed":
            return ["20/9", "21/9", "24/9"][seed % 3];
        case "tower":
        case "tall":
            return ["3/4", "4/5"][seed % 2];
        default:
            return "auto";
    }
}

function pickIndent(seed: number): "none" | "left" | "right" {
    return (["none", "left", "right"] as const)[seed % 3];
}

function slotCountFor(type: LayoutType, available: number, seed: number): number {
    switch (type) {
        case "hero":
        case "bleed":
        case "tower":
        case "tall":
            return 1;
        case "pair":
        case "overlap":
        case "small-cluster":
            return 2;
        case "cluster":
            return 3;
        case "right-cluster":
            return Math.min(available, 3 + (seed % 2)); // 3 or 4
        case "strip":
            return Math.min(available, 4 + (seed % 4)); // 4–7
    }
}

/**
 * Assign a deterministic layout to each project based on its content + position
 * + the previous project's layout. Avoids back-to-back repeats and forces a
 * wide bleed every 5th project for rhythm.
 */
export function assignLayouts(projects: PhotoProject[]): LayoutSpec[] {
    const result: LayoutSpec[] = [];
    let prev: LayoutSpec | null = null;

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const thumbs = getThumbs(project);
        const count = thumbs.length;
        const seed = hashString(project.slug);
        const primary = orientationOf(thumbs[0]);

        let type: LayoutType;

        // First project is always an entrance moment.
        if (i === 0) {
            type = primary === "portrait" ? "tower" : (seed % 2 === 0 ? "hero" : "bleed");
        }
        // Force a wide bleed every 5th to break the rhythm.
        else if (i % 5 === 0) {
            type = primary === "portrait" ? "tower" : "bleed";
        } else {
            const pool = poolFor(count, primary);
            const filtered = prev ? pool.filter((t) => t !== prev!.type) : pool;
            const candidates = filtered.length > 0 ? filtered : pool;
            type = candidates[seed % candidates.length];
        }

        const flip = (seed >> 3) % 2 === 0;
        const indent = pickIndent(seed >> 5);
        const aspect = pickAspect(type, seed >> 7);
        const slots = slotCountFor(type, count, seed);

        const spec: LayoutSpec = { type, flip, indent, aspect, slots, seed };
        result.push(spec);
        prev = spec;
    }

    return result;
}

export function thumbsForLayout(project: PhotoProject, slots: number): ImageWrapper[] {
    return getThumbs(project).slice(0, slots);
}
