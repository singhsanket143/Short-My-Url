import { router } from "./context";
import { urlRouter } from "./url";

export const trpcRouter = router({
    url: urlRouter,
})