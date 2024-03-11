import { create } from "state-local";

const [getState, setState] = create({});

const init = () => {
    const state = getState()
};

const config = () => {};

export { init, config };