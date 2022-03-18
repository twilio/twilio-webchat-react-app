const logInterimAction = (...strings) => {
    console.log("  --  ", ...strings);
};

const logInitialAction = (...strings) => {
    console.log("⏱ ", ...strings);
};

const logFinalAction = (...strings) => {
    console.log("✅  ", ...strings);
};

module.exports = { logInterimAction, logFinalAction, logInitialAction };
