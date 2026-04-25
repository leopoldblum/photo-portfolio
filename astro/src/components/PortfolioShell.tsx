import { Fragment, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PhotoProject, ImageWrapper } from "../../../photo-cms/src/types/apiTypes";
import type { AdjacentProject } from "./ImageCarouselWithModal";
import ImageCarouselWithModal from "./ImageCarouselWithModal";
import { CustomCursor } from "./CustomCursor";
import { getImageSrcSet } from "../util/imageUtil";
import { assignLayouts, thumbsForLayout, type LayoutSpec } from "../util/layoutAssignment";
import { navigate } from "astro:transitions/client";

// --- Types ---

type HomeData = {
    view: "home";
    projects: PhotoProject[];
};

type ProjectData = {
    view: "project";
    photoProject: PhotoProject;
    prevProject: AdjacentProject;
    nextProject: AdjacentProject;
};

type ShellData = HomeData | ProjectData;

type NavDirection = "slide-next" | "slide-prev" | null;

// --- Helpers ---

const db_url = import.meta.env.PUBLIC_API_URL as string;
const base_url = import.meta.env.PUBLIC_BASE_URL as string;

function readShellData(): ShellData | null {
    const el = document.getElementById("shell-data");
    if (!el?.textContent) return null;
    try {
        return JSON.parse(el.textContent);
    } catch {
        return null;
    }
}

// --- Page transition variants ---

const pageVariants = {
    initial: (dir: NavDirection) => {
        if (dir === "slide-next") return { x: 120, opacity: 0 };
        if (dir === "slide-prev") return { x: -120, opacity: 0 };
        return { opacity: 0 };
    },
    animate: { x: 0, opacity: 1 },
    exit: (dir: NavDirection) => {
        if (dir === "slide-next") return { x: -120, opacity: 0 };
        if (dir === "slide-prev") return { x: 120, opacity: 0 };
        return { opacity: 0 };
    },
};

const pageTransition = { duration: 0.35, ease: [0.32, 0.72, 0, 1] as const };

// --- Project row ---

interface ProjectRowProps {
    project: PhotoProject;
    slots: ImageWrapper[];
    layout: LayoutSpec;
    onProjectClick: (slug: string) => void;
}

const sizesForLayout = (layout: LayoutSpec): string => {
    switch (layout.type) {
        case "hero":
        case "bleed":
            return "(max-width: 900px) 100vw, 1280px";
        case "tower":
        case "tall":
            return "(max-width: 900px) 100vw, 50vw";
        case "pair":
            return "(max-width: 900px) 100vw, 45vw";
        default:
            return "(max-width: 900px) 50vw, 25vw";
    }
};

const nativeAspect = (img: ImageWrapper): string => {
    const w = img.image.width;
    const h = img.image.height;
    if (!w || !h) return "1 / 1";
    return `${w} / ${h}`;
};

const ProjectRow = ({ project, slots, layout, onProjectClick }: ProjectRowProps) => {
    const indentClass = layout.indent !== "none" ? `indent-${layout.indent[0]}` : "";
    const className = [
        "row",
        `row--${layout.type}`,
        layout.flip && "is-flipped",
        indentClass,
    ].filter(Boolean).join(" ");

    const isCinematic = layout.type === "hero" || layout.type === "bleed";
    const rowStyle: Record<string, string> = {};
    if (isCinematic && layout.aspect !== "auto") {
        rowStyle["--row-aspect"] = layout.aspect.replace("/", " / ");
    }

    return (
        <motion.article
            className={className}
            data-slots={layout.slots}
            style={Object.keys(rowStyle).length ? (rowStyle as React.CSSProperties) : undefined}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            onPointerOver={() =>
                CustomCursor.setCursorType({ type: "displayTitle", displayText: project.title })
            }
            onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
        >
            <span className="mark-l" aria-hidden="true" />
            {isCinematic && <span className="mark-r" aria-hidden="true" />}
            {slots.map((thumb) => (
                <a
                    key={thumb.id}
                    href={`${base_url}/projects/${project.slug}`}
                    className="image cursor-none"
                    onClick={(e) => {
                        e.preventDefault();
                        onProjectClick(project.slug);
                    }}
                    style={{ "--native-aspect": nativeAspect(thumb) } as React.CSSProperties}
                >
                    <img
                        src={db_url + thumb.image.url}
                        srcSet={getImageSrcSet(db_url, thumb)}
                        sizes={sizesForLayout(layout)}
                        alt={thumb.image.alt || ""}
                        loading="lazy"
                        draggable={false}
                    />
                </a>
            ))}
            {layout.type === "tower" && (
                <div className="glyph" aria-hidden="true">
                    /<span className="dot">●</span>
                </div>
            )}
        </motion.article>
    );
};

