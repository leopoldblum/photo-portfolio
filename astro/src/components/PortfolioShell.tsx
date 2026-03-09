import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import type { AdjacentProject } from "./ImageCarouselWithModal";
import ImageCarouselWithModal from "./ImageCarouselWithModal";
import ScrollReveal from "./ScrollReveal";
import { CustomCursor } from "./CustomCursor";
import { getImageSrcSet } from "../util/imageUtil";
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

// --- Layout patterns for editorial homepage ---

type LayoutSlot = {
  className: string;
  sizeHint: string;
};

type LayoutPattern = {
  gridClassName: string;
  offsetClassName: string;
  slots: LayoutSlot[];
};

const LAYOUT_PATTERNS: LayoutPattern[] = [
  // Pattern A — Left-heavy
  {
    gridClassName: "grid-cols-[3fr_2fr]",
    offsetClassName: "lg:pr-[6vw]",
    slots: [
      { className: "row-span-2", sizeHint: "(max-width: 1024px) 100vw, 45vw" },
      { className: "", sizeHint: "(max-width: 1024px) 100vw, 25vw" },
      { className: "", sizeHint: "(max-width: 1024px) 100vw, 25vw" },
    ],
  },
  // Pattern B — Right-heavy
  {
    gridClassName: "grid-cols-[2fr_3fr]",
    offsetClassName: "lg:pl-[6vw]",
    slots: [
      { className: "", sizeHint: "(max-width: 1024px) 100vw, 25vw" },
      { className: "row-span-2", sizeHint: "(max-width: 1024px) 100vw, 45vw" },
      { className: "", sizeHint: "(max-width: 1024px) 100vw, 25vw" },
    ],
  },
  // Pattern C — Wide hero + split below
  {
    gridClassName: "grid-cols-2",
    offsetClassName: "lg:pr-[6vw]",
    slots: [
      { className: "col-span-2", sizeHint: "(max-width: 1024px) 100vw, 70vw" },
      { className: "", sizeHint: "(max-width: 1024px) 100vw, 35vw" },
      { className: "", sizeHint: "(max-width: 1024px) 100vw, 35vw" },
    ],
  },
];

// --- HomeView ---

interface HomeViewProps {
  projects: PhotoProject[];
  onProjectClick: (slug: string) => void;
}

interface ThumbnailImageProps {
  thumbnailImg: PhotoProject["images"][number];
  project: PhotoProject;
  onProjectClick: (slug: string) => void;
  sizeHint: string;
}

const ThumbnailImage = ({
  thumbnailImg,
  project,
  onProjectClick,
  sizeHint,
}: ThumbnailImageProps) => (
  <div className="transition-all duration-300 ring-neutral-400 hover:ring-0 hover:ring-offset-3 ring-offset-neutral-800/90 overflow-hidden">
    <a
      href={`${base_url}/projects/${project.slug}`}
      className="cursor-none block"
      onClick={(e) => {
        e.preventDefault();
        onProjectClick(project.slug);
      }}
    >
      <img
        src={db_url + thumbnailImg.image.url}
        srcSet={getImageSrcSet(db_url, thumbnailImg)}
        sizes={sizeHint}
        className="w-full h-auto max-h-[75vh] object-contain hover:scale-105 transition-all duration-300 select-none"
        alt={thumbnailImg.image.alt}
        width={thumbnailImg.image.width}
        height={thumbnailImg.image.height}
        loading="lazy"
        draggable={false}
      />
    </a>
  </div>
);

const HomeView = ({ projects, onProjectClick }: HomeViewProps) => {
  return (
    <motion.div
      key="home-view"
      className="lg:w-[65vw] mx-auto"
      custom={null}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {projects.map((project, projectIndex) => {
        const thumbnails = project.images.filter((img) => img.isThumbnail);
        if (thumbnails.length === 0) return null;

        const projectTitle = project.title;
        const pattern = LAYOUT_PATTERNS[projectIndex % 3];

        // Mobile: limit to 2 thumbnails
        const mobileThumbnails = thumbnails.slice(0, 2);

        return (
          <ScrollReveal
            key={project.slug}
            className="flex flex-col py-3 lg:py-6 cursor-none"
            onPointerOver={() =>
              CustomCursor.setCursorType({
                type: "displayTitle",
                displayText: projectTitle,
              })
            }
            onPointerLeave={() =>
              CustomCursor.setCursorType({ type: "default" })
            }
          >
            {thumbnails.length === 1 ? (
              /* Single thumbnail — alternating offset */
              <div
                className={`w-full ${
                  projectIndex % 2 === 0
                    ? "lg:w-[45%] lg:mr-auto"
                    : "lg:w-[45%] lg:ml-auto"
                }`}
              >
                <ThumbnailImage
                  thumbnailImg={thumbnails[0]}
                  project={project}
                  onProjectClick={onProjectClick}
                  sizeHint="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <>
                {/* Mobile layout — stacked */}
                <div className="flex flex-col gap-1 lg:hidden">
                  {mobileThumbnails.map((thumbnailImg) => (
                    <ThumbnailImage
                      key={thumbnailImg.id}
                      thumbnailImg={thumbnailImg}
                      project={project}
                      onProjectClick={onProjectClick}
                      sizeHint="100vw"
                    />
                  ))}
                </div>

                {/* Desktop layout — editorial grid */}
                <div
                  className={`hidden lg:grid ${pattern.gridClassName} ${pattern.offsetClassName} gap-2`}
                >
                  {pattern.slots.map((slot, slotIndex) => {
                    if (slotIndex >= thumbnails.length) return null;

                    // Last slot: if there are overflow thumbnails, stack them
                    const isLastSlot = slotIndex === pattern.slots.length - 1;
                    const hasOverflow =
                      isLastSlot && thumbnails.length > pattern.slots.length;

                    if (hasOverflow) {
                      const overflowThumbs = thumbnails.slice(slotIndex);
                      return (
                        <div
                          key={slotIndex}
                          className={`${slot.className} flex flex-col gap-2`}
                        >
                          {overflowThumbs.map((thumbnailImg) => (
                            <ThumbnailImage
                              key={thumbnailImg.id}
                              thumbnailImg={thumbnailImg}
                              project={project}
                              onProjectClick={onProjectClick}
                              sizeHint={slot.sizeHint}
                            />
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div key={slotIndex} className={slot.className}>
                        <ThumbnailImage
                          thumbnailImg={thumbnails[slotIndex]}
                          project={project}
                          onProjectClick={onProjectClick}
                          sizeHint={slot.sizeHint}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
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
  const [currentView, setCurrentView] = useState<ShellData | null>(() =>
    readShellData(),
  );
  const [navDirection, setNavDirection] = useState<NavDirection>(null);

  const pendingDirection = useRef<NavDirection>(null);

  useEffect(() => {
    const onAfterSwap = () => {
      const data = readShellData();
      if (!data) return;

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
