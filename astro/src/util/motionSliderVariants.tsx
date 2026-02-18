export const imageCarouselSliderVariants = {
    incoming: (direction: number) => ({
        x: direction > 0 ? 200 : -200,
        opacity: 0
    }),
    active: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -200 : 200,
        opacity: 0
    })
};

export const adjacentCardVariants = {
    incoming: (direction: number) => ({
        x: direction > 0 ? 120 : -120,
        opacity: 0,
        scale: 0.97,
    }),
    active: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -120 : 120,
        opacity: 0,
        scale: 0.97,
    })
};
