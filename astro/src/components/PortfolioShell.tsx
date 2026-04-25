import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import type { AdjacentProject } from "./ImageCarouselWithModal";
import ImageCarouselWithModal from "./ImageCarouselWithModal";
import ScrollReveal from "./ScrollReveal";
import { CustomCursor } from "./CustomCursor";
import { getImageSrcSet } from "../util/imageUtil";
import { extractDominantColor, dispatchBackgroundColor } from "../util/dominantColor";
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

// --- HomeView ---

interface HomeViewProps {
    projects: PhotoProject[];
    onProjectClick: (slug: string) => void;
}

const HomeView = ({ projects, onProjectClick }: HomeViewProps) => {
    return (
        <motion.div
            key="home-view"
            className="lg:w-[50vw] mx-auto"
            custom={null}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
        >
            {projects.map((project, index) => {
                const thumbnails = project.images.filter((img) => img.isThumbnail);
                if (thumbnails.length === 0) return null;

                const basePicture = thumbnails[0].image;
                const projectTitle = project.title;

                return (
                    <ScrollReveal
                        key={project.slug}
                        delay={index === 0 ? 0.95 : 0}
                        className="flex flex-col py-0.5 lg:py-1 cursor-none"
                        onPointerOver={() => {
                            CustomCursor.setCursorType({ type: "displayTitle", displayText: projectTitle })
                        }}
                        onPointerLeave={() => {
                            CustomCursor.setCursorType({ type: "default" })
                            dispatchBackgroundColor([120, 80, 180])
                        }}
                    >
                        <div className="flex justify-center items-center gap-1 lg:gap-2">
                            {thumbnails.map((thumbnailImg) => (
                                <div
                                    className="transition-all duration-300 ring-neutral-400 hover:ring-0 hover:ring-offset-3 ring-offset-neutral-800/90 overflow-hidden"
                                    key={thumbnailImg.id}
                                    onPointerEnter={() => {
                                        const tinyUrl = thumbnailImg.image.sizes?.tinyPreview?.url
                                        if (tinyUrl) {
                                            extractDominantColor(db_url + tinyUrl).then(dispatchBackgroundColor)
                                        }
                                    }}
                                >
                                    <a
                                        href={`${base_url}/projects/${project.slug}`}
                                        className="cursor-none"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onProjectClick(project.slug);
                                        }}
                                    >
                                        <img
                                            src={db_url + thumbnailImg.image.url}
                                            srcSet={getImageSrcSet(db_url, thumbnailImg)}
                                            sizes="(max-width: 768px) 100vw, 30vw"
                                            className="hover:scale-105 transition-all duration-300 select-none"
                                            alt={thumbnailImg.image.alt}
                                            height={basePicture.height}
                                            width={
                                                (basePicture.height * thumbnailImg.image.width) /
                                                thumbnailImg.image.height
                                            }
                                            loading="lazy"
                                            draggable={false}
                                        />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
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
