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
