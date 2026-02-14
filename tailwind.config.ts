const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}", // Also lib for logic files that might contain classes?
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    safelist: [
        // Para MetricCard glows
        { pattern: /bg-(cyan|emerald|rose|amber|violet|slate)-400/ },
        { pattern: /text-(cyan|emerald|rose|amber|violet|slate)-400/ },
        // Bordes de alerta/highlight
        { pattern: /border-(rose|cyan)-500\/(20|30|50)/ },
        { pattern: /bg-(rose|cyan)-950\/20/ },
    ],
    plugins: [],
};
export default config;
