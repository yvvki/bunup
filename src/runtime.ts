(() => {
    if (typeof Bun === 'undefined') {
        console.error(
            'Bunup requires Bun to run.\nTo install Bun, visit https://bun.sh/docs/installation',
        );
        process.exit(1);
    }
})();