// --- Punctuation divider ---

const PunctuationDivider = ({ hot }: { hot: boolean }) => (
    <motion.div
        className="punct"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        aria-hidden="true"
    >
        <hr />
        <div className="glyph">
            {hot ? (
                <span className="d hot" />
            ) : (
                <>
                    <span className="d" />
                    <span className="d hot" />
                    <span className="d" />
                </>
            )}
        </div>
        <hr />
    </motion.div>
);

// --- HomeView ---

interface HomeViewProps {
    projects: PhotoProject[];
    onProjectClick: (slug: string) => void;
}

const HomeView = ({ projects, onProjectClick }: HomeViewProps) => {
    const layouts = useMemo(() => assignLayouts(projects), [projects]);

    return (
        <motion.div
            key="home-view"
            className="home-stage"
            custom={null}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
        >
            {projects.map((project, i) => {
                const layout = layouts[i];
                const slots = thumbsForLayout(project, layout.slots);
                if (slots.length === 0) return null;

                const showPunct = i > 0 && i % 4 === 0;

                return (
                    <Fragment key={project.slug}>
                        {showPunct && <PunctuationDivider hot={i % 8 === 0} />}
                        <ProjectRow
                            project={project}
                            slots={slots}
                            layout={layout}
                            onProjectClick={onProjectClick}
                        />
                    </Fragment>
                );
            })}
        </motion.div>
    );
};

// --- ProjectView ---

interface ProjectViewProps {
    photoProject: PhotoProject;
    prevProject: AdjacentProject;
    nextProject: AdjacentProject;
    onSlideNavigate: (slug: string, dir: "prev" | "next") => void;
    navDirection: NavDirection;
}

const ProjectView = ({
    photoProject,
    prevProject,
    nextProject,
    onSlideNavigate,
    navDirection,
}: ProjectViewProps) => {
    return (
        <motion.div
            key={`project-${photoProject.slug}`}
            className="w-full lg:w-[65vw] mx-auto min-h-[calc(100svh-5rem)] flex flex-col justify-center"
            custom={navDirection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
        >
            <ImageCarouselWithModal
                photoProject={photoProject}
                prevProject={prevProject}
                nextProject={nextProject}
                onSlideNavigate={onSlideNavigate}
            />
        </motion.div>
    );
};

// --- PortfolioShell ---

const PortfolioShell = () => {
    const [currentView, setCurrentView] = useState<ShellData | null>(() => readShellData());
    const [navDirection, setNavDirection] = useState<NavDirection>(null);

    const pendingDirection = useRef<NavDirection>(null);

    useEffect(() => {
        const onAfterSwap = () => {
            const data = readShellData();
            if (!data) {
                pendingDirection.current = null;
                setNavDirection(null);
                setCurrentView(null);
                return;
            }

            const dir = pendingDirection.current;
            pendingDirection.current = null;

            if (data.view === "project") {
                window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
            }

            setNavDirection(dir);
            setCurrentView(data);
        };

        document.addEventListener("astro:after-swap", onAfterSwap);
        return () => document.removeEventListener("astro:after-swap", onAfterSwap);
    }, []);

    const onProjectClick = useCallback((slug: string) => {
        pendingDirection.current = null;
        navigate(`/projects/${slug}`);
    }, []);

    const onSlideNavigate = useCallback((slug: string, dir: "prev" | "next") => {
        pendingDirection.current = dir === "next" ? "slide-next" : "slide-prev";
        navigate(`/projects/${slug}`);
    }, []);

    if (!currentView) return null;

    return (
        <div className="relative mx-auto w-full">
            <AnimatePresence mode="popLayout" custom={navDirection} initial={false}>
                {currentView.view === "home" ? (
                    <HomeView
                        key="home"
                        projects={currentView.projects}
                        onProjectClick={onProjectClick}
                    />
                ) : (
                    <ProjectView
                        key={`project-${currentView.photoProject.slug}`}
                        photoProject={currentView.photoProject}
                        prevProject={currentView.prevProject}
                        nextProject={currentView.nextProject}
                        onSlideNavigate={onSlideNavigate}
                        navDirection={navDirection}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortfolioShell;
